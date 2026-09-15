
// medicos_realtime_override.js â€” Lista de mÃ©dicos 100% en tiempo real desde Firestore
// Sobrescribe initMedicos/applyMedFilters/render usando la misma API global del index.

(function(){
  // Esperar a que el DOM y las funciones del index estÃ©n listas
  function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(init);

  async function init(){
    try{
      // Esperar a que firebase_init.js ya haya creado la app
      let attempts = 0;
      while (!window.firebaseApp || !window.firebaseDb) {
        if (++attempts > 40) throw new Error('Firebase no inicializÃ³ en tiempo');
        await new Promise(r => setTimeout(r, 250));
      }
      const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
      const app = window.firebaseApp;
      window.firebaseApp = app;
      const db  = window.firebaseDb;
      window.firebaseDb = db;

      const tbMed = document.querySelector('#tableMedicos tbody');
      const badge = document.getElementById('medCount');

      // FunciÃ³n para homologar nombres de KAMs con diferentes escrituras
      window.normalizeKAM = function(kamRaw) {
        if (!kamRaw) return '';
        // Limpiar espacios invisibles y mÃºltiples espacios
        let cleanKam = kamRaw.replace(/\s+/g, ' ').trim();
        const lower = cleanKam.toLowerCase();
        
        if (lower.includes('america') || lower.includes('amÃ©rica')) return 'AMÃ‰RICA GÃ“MEZ';
        if (lower.includes('berenice')) return 'BERENICE ORDAZ';
        if (lower.includes('dayan')) return 'DAYANA'; // atrapa dayan y dayana
        if (lower.includes('alain')) return 'DR. ALAIN RAMÃREZ';
        if (lower.includes('anayely') || lower.includes('anayeli')) return 'ANAYELY TAPIA';
        if (lower.includes('raymundo')) return 'RAYMUNDO ACUÃ‘A';
        if (lower.includes('alexis')) return 'ALEXIS';
        if (lower.includes('leonel')) return 'LEONEL CASTILLEJOS';
        if (lower.includes('manuel')) return 'MANUEL AGUIRRE';
        if (lower.includes('maricarmen')) return 'CLAUDIA';
        if (lower.includes('claudia')) return 'CLAUDIA';
        if (lower.includes('david')) return 'DAVID SANTIAGO';
        if (lower.includes('oscar')) return 'OSCAR RANGEL';
        if (lower.includes('marymar')) return 'MARYMAR';
        if (lower.includes('efrain') || lower.includes('efraÃ­n')) return 'EFRAIN';
        
        // Si no coincide con las reglas principales, lo retorna en mayÃºsculas limpiando espacios
        return cleanKam.toUpperCase();
      };

      // FunciÃ³n para normalizar cada doc -> fila compatible con el render del index
      
      function adapt(doc){
        // doc is a QueryDocumentSnapshot
        const r = doc.data() || {};
        return {
          id: doc.id || r.id || '',
          // nombres de columnas para UI anterior (compatibilidad)
          'Nombre': r.Nombre || r.nombre || r.name || '',
          'TelÃ©fono': r.TelÃ©fono || r.telefono || r.tel || '',
          'DirecciÃ³n': r.DirecciÃ³n || r.Direccion || r.direccion || '',
          'Hospital': r.Hospital || r.hospital || '',
          'Red Social': r['Red Social'] || r.redSocial || r.red || '',
          'Especialidad': r.Especialidad || r.especialidad || '',
          'Base': r.Base || r.base || '',
          'Estado': r.Estado || r.estado || '',
          'RegiÃ³n': r.RegiÃ³n || r.Region || r.region || '',
          'GERENTE/KAM': window.normalizeKAM(r['GERENTE/KAM'] || r.KAM || r.kam || ''),
          createdAt: r.createdAt || null,
          updatedAt: r.updatedAt || r.lastUpdatedAt || null
        };
      }

      // Sobrescribir initMedicos para que use Firestore en tiempo real
      window.initMedicos = function(){
        // Limpia UI mientras llega el primer snapshot
        if (tbMed) tbMed.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding: 40px">Cargando desde Firestoreâ€¦</td></tr>';
        
        // ðŸš€ SuscripciÃ³n global a seguimientos para el Kanban y KPIs (CollectionGroup)
        try {
          const segQ = fsMod.query(fsMod.collectionGroup(db, "seguimientos"));
          fsMod.onSnapshot(segQ, (snap) => {
            window.__hist_cache__ = snap.docs.map(d => {
              const data = d.data();
              const medId = d.ref.parent.parent ? d.ref.parent.parent.id : '';
              let medName = '';
              if (window.MED_BASE) {
                const docMed = window.MED_BASE.find(m => m.id === medId);
                if (docMed) medName = docMed['Nombre'] || docMed.nombre || '';
              }
              return {
                id: d.id,
                medico: medName,
                medicoId: medId,
                estado: data.estado,
                fecha: (data.createdAt && data.createdAt.toDate) ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                kam: window.normalizeKAM(data.kam),
                comentario: data.comentarios || data.comentario
              };
            });
            if (window.initDashboard) window.initDashboard(); // Actualizar dashboard
          });
        } catch(e) {
          console.warn('CollectionGroup seguimientos fallÃ³ (posible index o regla):', e);
        }

        // SuscripciÃ³n en tiempo real a mÃ©dicos
        const q = fsMod.query(fsMod.collection(db, "clientes"));
        fsMod.onSnapshot(q, (snap)=>{
          // Construye la base global para filtros/exports
          window.MED_BASE = snap.docs.map(doc => adapt(doc));
          const sortSel = document.querySelector('#sortOrder');
          const order = (sortSel && sortSel.value) || 'desc';
          window.MED_BASE.sort((a,b)=>{
            const ta = (a.createdAt && a.createdAt.toDate) ? a.createdAt.toDate().getTime() : (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0);
            const tb = (b.createdAt && b.createdAt.toDate) ? b.createdAt.toDate().getTime() : (b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0);
            return order==='asc' ? (ta - tb) : (tb - ta);
          });
          // Actualiza badge
          if (badge) badge.textContent = (window.MED_BASE.length || 0) + ' mÃ©dicos';

          // Hidratar filtros (Estado, RegiÃ³n, KAM) desde Firestore
          try {
            const distinct = (arr) => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>(''+a).localeCompare((''+b),'es',{sensitivity:'base'}));
            const estados = distinct(window.MED_BASE.map(r=> r.Estado || r.estado || ''));
            const regiones= distinct(window.MED_BASE.map(r=> r.RegiÃ³n || r.Region || r.region || ''));
            const HIDDEN_KAMS = new Set([
              'ALEXIS', 'AMÃ‰RICA GÃ“MEZ', 'AMERICA GOMEZ', 'EFRAIN',
              'JOAN SERRANO', 'KAM@EMPRESA.COM', 'LEONEL CASTILLEJOS',
              'MANUEL AGUIRRE', 'MONICA', 'MÃ“NICA', 'RAYMUNDO ACUÃ‘A'
            ]);
            const kams    = distinct(window.MED_BASE.map(r => r['GERENTE/KAM'] || r.KAM || r.kam || ''))
                              .filter(k => !HIDDEN_KAMS.has(k.toUpperCase()));
            const fEstado = document.querySelector('#fEstado');
            const fRegion = document.querySelector('#fRegion');
            const fKam    = document.querySelector('#fKam');
            if (fEstado) {
              const sel = fEstado.value || '';
              fEstado.innerHTML = '<option value="">Estado (todos)</option>' + estados.map(v=>`<option>${v}</option>`).join('');
              if (sel) fEstado.value = sel;
            }
            if (fRegion) {
              const sel = fRegion.value || '';
              fRegion.innerHTML = '<option value="">RegiÃ³n (todas)</option>' + regiones.map(v=>`<option>${v}</option>`).join('');
              if (sel) fRegion.value = sel;
            }
            if (fKam) {
              const sel = fKam.value || '';
              fKam.innerHTML = '<option value="">KAM (todos)</option>' + kams.map(v=>`<option>${v}</option>`).join('');
              if (sel) fKam.value = sel;
            }
          } catch(_) {}

          // Reaplica filtros y render
          // TambiÃ©n exponemos una API de render y filtros robusta (override)
          window.applyMedFilters = function(){
            const $ = (s)=>document.querySelector(s);
            const qMed = $('#qMed'), fEstado=$('#fEstado'), fRegion=$('#fRegion'), fKam=$('#fKam');
            const norm = v => String(v||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
            const q = norm(qMed?.value||'');
            let base = Array.isArray(window.MED_BASE) ? window.MED_BASE.slice() : [];
            if(q){
              base = base.filter(r => [r['Nombre'], r['TelÃ©fono'], r['DirecciÃ³n'], r['Hospital'],
                r['Red Social'], r['Especialidad'], r['Base'], r['Estado'], r['RegiÃ³n'], r['GERENTE/KAM']]
                .some(v => norm(v).includes(q)));
            }
            const est = (fEstado?.value||'').trim();
            const reg = (fRegion?.value||'').trim();
            const kam = (fKam?.value||'').trim();
            if(est) base = base.filter(r => String(r['Estado']||'')===est);
            if(reg) base = base.filter(r => String(r['RegiÃ³n']||'')===reg);
            if(kam) base = base.filter(r => String(r['GERENTE/KAM']||'')===kam);
            window.MED_FILT = base;
            if(typeof window.renderMedicos==='function') window.renderMedicos();
          };

          window.renderMedicos = function(){
            const $ = (s)=>document.querySelector(s);
            const tbMed = $('#tableMedicos tbody'); const pageInfo=$('#pageInfoMed'); const pageSel=$('#pageSizeMed');
            let arr = Array.isArray(window.MED_FILT)&&window.MED_FILT.length? window.MED_FILT : (window.MED_BASE||[]);
            const sortSel = document.querySelector('#sortOrder');
            const order = (sortSel && sortSel.value) || 'desc';
            arr = arr.slice().sort((a,b)=>{
              const ta = (a.createdAt && a.createdAt.toDate) ? a.createdAt.toDate().getTime() : (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0);
              const tb = (b.createdAt && b.createdAt.toDate) ? b.createdAt.toDate().getTime() : (b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0);
              return order==='asc' ? (ta - tb) : (tb - ta);
            });
            const size = parseInt(pageSel?.value||'20',10); const total = arr.length; const pages=Math.max(1,Math.ceil(total/size));
            window.medPage = Math.min(window.medPage||1, pages);
            const start = (window.medPage-1)*size; const slice = arr.slice(start, start+size);
            if(tbMed){
                            tbMed.innerHTML = slice.map(r=>{
                const id = r.id || '';
                const nombre = r['Nombre']||r.nombre||'—';
                const empresa = r['Empresa']||r.empresa||'—';
                const rol = r['Rol']||r.rol||'—';
                const initial = nombre.charAt(0).toUpperCase() || 'C';
                return `<tr>
                  <td>
                    <div class="name-cell">
                      <div class="avatar">${initial}</div>
                      <div>
                        <div class="font-semibold">${nombre}</div>
                        <div class="text-xs text-muted">${r['Base'] || r.base || 'Sin base'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="font-semibold">${empresa}</div>
                    <div class="text-xs text-muted">${rol}</div>
                  </td>
                  <td>
                    <div class="font-semibold">${r['Telefono'] || r.telefono || '—'}</div>
                    <div class="text-xs text-muted truncate" style="max-width:150px">${r['Red Social'] || r.redSocial || '—'}</div>
                  </td>
                  <td>
                    <div class="font-semibold">${r['Estado'] || r.estado || '—'}</div>
                    <div class="text-xs text-muted">${r['Region'] || r.region || '—'}</div>
                  </td>
                  <td class="action-cell">
                    <button class="btn btn-ghost btn-sm btn-followup btn-seg" data-id="${id}" data-nombre="${nombre}">Seguimiento</button>
                  </td>
                </tr>`;
              }).join('');
              
              // enganchar seguimiento si el de old layout lo necesitaba, aunque followup_simple se encarga por timer
              tbMed.querySelectorAll('.btn-seg').forEach(b=> b.addEventListener('click', ()=> {
                const id=b.getAttribute('data-id')||''; const nombre=b.getAttribute('data-nombre')||'';
                try{ window.openSeguimiento?.(id); }catch(_){}
              }));
              
              // enganchar PubMed
              tbMed.querySelectorAll('.btn-pubmed').forEach(b=> b.addEventListener('click', ()=> {
                const nombre=b.getAttribute('data-nombre')||'';
                try{ window.openPubMedModal?.(nombre); }catch(_){}
              }));
            }
            if(pageInfo) pageInfo.textContent = `Mostrando ${slice.length} de ${total} â€” PÃ¡gina ${window.medPage}/${pages}`;
            
            // ðŸš€ Actualizar Dashboard KPIs y Kanban
            if (window.initDashboard) window.initDashboard();
          };

          // Listeners
          try{
            ['#qMed','#fEstado','#fRegion','#fKam'].forEach(sel=>{
              const el=document.querySelector(sel); el && el.addEventListener('input', ()=>{ window.medPage=1; window.applyMedFilters(); });
              el && el.addEventListener('change', ()=>{ window.medPage=1; window.applyMedFilters(); });
            });
            document.querySelector('#pageSizeMed')?.addEventListener('change', ()=> window.renderMedicos());
            document.querySelector('#prevMed')?.addEventListener('click', ()=>{ window.medPage=Math.max(1,(window.medPage||1)-1); window.renderMedicos(); });
            document.querySelector('#nextMed')?.addEventListener('click', ()=>{ window.medPage=(window.medPage||1)+1; window.renderMedicos(); });
            
            // Exportar a CSV / Excel
            const getExportData = () => {
              const data = Array.isArray(window.MED_FILT) && window.MED_FILT.length ? window.MED_FILT : (window.MED_BASE || []);
              return data.map(r => ({
                'Nombre': r['Nombre'] || r.nombre || '',
                'Base': r['Base'] || r.base || '',
                'TelÃ©fono': r['TelÃ©fono'] || r.telefono || r.tel || '',
                'DirecciÃ³n': r['DirecciÃ³n'] || r.direccion || '',
                'Hospital': r['Hospital'] || r.hospital || '',
                'Especialidad': r['Especialidad'] || r.especialidad || '',
                'Estado': r['Estado'] || r.estado || '',
                'RegiÃ³n': r['RegiÃ³n'] || r.Region || r.region || '',
                'KAM': r['GERENTE/KAM'] || r.kam || ''
              }));
            };
            
            document.querySelector('#downloadMedCSV')?.addEventListener('click', () => {
              const data = getExportData();
              if(!data.length) { alert('No hay datos para exportar.'); return; }
              const header = Object.keys(data[0]).join(',');
              const csv = [header].concat(data.map(row => Object.values(row).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))).join('\n');
              const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'directorio_medicos.csv'; a.click();
              URL.revokeObjectURL(url);
            });
            
            document.querySelector('#downloadMedXLSX')?.addEventListener('click', () => {
              if (typeof XLSX === 'undefined') { alert('LibrerÃ­a XLSX no cargada'); return; }
              const data = getExportData();
              if(!data.length) { alert('No hay datos para exportar.'); return; }
              const ws = XLSX.utils.json_to_sheet(data);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "MÃ©dicos");
              XLSX.writeFile(wb, "directorio_medicos.xlsx");
            });
            
          }catch(e){
            console.error('Error bindeando listeners:', e);
          }

          const _sortSel = document.querySelector('#sortOrder'); if(_sortSel){ _sortSel.addEventListener('change', ()=>{ try{ window.renderMedicos(); }catch(_){}}); }
if (typeof window.applyMedFilters === 'function'){
            try { window.applyMedFilters(); } catch(_){}
          } else if (typeof window.renderMedicos === 'function'){
            try { window.renderMedicos(); } catch(_){}
          }
        });
      };

      // Fuerza lectura desde servidor (para el botÃ³n "Refrescar")
      window.forceMedicosFromServer = async function(){
        const col = fsMod.collection(db, "clientes");
        const snap = await fsMod.getDocs(col);
        window.MED_BASE = snap.docs.map(doc => adapt(doc));
          const sortSel = document.querySelector('#sortOrder');
          const order = (sortSel && sortSel.value) || 'desc';
          window.MED_BASE.sort((a,b)=>{
            const ta = (a.createdAt && a.createdAt.toDate) ? a.createdAt.toDate().getTime() : (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0);
            const tb = (b.createdAt && b.createdAt.toDate) ? b.createdAt.toDate().getTime() : (b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0);
            return order==='asc' ? (ta - tb) : (tb - ta);
          });
        if (badge) badge.textContent = (window.MED_BASE.length || 0) + ' mÃ©dicos';
        const _sortSel = document.querySelector('#sortOrder'); if(_sortSel){ _sortSel.addEventListener('change', ()=>{ try{ window.renderMedicos(); }catch(_){}}); }
if (typeof window.applyMedFilters === 'function'){
          try { window.applyMedFilters(); } catch(_){}
        } else if (typeof window.renderMedicos === 'function'){
          try { window.renderMedicos(); } catch(_){}
        }
      };

      // Siempre iniciamos la escucha de mÃ©dicos y seguimientos al cargar
      if (typeof window.initMedicos === 'function') {
        window.initMedicos();
      }
    } catch (e) {
      console.error('[medicos_realtime_override] error:', e);
    }
  }
})();



