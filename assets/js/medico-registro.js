// medico-registro.js — Modal de registro / edición de clientes AAA en Firestore
(async function () {

  async function getDb() {
    if (window.firebaseDb) return window.firebaseDb;
    return new Promise(resolve => {
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (window.firebaseDb) { clearInterval(t); resolve(window.firebaseDb); }
        if (tries > 40) { clearInterval(t); resolve(null); }
      }, 200);
    });
  }

  const modal     = document.getElementById('modalRegMed');
  const form      = document.getElementById('formRegMed');
  const title     = document.getElementById('modalRegMedTitle');
  const statusEl  = document.getElementById('regMedStatus');
  const editIdEl  = document.getElementById('editMedId');
  const submitBtn = document.getElementById('submitRegMed');

  const campos = {
    Nombre:       document.getElementById('regNombre'),
    Empresa:      document.getElementById('regEmpresa'),
    Rol:          document.getElementById('regRol'),
    'Telefono':   document.getElementById('regTelefono'),
    'Direccion':  document.getElementById('regDireccion'),
    'Red Social': document.getElementById('regRedSocial'),
    Estado:       document.getElementById('regEstado'),
    Region:       document.getElementById('regRegion'),
    Base:         document.getElementById('regBase')
  };

  function openNew() {
    if (title)     title.textContent = 'Registrar nuevo cliente';
    if (editIdEl)  editIdEl.value = '';
    if (form)      form.reset();
    if (statusEl)  statusEl.textContent = '';
    if (submitBtn) { submitBtn.textContent = 'Guardar cliente'; submitBtn.disabled = false; }
    if (modal)     modal.classList.add('open');
  }

  window.openEditMedico = function (id) {
    const med = (window.MED_BASE || []).find(m => m.id === id);
    if (!med) { alert('No se encontro el cliente.'); return; }
    if (title)     title.textContent = 'Editar cliente';
    if (editIdEl)  editIdEl.value = id;
    if (campos.Nombre)        campos.Nombre.value       = med.nombre || med.Nombre || '';
    if (campos.Empresa)       campos.Empresa.value      = med.empresa || med.Empresa || '';
    if (campos.Rol)           campos.Rol.value          = med.rol || med.Rol || '';
    if (campos['Telefono'])   campos['Telefono'].value  = med.telefono || med['Telefono'] || '';
    if (campos['Direccion'])  campos['Direccion'].value = med.direccion || med['Direccion'] || '';
    if (campos['Red Social']) campos['Red Social'].value = med.redSocial || med['Red Social'] || '';
    if (campos.Estado)        campos.Estado.value       = med.estado || med.Estado || '';
    if (campos.Region)        campos.Region.value       = med.region || med.Region || '';
    if (campos.Base)          campos.Base.value         = med.base || med.Base || '';
    if (statusEl)  statusEl.textContent = '';
    if (submitBtn) { submitBtn.textContent = 'Actualizar cliente'; submitBtn.disabled = false; }
    if (modal)     modal.classList.add('open');
  };

  function closeModal() {
    if (modal)    modal.classList.remove('open');
    if (form)     form.reset();
    if (editIdEl) editIdEl.value = '';
  }

  document.getElementById('closeRegMed')?.addEventListener('click', closeModal);
  document.getElementById('cancelRegMed')?.addEventListener('click', closeModal);
  document.getElementById('closeRegMedBtn')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.getElementById('openRegMed')?.addEventListener('click', openNew);
  document.getElementById('openRegMedBtn2')?.addEventListener('click', openNew);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const db = await getDb();
    if (!db) {
      if (statusEl) { statusEl.textContent = 'Sin conexion a Firestore'; statusEl.style.color = 'red'; }
      return;
    }
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl)  { statusEl.textContent = 'Guardando...'; statusEl.style.color = 'var(--text2)'; }
    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
      const payload = {
        nombre:    (campos.Nombre?.value        || '').trim(),
        empresa:   (campos.Empresa?.value       || '').trim(),
        rol:       (campos.Rol?.value           || '').trim(),
        telefono:  (campos['Telefono']?.value   || '').trim(),
        direccion: (campos['Direccion']?.value  || '').trim(),
        redSocial: (campos['Red Social']?.value || '').trim(),
        estado:    (campos.Estado?.value        || '').trim(),
        region:    (campos.Region?.value        || '').trim(),
        base:      (campos.Base?.value          || '').trim(),
        estatus:   'Contactado',
        updatedAt: serverTimestamp(),
      };
      const editId = editIdEl ? editIdEl.value : '';
      if (editId) {
        await setDoc(doc(db, 'clientes', editId), payload, { merge: true });
        if (statusEl) { statusEl.textContent = 'Cliente actualizado exitosamente'; statusEl.style.color = 'green'; }
      } else {
        payload.createdAt = serverTimestamp();
        const slug  = payload.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const newId = slug ? (slug + '-' + Date.now()) : Date.now().toString();
        await setDoc(doc(db, 'clientes', newId), payload);
        if (statusEl) { statusEl.textContent = 'Cliente registrado exitosamente'; statusEl.style.color = 'green'; }
        if (form) form.reset();
      }
      if (submitBtn) submitBtn.disabled = false;
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      console.error('[cliente-registro] Error:', err);
      if (statusEl) { statusEl.textContent = 'Error: ' + (err.message || 'No se pudo guardar'); statusEl.style.color = 'red'; }
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function patchActionCells() {
    document.querySelectorAll('#tbody-medicos tr').forEach(tr => {
      const btn  = tr.querySelector('.btn-seg, .btn-followup');
      if (!btn) return;
      const id   = btn.getAttribute('data-id') || '';
      const cell = tr.lastElementChild;
      if (!id || cell.querySelector('.btn-edit-med')) return;
      const editBtn = document.createElement('button');
      editBtn.className   = 'btn btn-ghost btn-sm btn-edit-med';
      editBtn.textContent = 'Editar';
      editBtn.style.marginRight = '4px';
      editBtn.addEventListener('click', () => window.openEditMedico(id));
      cell.insertBefore(editBtn, btn);
    });
  }

  const tbody = document.getElementById('tbody-medicos');
  if (tbody) new MutationObserver(patchActionCells).observe(tbody, { childList: true });
  setInterval(patchActionCells, 1000);

  console.log('[cliente-registro] Modulo cargado');
})();
