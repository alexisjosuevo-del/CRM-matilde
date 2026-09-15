// tendencias-api.js — Explorador de Innovación & Tendencias para CRM Matilde
// Usa OpenAlex (papers académicos open-access) + CrossRef para contenido de marca,
// branding, marketing creativo, colaboraciones y tendencias de diseño.
(function () {

  // ── Mapeo de categoría → conceptos de búsqueda enriquecidos ──
  const CATEGORY_TERMS = {
    brand:      'branding identity visual creative strategy',
    creative:   'creative marketing campaigns advertising innovative',
    collab:     'brand collaboration partnership foundation nonprofit',
    trend:      'design trends packaging visual identity typography',
    social:     'social media content strategy community engagement',
    innovation: 'innovation brand disruption creative economy'
  };

  let _lastResults = [];
  let _currentPage = 0;
  const PAGE_SIZE   = 12;

  // ── Búsqueda en OpenAlex (papers de acceso abierto) ──────────────────
  async function searchOpenAlex(query, page = 1) {
    const perPage = 25;
    const from    = (page - 1) * perPage;
    const encoded = encodeURIComponent(query);
    const url = `https://api.openalex.org/works?search=${encoded}&filter=is_oa:true&sort=cited_by_count:desc&per_page=${perPage}&cursor=*&mailto=matilde@crm.mx`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('OpenAlex no disponible');
    const data = await res.json();
    return data.results || [];
  }

  // ── Búsqueda en CrossRef (publicaciones DOI) ─────────────────────────
  async function searchCrossRef(query, offset = 0) {
    const encoded = encodeURIComponent(query);
    const url = `https://api.crossref.org/works?query=${encoded}&rows=20&offset=${offset}&sort=relevance&filter=type:journal-article,type:book-chapter&mailto=matilde@crm.mx`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('CrossRef no disponible');
    const data = await res.json();
    return (data.message && data.message.items) ? data.message.items : [];
  }

  // ── Normaliza artículos de OpenAlex ─────────────────────────────────
  function normalizeOpenAlex(items) {
    return items.map(item => ({
      title:     item.display_name || 'Sin título',
      year:      item.publication_year || '',
      source:    (item.primary_location?.source?.display_name) || 'OpenAlex',
      authors:   (item.authorships || []).map(a => a.author?.display_name).filter(Boolean).slice(0, 5),
      url:       item.primary_location?.landing_page_url || item.id || '#',
      abstract:  item.abstract_inverted_index ? rebuildAbstract(item.abstract_inverted_index) : '',
      citations: item.cited_by_count || 0,
      topics:    (item.concepts || []).slice(0, 3).map(c => c.display_name),
      source_type: 'research'
    }));
  }

  // ── Reconstruye abstract de OpenAlex (inverted index) ───────────────
  function rebuildAbstract(invIndex) {
    if (!invIndex) return '';
    const words = [];
    for (const [word, positions] of Object.entries(invIndex)) {
      for (const pos of positions) words[pos] = word;
    }
    return words.filter(Boolean).join(' ').substring(0, 320) + '...';
  }

  // ── Normaliza artículos de CrossRef ──────────────────────────────────
  function normalizeCrossRef(items) {
    return items.map(item => {
      const authors = (item.author || []).map(a => [a.given, a.family].filter(Boolean).join(' ')).slice(0, 5);
      const year    = item.published?.['date-parts']?.[0]?.[0] || '';
      const url     = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : '#');
      return {
        title:     (item.title || ['Sin título'])[0],
        year,
        source:    (item['container-title'] || [''])[0] || 'CrossRef',
        authors,
        url,
        abstract:  item.abstract ? item.abstract.replace(/<[^>]+>/g, '').substring(0, 320) + '...' : '',
        citations: item['is-referenced-by-count'] || 0,
        topics:    (item.subject || []).slice(0, 3),
        source_type: 'industry'
      };
    });
  }

  // ── Mezcla y deduplica resultados ─────────────────────────────────────
  function mergeAndDeduplicate(oa, cr) {
    const seen = new Set();
    const all  = [...oa, ...cr];
    return all.filter(item => {
      const key = item.title.toLowerCase().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ── Extrae "colaboradores" (publishers/journals frecuentes) ───────────
  function extractCollaborators(items) {
    const freq = {};
    items.forEach(item => {
      const src = item.source;
      if (src && src.length > 2) freq[src] = (freq[src] || 0) + 1;
      (item.topics || []).forEach(t => { if (t) freq[t] = (freq[t] || 0) + 1; });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }

  // ── Renderiza cards de resultados ─────────────────────────────────────
  function renderCards(items, append = false) {
    const container = document.getElementById('tendCards');
    if (!container) return;
    if (!append) container.innerHTML = '';

    items.forEach(item => {
      const authStr = item.authors.length ? item.authors.slice(0, 3).join(', ') + (item.authors.length > 3 ? '…' : '') : 'Autor desconocido';
      const isResearch = item.source_type === 'research';
      const badge = isResearch
        ? `<span style="background:#e8f5e9;color:#2e7d32;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;">🔬 Investigación</span>`
        : `<span style="background:#e3f2fd;color:#1565c0;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;">📊 Industria</span>`;

      const topics = (item.topics || []).map(t =>
        `<span style="background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:2px 10px;font-size:11px;color:var(--text2);">${t}</span>`
      ).join('');

      const card = document.createElement('div');
      card.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:box-shadow 0.2s,transform 0.2s;cursor:pointer;';
      card.onmouseover = () => { card.style.boxShadow = '0 8px 24px rgba(42,142,158,0.15)'; card.style.transform = 'translateY(-2px)'; };
      card.onmouseout  = () => { card.style.boxShadow = ''; card.style.transform = ''; };
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          ${badge}
          ${item.year ? `<span style="font-size:11px;color:var(--text2);">${item.year}</span>` : ''}
        </div>
        <a href="${item.url}" target="_blank" rel="noopener"
           style="font-size:14px;font-weight:700;color:var(--text);text-decoration:none;line-height:1.45;display:block;">
          ${item.title}
        </a>
        ${item.abstract ? `<p style="font-size:12px;color:var(--text2);line-height:1.5;margin:0;">${item.abstract}</p>` : ''}
        <div style="font-size:11px;color:var(--text2);border-top:1px solid var(--border);padding-top:8px;margin-top:2px;">
          <span style="font-style:italic;">${item.source}</span>
          ${item.citations > 0 ? `<span style="margin-left:10px;color:var(--blue);">📈 ${item.citations} citas</span>` : ''}
        </div>
        ${authStr !== 'Autor desconocido' ? `<div style="font-size:11px;color:var(--text2);">👤 ${authStr}</div>` : ''}
        ${topics ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${topics}</div>` : ''}
        <a href="${item.url}" target="_blank" rel="noopener"
           style="font-size:12px;font-weight:600;color:var(--blue);text-decoration:none;align-self:flex-start;">
          Ver publicación →
        </a>`;
      container.appendChild(card);
    });
  }

  // ── Explorar tendencias (función principal) ───────────────────────────
  window.explorarTendencias = async function(rawQuery, categoria) {
    const categoryExtra = CATEGORY_TERMS[categoria] || '';
    const fullQuery     = `${rawQuery} ${categoryExtra}`.trim();

    // Reset UI
    const initial  = document.getElementById('tendInitial');
    const loading  = document.getElementById('tendLoading');
    const error    = document.getElementById('tendError');
    const cards    = document.getElementById('tendCards');
    const paginator= document.getElementById('tendPaginator');

    if (initial)   initial.style.display  = 'none';
    if (loading)   loading.style.display  = 'block';
    if (error)     error.style.display    = 'none';
    if (cards)     cards.innerHTML         = '';
    if (paginator) paginator.style.display = 'none';

    try {
      // Llamadas paralelas
      const [oaRaw, crRaw] = await Promise.allSettled([
        searchOpenAlex(fullQuery),
        searchCrossRef(rawQuery)
      ]);

      const oa = oaRaw.status === 'fulfilled' ? normalizeOpenAlex(oaRaw.value) : [];
      const cr = crRaw.status === 'fulfilled' ? normalizeCrossRef(crRaw.value) : [];

      _lastResults  = mergeAndDeduplicate(oa, cr);
      _currentPage  = 0;

      if (!_lastResults.length) {
        if (loading)  loading.style.display = 'none';
        if (error) {
          error.style.display = 'block';
          error.textContent   = `No se encontraron publicaciones para "${rawQuery}". Intenta con otros términos.`;
        }
        return;
      }

      if (loading) loading.style.display = 'none';

      // Mostrar primera página
      const firstPage = _lastResults.slice(0, PAGE_SIZE);
      renderCards(firstPage);

      if (_lastResults.length > PAGE_SIZE) {
        if (paginator) paginator.style.display = 'block';
      }

      // Botón "cargar más"
      const loadMoreBtn = document.getElementById('tendLoadMore');
      if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
          _currentPage++;
          const slice = _lastResults.slice(_currentPage * PAGE_SIZE, (_currentPage + 1) * PAGE_SIZE);
          renderCards(slice, true);
          if ((_currentPage + 1) * PAGE_SIZE >= _lastResults.length) {
            if (paginator) paginator.style.display = 'none';
          }
        };
      }

    } catch (err) {
      console.error('[Tendencias]', err);
      if (loading) loading.style.display = 'none';
      if (error) {
        error.style.display = 'block';
        error.textContent   = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      }
    }
  };

  // ── openPubMedModal (compat: ahora abre el explorador de tendencias) ──
  window.openPubMedModal = async function(nombre) {
    const modal = document.getElementById('modalPubMed');
    if (!modal) return;

    document.getElementById('pmDocName').textContent  = nombre;
    document.getElementById('pmLoading').style.display = 'block';
    document.getElementById('pmError').style.display   = 'none';
    document.getElementById('pmTabs').style.display    = 'none';
    document.getElementById('tabAuthors').style.display  = 'none';
    document.getElementById('tabArticles').style.display = 'none';
    document.getElementById('pmAuthorsList').innerHTML   = '';
    document.getElementById('pmArticlesList').innerHTML  = '';
    modal.classList.add('open');

    try {
      const fullQuery = `${nombre} brand marketing creative`;
      const [oaRaw, crRaw] = await Promise.allSettled([
        searchOpenAlex(fullQuery),
        searchCrossRef(nombre)
      ]);

      const oa = oaRaw.status === 'fulfilled' ? normalizeOpenAlex(oaRaw.value) : [];
      const cr = crRaw.status === 'fulfilled' ? normalizeCrossRef(crRaw.value) : [];
      const all = mergeAndDeduplicate(oa, cr);

      if (!all.length) {
        document.getElementById('pmLoading').style.display = 'none';
        const el = document.getElementById('pmError');
        el.style.display = 'block';
        el.textContent   = `No se encontraron publicaciones relacionadas con "${nombre}".`;
        return;
      }

      // ── Tab colaboraciones (publishers/journals/topics) ─────────────
      const collabs = extractCollaborators(all);
      document.getElementById('pmArticlesCount').textContent = all.length;
      const maxC = collabs.length ? collabs[0][1] : 1;
      document.getElementById('pmAuthorsList').innerHTML = collabs.length
        ? collabs.map(([name, count]) => {
            const pct = Math.max(8, (count / maxC) * 100);
            return `
              <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:11px 14px;display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:600;color:var(--text);font-size:14px;">${name}</span>
                  <span class="badge badge-blue">${count} pub${count > 1 ? 's' : ''}</span>
                </div>
                <div style="width:100%;height:5px;background:var(--border2);border-radius:4px;overflow:hidden;">
                  <div style="width:${pct}%;height:100%;background:var(--blue);border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
              </div>`;
          }).join('')
        : `<div style="color:var(--text2);font-size:13px;text-align:center;padding:20px 0;">Sin colaboradores identificados.</div>`;

      // ── Tab publicaciones ─────────────────────────────────────────────
      document.getElementById('pmArticlesList').innerHTML = all.slice(0, 15).map(item => {
        const authStr = item.authors.slice(0, 4).join(', ');
        return `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;">
            <a href="${item.url}" target="_blank" rel="noopener"
               style="font-size:14px;font-weight:600;color:var(--blue);text-decoration:none;line-height:1.45;display:block;">
              ${item.title}
            </a>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              ${item.year ? `<span class="badge badge-gray">${item.year}</span>` : ''}
              ${item.source ? `<span style="font-size:12px;color:var(--text2);font-style:italic;">${item.source}</span>` : ''}
              ${item.citations > 0 ? `<span style="font-size:12px;color:var(--blue);">📈 ${item.citations} citas</span>` : ''}
            </div>
            ${authStr ? `<div style="font-size:12px;color:var(--text2);">👤 ${authStr}</div>` : ''}
          </div>`;
      }).join('');

      document.getElementById('pmLoading').style.display = 'none';
      document.getElementById('pmTabs').style.display    = 'block';
      switchPmTab('authors');

    } catch (err) {
      console.error('[Tendencias Modal]', err);
      document.getElementById('pmLoading').style.display = 'none';
      const el = document.getElementById('pmError');
      el.style.display = 'block';
      el.textContent   = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    }
  };

  // ── Bind buscador del Explorador de Tendencias ────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const btn  = document.getElementById('btnBuscarTend');
    const inp  = document.getElementById('tendSearch');
    const cat  = document.getElementById('tendCategoria');

    function doSearch() {
      const query = (inp ? inp.value : '').trim();
      if (!query) return;
      window.explorarTendencias(query, cat ? cat.value : 'brand');
    }

    if (btn) btn.addEventListener('click', doSearch);
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  });

  // ── Chip rápido ────────────────────────────────────────────────────────
  window.tendSearchQuick = function(query) {
    const inp = document.getElementById('tendSearch');
    if (inp) inp.value = query;
    window.explorarTendencias(query, 'brand');
  };

})();
