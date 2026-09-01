/* GordaoMod 2.0 — Views (router + render)
   SPA client-side, sem framework */
(function(window){
  'use strict';
  var D = window.GordaoModData;
  var routes = {};
  var currentView = null;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }
  function $(id){ return document.getElementById(id); }
  function escape(s){ return String(s||'').replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function route(path, fn){ routes[path] = fn; }
  function navigate(path){
    if(window.location.hash !== '#'+path) window.location.hash = '#'+path;
    else render(path);
  }
  function render(path){
    var main = $('main');
    if(!main) return;
    main.innerHTML = '';
    // Find matching route (support params)
    var match = null, params = {};
    Object.keys(routes).forEach(function(r){
      if(r === path){ match = routes[r]; return; }
      var parts = r.split('/:');
      if(parts.length > 1){
        var regex = new RegExp('^' + parts[0].replace(/\//g,'\\/') + '\\/([^\\/]+)$');
        var m = path.match(regex);
        if(m){ match = routes[r]; params[parts[1]] = m[1]; }
      }
    });
    if(match){ currentView = path; match(main, params); updateBreadcrumbs(path, params); }
    else { routes['/404'](main, {}); }
    window.scrollTo(0,0);
  }
  function updateBreadcrumbs(path, params){
    var bc = $('breadcrumbs');
    if(!bc) return;
    var parts = path.split('/').filter(Boolean);
    var html = '<a href="#/workspace">Inicio</a>';
    var labels = {
      'recursos':'Recursos','colecoes':'Colecoes','categorias':'Categorias',
      'workspace':'Workspace','docs':'Documentacao','criador':'Criador',
      'recurso':'Recurso','categoria':'Categoria','colecao':'Colecao',
      'comparar':'Comparar','bundles':'Bundles','404':'404'
    };
    var cur = '';
    parts.forEach(function(p, i){
      cur += '/' + p;
      if(i === parts.length - 1) html += ' / <span>' + (labels[p] || escape(decodeURIComponent(p))) + '</span>';
      else html += ' / <a href="#' + cur + '">' + (labels[p] || p) + '</a>';
    });
    bc.innerHTML = html;
  }

  // === SHARED COMPONENTS ===
  function resourceCard(r){
    var cat = D.findById('categories', r.category);
    return '<a href="#/recurso/'+r.slug+'" class="resource-card" style="text-decoration:none;color:inherit">'+
      '<div class="rc-name">'+escape(r.name)+'</div>'+
      '<div class="rc-desc">'+escape(r.shortDesc)+'</div>'+
      '<div class="rc-meta">'+
        '<span class="badge badge-neutral">'+escape(r.framework)+'</span>'+
        '<span class="rc-price">'+escape(r.price)+'</span>'+
      '</div></a>';
  }
  function resourceListItem(r){
    return '<a href="#/recurso/'+r.slug+'" class="resource-list-item" style="text-decoration:none;color:inherit">'+
      '<div><div style="font-weight:600;font-size:14px">'+escape(r.name)+'</div><div style="font-size:11px;color:var(--text-muted)">'+escape(r.framework)+' • v'+escape(r.version)+'</div></div>'+
      '<span class="rc-price">'+escape(r.price)+'</span></a>';
  }
  function emptyState(msg, sub){
    return '<div class="empty-state"><h3>'+escape(msg)+'</h3>'+(sub?'<p>'+escape(sub)+'</p>':'')+'</div>';
  }
  function toast(msg, type){
    var t = $('toast');
    if(!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + (type||'');
    setTimeout(function(){ t.className = 'toast ' + (type||''); }, 3000);
  }

  // === VIEWS ===

  // /workspace (overview)
  route('/workspace', function(main){
    var m = D.computeMetrics();
    var sr = D.get('serverResources');
    var act = D.get('activity');
    main.appendChild(el('div','page-header','<h1>Workspace</h1><p>Visao geral do servidor DEMO</p>'));
    var kpi = el('div','kpi-row');
    kpi.innerHTML =
      '<div class="kpi-tile"><div class="kpi-tile-label">Recursos instalados</div><div class="kpi-tile-value">'+sr.length+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Ativos</div><div class="kpi-tile-value positive">'+m.active+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Atualizacoes</div><div class="kpi-tile-value warning">'+m.updates+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Atencao</div><div class="kpi-tile-value negative">'+m.attention+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Total catalogo</div><div class="kpi-tile-value">'+m.totalResources+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Categorias</div><div class="kpi-tile-value">'+m.categories+'</div></div>';
    main.appendChild(kpi);

    var grid = el('div','grid-2');
    // Server status
    var status = el('div','detail-section');
    status.innerHTML = '<h3>Status do servidor</h3>'+
      '<div class="compat-matrix">'+
        '<div class="compat-item"><span>Framework</span><span class="badge badge-success">QBCore</span></div>'+
        '<div class="compat-item"><span>Database</span><span class="badge badge-success">oxmysql</span></div>'+
        '<div class="compat-item"><span>ox_lib</span><span class="badge badge-success">v3.0+</span></div>'+
        '<div class="compat-item"><span>Lua</span><span class="badge badge-success">5.4</span></div>'+
      '</div>';
    grid.appendChild(status);

    // Recent activity
    var actCard = el('div','detail-section');
    var actHtml = '<h3>Atividade recente</h3><div class="timeline">';
    act.slice(0,5).forEach(function(a){
      var dotClass = a.type === 'install' ? 'success' : (a.type === 'update' ? 'warn' : (a.type === 'disable' ? 'danger' : ''));
      actHtml += '<div class="timeline-item"><div class="timeline-dot '+dotClass+'"></div><div class="timeline-date">'+a.date+'</div><div class="timeline-text">'+escape(a.text)+'</div></div>';
    });
    actHtml += '</div>';
    actCard.innerHTML = actHtml;
    grid.appendChild(actCard);
    main.appendChild(grid);

    // Quick links
    var links = el('div','detail-section');
    links.innerHTML = '<h3>Acesso rapido</h3><div class="features-grid">'+
      '<a href="#/workspace/resources" class="feature-card" style="text-decoration:none;color:inherit"><div class="feature-icon">📦</div><h3>Resource Manager</h3><p>Gerenciar recursos instalados</p></a>'+
      '<a href="#/workspace/dependencies" class="feature-card" style="text-decoration:none;color:inherit"><div class="feature-icon">🔗</div><h3>Dependency Checker</h3><p>Verificar dependencias</p></a>'+
      '<a href="#/workspace/updates" class="feature-card" style="text-decoration:none;color:inherit"><div class="feature-icon">⬆️</div><h3>Update Center</h3><p>Atualizacoes disponiveis</p></a>'+
      '<a href="#/workspace/install" class="feature-card" style="text-decoration:none;color:inherit"><div class="feature-icon">➕</div><h3>Install Wizard</h3><p>Adicionar novo recurso</p></a>'+
      '</div>';
    main.appendChild(links);
  });

  // /recursos
  route('/recursos', function(main, params){
    var q = (params.q || '').toLowerCase();
    main.appendChild(el('div','page-header','<h1>Recursos</h1><p>'+D.SEED.resources.length+' recursos disponiveis no catalogo DEMO</p>'));
    var res = D.get('resources');
    // Filters
    var filterBar = el('div','filters-bar');
    filterBar.innerHTML =
      '<input type="search" class="filter-input" id="resSearch" placeholder="Buscar recursos..." value="'+escape(params.q||'')+'">'+
      '<select class="filter-select" id="filterCat"><option value="">Todas categorias</option></select>'+
      '<select class="filter-select" id="filterFw"><option value="">Todos frameworks</option></select>'+
      '<select class="filter-select" id="filterSort"><option value="relevance">Relevancia</option><option value="recent">Recentes</option><option value="price-asc">Preco: menor</option><option value="price-desc">Preco: maior</option><option value="downloads">Mais baixados</option></select>'+
      '<select class="filter-select" id="filterView"><option value="grid">Grid</option><option value="list">Lista</option></select>';
    main.appendChild(filterBar);

    var cats = D.get('categories');
    var fws = D.SEED.frameworks;
    var fc = filterBar.querySelector('#filterCat');
    cats.forEach(function(c){ var o = el('option'); o.value = c.id; o.textContent = c.name; fc.appendChild(o); });
    var ff = filterBar.querySelector('#filterFw');
    fws.forEach(function(f){ var o = el('option'); o.value = f.id; o.textContent = f.name; ff.appendChild(o); });

    var resultsDiv = el('div','resource-grid',' ');
    main.appendChild(resultsDiv);

    function applyFilters(){
      var search = filterBar.querySelector('#resSearch').value.toLowerCase();
      var cat = fc.value, fw = ff.value, sort = filterBar.querySelector('#filterSort').value, view = filterBar.querySelector('#filterView').value;
      var filtered = res.filter(function(r){
        if(search && r.name.toLowerCase().indexOf(search) < 0 && r.shortDesc.toLowerCase().indexOf(search) < 0) return false;
        if(cat && r.category !== cat) return false;
        if(fw && r.framework.toLowerCase().replace(' ','') !== fw) return false;
        return true;
      });
      if(sort === 'price-asc') filtered.sort(function(a,b){ return parseFloat(a.price) - parseFloat(b.price); });
      else if(sort === 'price-desc') filtered.sort(function(a,b){ return parseFloat(b.price) - parseFloat(a.price); });
      else if(sort === 'recent') filtered.sort(function(a,b){ return a.updatedAt < b.updatedAt ? 1 : -1; });
      else if(sort === 'downloads') filtered.sort(function(a,b){ return b.downloads - a.downloads; });

      resultsDiv.innerHTML = '';
      resultsDiv.className = view === 'list' ? 'resource-list' : 'resource-grid';
      if(filtered.length === 0){ resultsDiv.innerHTML = emptyState('Nenhum recurso encontrado','Tente outros filtros'); return; }
      filtered.slice(0, 48).forEach(function(r){
        resultsDiv.insertAdjacentHTML('beforeend', view === 'list' ? resourceListItem(r) : resourceCard(r));
      });
      if(filtered.length > 48){
        var more = el('div','pagination','<button onclick="this.parentNode.previousSibling.scrollIntoView()">Mostrar mais ('+(filtered.length-48)+')</button>');
        main.appendChild(more);
      }
    }
    filterBar.querySelectorAll('input,select').forEach(function(i){ i.addEventListener('input', applyFilters); i.addEventListener('change', applyFilters); });
    applyFilters();
  });

  // /categoria/:slug
  route('/categoria/:slug', function(main, params){
    var cat = D.get('categories').find(function(c){ return c.slug === params.slug; });
    if(!cat){ routes['/404'](main, {}); return; }
    var res = D.get('resources').filter(function(r){ return r.category === cat.id; });
    main.appendChild(el('div','page-header','<h1>'+cat.icon+' '+escape(cat.name)+'</h1><p>'+escape(cat.description)+'</p>'));
    var highlights = el('div','detail-section');
    highlights.innerHTML = '<h3>Destaques</h3><div style="display:flex;gap:8px;flex-wrap:wrap">'+cat.highlights.map(function(h){ return '<span class="badge badge-info">'+escape(h)+'</span>'; }).join('')+'</div>';
    main.appendChild(highlights);
    var grid = el('div','resource-grid');
    if(res.length === 0) grid.innerHTML = emptyState('Nenhum recurso nesta categoria');
    else res.forEach(function(r){ grid.insertAdjacentHTML('beforeend', resourceCard(r)); });
    main.appendChild(grid);
  });

  // /recurso/:slug
  route('/recurso/:slug', function(main, params){
    var r = D.get('resources').find(function(x){ return x.slug === params.slug; });
    if(!r){ routes['/404'](main, {}); return; }
    var cat = D.findById('categories', r.category);
    var cfg = D.get('configs')[r.id];
    var ch = D.get('changelogs')[r.id];
    var docs = D.get('documentation')[r.id];
    main.appendChild(el('div','detail-header','<div><div class="detail-title">'+escape(r.name)+'</div><div class="detail-sub">'+escape(r.shortDesc)+'</div></div><div><span class="badge badge-demo">DEMO</span> <span class="badge badge-neutral">v'+escape(r.version)+'</span></div>'));
    // Tabs
    var tabs = el('div','tabs','<button class="tab active" data-tab="overview">Visao geral</button><button class="tab" data-tab="compat">Compatibilidade</button><button class="tab" data-tab="deps">Dependencias</button><button class="tab" data-tab="changelog">Changelog</button><button class="tab" data-tab="docs">Documentacao</button>');
    main.appendChild(tabs);
    var content = el('div','tab-content');
    main.appendChild(content);

    function showTab(name){
      tabs.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab === name); });
      content.innerHTML = '';
      if(name === 'overview'){
        content.appendChild(el('div','grid-2',
          '<div class="detail-section"><h3>Descricao</h3><p style="white-space:pre-wrap">'+escape(r.description)+'</p></div>'+
          '<div class="detail-section"><h3>Metadados</h3>'+
          '<div class="compat-matrix">'+
            '<div class="compat-item"><span>Versao</span><span class="mono">'+escape(r.version)+'</span></div>'+
            '<div class="compat-item"><span>Tamanho</span><span class="mono">'+escape(r.size)+'</span></div>'+
            '<div class="compat-item"><span>Runtime</span><span class="mono">'+escape(r.runtime)+'</span></div>'+
            '<div class="compat-item"><span>Database</span><span class="mono">'+escape(r.database)+'</span></div>'+
            '<div class="compat-item"><span>UI</span><span class="mono">'+escape(r.ui)+'</span></div>'+
            '<div class="compat-item"><span>Atualizado</span><span class="mono">'+escape(r.updatedAt)+'</span></div>'+
          '</div></div>'
        ));
        var cta = el('div','detail-section','<h3>Instalar no servidor DEMO</h3><p style="color:var(--text-secondary);margin-bottom:16px">Adicione este recurso ao seu workspace de demonstracao.</p><button class="btn btn-primary" id="installBtn">Adicionar ao Workspace</button>');
        content.appendChild(cta);
        var btn = cta.querySelector('#installBtn');
        btn.addEventListener('click', function(){
          var sr = D.get('serverResources');
          if(sr.find(function(s){ return s.resourceId === r.id; })){ toast('Recurso ja instalado', 'warn'); return; }
          D.addItem('serverResources', { id: 'sr'+Date.now(), resourceId: r.id, status: 'active', installedVersion: r.version, enabled: true });
          D.addItem('activity', { id: 'a'+Date.now(), type: 'install', text: r.name+' instalado', date: new Date().toISOString().slice(0,10), user: 'Admin' });
          toast(r.name+' adicionado ao workspace', 'success');
          setTimeout(function(){ navigate('/workspace/resources'); }, 1000);
        });
      } else if(name === 'compat'){
        content.appendChild(el('div','detail-section','<h3>Matriz de compatibilidade</h3><div class="compat-matrix">'+
          Object.keys(r.compatibility).map(function(k){
            var v = r.compatibility[k];
            var cls = v === true ? 'badge-success' : (v === 'requires' ? 'badge-warning' : 'badge-danger');
            var label = v === true ? 'Compativel' : (v === 'requires' ? 'Requer adaptacao' : 'Incompativel');
            return '<div class="compat-item"><span>'+escape(k)+'</span><span class="badge '+cls+'">'+label+'</span></div>';
          }).join('')+'</div>'));
      } else if(name === 'deps'){
        var tree = '<div class="dep-tree"><div class="dep-root">'+escape(r.name)+'</div>';
        r.dependencies.forEach(function(d){
          tree += '<div class="dep-node">'+escape(d.name)+' <span style="color:var(--text-muted)">v'+escape(d.version)+'</span>'+(d.required?' <span class="badge badge-warning" style="font-size:9px">obrigatorio</span>':'')+'</div>';
        });
        tree += '</div>';
        content.appendChild(el('div','detail-section','<h3>Grafo de dependencias</h3>'+tree));
      } else if(name === 'changelog'){
        if(ch && ch.length){
          var html = '<div class="timeline">';
          ch.forEach(function(c){
            html += '<div class="timeline-item"><div class="timeline-dot success"></div><div class="timeline-date">v'+c.version+' • '+c.date+'</div>';
            if(c.fixed) html += '<div class="timeline-text"><strong>Corrigido:</strong> '+c.fixed.map(escape).join(', ')+'</div>';
            if(c.improved) html += '<div class="timeline-text"><strong>Melhorado:</strong> '+c.improved.map(escape).join(', ')+'</div>';
            if(c.changed) html += '<div class="timeline-text"><strong>Alterado:</strong> '+c.changed.map(escape).join(', ')+'</div>';
            html += '</div>';
          });
          html += '</div>';
          content.appendChild(el('div','detail-section','<h3>Historico de versoes</h3>'+html));
        } else {
          content.appendChild(el('div','', emptyState('Sem changelog disponivel')));
        }
      } else if(name === 'docs'){
        if(docs){
          var dhtml = '<div class="docs-layout"><div class="docs-sidebar"><nav>';
          docs.sections.forEach(function(s, i){
            dhtml += '<a href="#doc-'+s.id+'" style="display:block;padding:6px 0;font-size:13px;color:var(--text-secondary)">'+escape(s.title)+'</a>';
          });
          dhtml += '</nav></div><div>';
          docs.sections.forEach(function(s){
            dhtml += '<div class="detail-section" id="doc-'+s.id+'"><h3>'+escape(s.title)+'</h3><p style="white-space:pre-wrap">'+escape(s.content)+'</p></div>';
          });
          dhtml += '</div></div>';
          content.appendChild(el('div','', dhtml));
        } else {
          content.appendChild(el('div','', '<div class="detail-section"><h3>Documentacao</h3><p style="color:var(--text-secondary)">Documentacao generica para '+escape(r.name)+'. Consulte o guia de instalacao, configuracao e troubleshooting.</p>'+
            '<div class="detail-section"><h4>Instalacao</h4><p>1. Baixe o recurso<br>2. Coloque na pasta resources<br>3. Adicione ao server.cfg<br>4. Configure permissoes</p></div>'+
            '<div class="detail-section"><h4>Requisitos</h4><p>ox_lib, oxmysql, '+escape(r.framework)+'</p></div>'+
            '<div class="detail-section"><h4>Troubleshooting</h4><p>Se o recurso nao iniciar, verifique se as dependencias estao carregadas antes.</p></div>'));
        }
      }
    }
    tabs.querySelectorAll('.tab').forEach(function(t){ t.addEventListener('click', function(){ showTab(t.dataset.tab); }); });
    showTab('overview');
  });

  // /colecoes
  route('/colecoes', function(main){
    main.appendChild(el('div','page-header','<h1>Colecoes</h1><p>Pacotes curados de recursos para diferentes perfis de servidor</p>'));
    var grid = el('div','features-grid');
    D.get('collections').forEach(function(c){
      grid.insertAdjacentHTML('beforeend',
        '<a href="#/colecao/'+c.slug+'" class="collection-card" style="text-decoration:none;color:inherit">'+
        '<h3>'+escape(c.name)+'</h3><p>'+escape(c.description)+'</p>'+
        '<div class="col-count">'+c.resourceIds.length+' recursos</div></a>');
    });
    main.appendChild(grid);
  });

  // /colecao/:slug
  route('/colecao/:slug', function(main, params){
    var c = D.get('collections').find(function(x){ return x.slug === params.slug; });
    if(!c){ routes['/404'](main, {}); return; }
    var res = c.resourceIds.map(function(id){ return D.findById('resources', id); }).filter(Boolean);
    main.appendChild(el('div','page-header','<h1>'+escape(c.name)+'</h1><p>'+escape(c.description)+'</p>'));
    var info = el('div','detail-section');
    info.innerHTML = '<h3>Resumo</h3><div class="grid-2">'+
      '<div><p><strong>Recursos:</strong> '+res.length+'</p><p><strong>Dependencias:</strong> '+c.dependencies.join(', ')+'</p></div>'+
      '<div><p><strong>Compatibilidade:</strong> '+Object.keys(c.compatibility).filter(function(k){return c.compatibility[k];}).join(', ')+'</p></div></div>';
    main.appendChild(info);
    var cta = el('div','detail-section','<button class="btn btn-primary" id="addColBtn">Adicionar colecao ao Workspace</button>');
    main.appendChild(cta);
    cta.querySelector('#addColBtn').addEventListener('click', function(){
      var sr = D.get('serverResources');
      var added = 0;
      res.forEach(function(r){
        if(!sr.find(function(s){ return s.resourceId === r.id; })){
          D.addItem('serverResources', { id: 'sr'+Date.now()+added, resourceId: r.id, status: 'active', installedVersion: r.version, enabled: true });
          added++;
        }
      });
      D.addItem('activity', { id: 'a'+Date.now(), type: 'install', text: 'Colecao '+c.name+' adicionada ('+added+' recursos)', date: new Date().toISOString().slice(0,10), user: 'Admin' });
      toast(added+' recursos adicionados ao workspace', 'success');
      setTimeout(function(){ navigate('/workspace/resources'); }, 1200);
    });
    var grid = el('div','resource-grid');
    res.forEach(function(r){ grid.insertAdjacentHTML('beforeend', resourceCard(r)); });
    main.appendChild(grid);
  });

  // /categorias
  route('/categorias', function(main){
    main.appendChild(el('div','page-header','<h1>Categorias</h1><p>Explore recursos por categoria</p>'));
    var grid = el('div','features-grid');
    D.get('categories').forEach(function(c){
      var count = D.get('resources').filter(function(r){ return r.category === c.id; }).length;
      grid.insertAdjacentHTML('beforeend',
        '<a href="#/categoria/'+c.slug+'" class="feature-card" style="text-decoration:none;color:inherit">'+
        '<div class="feature-icon">'+c.icon+'</div><h3>'+escape(c.name)+'</h3><p>'+escape(c.description)+'</p>'+
        '<div style="margin-top:12px;font-size:11px;color:var(--text-muted)">'+count+' recursos</div></a>');
    });
    main.appendChild(grid);
  });

  // /comparar
  route('/comparar', function(main){
    main.appendChild(el('div','page-header','<h1>Comparar recursos</h1><p>Selecione dois recursos para comparar</p>'));
    var res = D.get('resources');
    var form = el('div','detail-section');
    form.innerHTML = '<div class="grid-2"><div class="form-group"><label class="form-label">Recurso 1</label><select class="form-select" id="cmp1"></select></div><div class="form-group"><label class="form-label">Recurso 2</label><select class="form-select" id="cmp2"></select></div></div><button class="btn btn-primary" id="cmpBtn">Comparar</button>';
    main.appendChild(form);
    var s1 = form.querySelector('#cmp1'), s2 = form.querySelector('#cmp2');
    res.slice(0,30).forEach(function(r){
      s1.appendChild(new Option(r.name, r.id));
      s2.appendChild(new Option(r.name, r.id));
    });
    if(s2.options.length > 1) s2.selectedIndex = 1;
    var result = el('div','cmp-result');
    main.appendChild(result);
    form.querySelector('#cmpBtn').addEventListener('click', function(){
      var a = res.find(function(r){ return r.id === s1.value; });
      var b = res.find(function(r){ return r.id === s2.value; });
      if(!a || !b || a.id === b.id){ toast('Selecione dois recursos diferentes', 'warn'); return; }
      var rows = [
        ['Nome', a.name, b.name],
        ['Preco', a.price, b.price],
        ['Versao', a.version, b.version],
        ['Framework', a.framework, b.framework],
        ['Tamanho', a.size, b.size],
        ['Atualizado', a.updatedAt, b.updatedAt],
        ['Downloads', a.downloads, b.downloads],
        ['Dependencias', a.dependencies.map(function(d){return d.name;}).join(', '), b.dependencies.map(function(d){return d.name;}).join(', ')]
      ];
      var html = '<div class="detail-section"><h3>Comparacao</h3><table class="data-table"><thead><tr><th>Atributo</th><th>'+escape(a.name)+'</th><th>'+escape(b.name)+'</th></tr></thead><tbody>';
      rows.forEach(function(row){ html += '<tr><td>'+escape(row[0])+'</td><td>'+escape(row[1])+'</td><td>'+escape(row[2])+'</td></tr>'; });
      html += '</tbody></table></div>';
      result.innerHTML = html;
    });
  });

  // /bundles
  route('/bundles', function(main){
    main.appendChild(el('div','page-header','<h1>Bundles</h1><p>Pacotes de recursos com preco combinado</p>'));
    var grid = el('div','features-grid');
    D.get('collections').slice(0,4).forEach(function(c){
      var res = c.resourceIds.map(function(id){ return D.findById('resources', id); }).filter(Boolean);
      var total = res.reduce(function(s,r){ return s + parseFloat(r.price || 0); }, 0);
      var bundle = (total * 0.8).toFixed(2);
      grid.insertAdjacentHTML('beforeend',
        '<a href="#/colecao/'+c.slug+'" class="collection-card" style="text-decoration:none;color:inherit">'+
        '<h3>'+escape(c.name)+'</h3><p>'+escape(c.description)+'</p>'+
        '<div class="col-count">'+res.length+' recursos • De R$ '+total.toFixed(2)+' por R$ '+bundle+'</div></a>');
    });
    main.appendChild(grid);
  });

  // /docs
  route('/docs', function(main){
    main.appendChild(el('div','page-header','<h1>Documentacao</h1><p>Guias, tutoriais e referencia de API</p>'));
    var grid = el('div','features-grid');
    var docs = [
      { icon:'📖', title:'Guia de inicio', desc:'Como configurar seu servidor FiveM do zero', link:'#/docs/inicio' },
      { icon:'🔧', title:'Instalacao de recursos', desc:'Passo a passo para instalar recursos', link:'#/docs/instalacao' },
      { icon:'⚙️', title:'Configuracao', desc:'Como configurar cada recurso', link:'#/docs/configuracao' },
      { icon:'🔗', title:'Dependencias', desc:'Entendendo o grafo de dependencias', link:'#/docs/dependencias' },
      { icon:'📡', title:'API e eventos', desc:'Referencia de eventos para integracao', link:'#/docs/api' },
      { icon:'🛠️', title:'Troubleshooting', desc:'Solucoes para problemas comuns', link:'#/docs/troubleshooting' },
      { icon:'🔄', title:'Atualizacoes', desc:'Como atualizar recursos sem quebrar', link:'#/docs/atualizacoes' },
      { icon:'📦', title:'Frameworks', desc:'QBCore, Qbox, ESX e standalone', link:'#/docs/frameworks' }
    ];
    docs.forEach(function(d){
      grid.insertAdjacentHTML('beforeend', '<a href="'+d.link+'" class="feature-card" style="text-decoration:none;color:inherit"><div class="feature-icon">'+d.icon+'</div><h3>'+d.title+'</h3><p>'+d.desc+'</p></a>');
    });
    main.appendChild(grid);
  });

  // /docs/:topic
  route('/docs/:topic', function(main, params){
    var topic = params.topic;
    var titles = {
      'inicio':'Guia de inicio','instalacao':'Instalacao de recursos','configuracao':'Configuracao',
      'dependencias':'Dependencias','api':'API e eventos','troubleshooting':'Troubleshooting',
      'atualizacoes':'Atualizacoes','frameworks':'Frameworks'
    };
    main.appendChild(el('div','page-header','<h1>'+escape(titles[topic]||'Documentacao')+'</h1>'));
    var content = {
      'inicio': 'Este guia mostra como configurar um servidor FiveM do zero usando recursos GordaoMod.\n\n1. Instale o FiveM server\n2. Configure server.cfg\n3. Adicione ox_lib e oxmysql\n4. Escolha um framework (QBCore, Qbox ou ESX)\n5. Adicione recursos GordaoMod\n6. Configure permissoes\n7. Inicie o servidor',
      'instalacao': 'Para instalar um recurso:\n\n1. Baixe o arquivo .zip\n2. Extraia para a pasta resources/[gordaomod]\n3. Adicione ensure [resource] ao server.cfg\n4. Configure as permissoes no ACL\n5. Restart o servidor\n\nSempre verifique as dependencias antes de instalar.',
      'configuracao': 'Cada recurso tem seu proprio sistema de configuracao. Acesse o painel admin ou edite o config.lua.\n\nConfiguracoes comuns:\n- Pagamento base\n- Cooldown\n- Blips\n- Spawn de veiculos\n- Dificuldade',
      'dependencias': 'A maioria dos recursos GordaoMod depende de:\n\n- ox_lib (UI e utilidades)\n- oxmysql (database)\n- Framework (QBCore/Qbox/ESX)\n\nUse o Dependency Checker no Workspace para visualizar o grafo.',
      'api': 'Eventos disponveis (DEMO):\n\n- gm_empregos:iniciar\n- gm_empregos:finalizar\n- gm_garagem:spawn\n- gm_garagem:save\n- gm_celular:abrir\n\nNota: eventos ficticios para demonstracao.',
      'troubleshooting': 'Problemas comuns:\n\n1. Recurso nao inicia: verifique dependencias\n2. UI nao aparece: verifique ox_lib\n3. Erro de database: verifique oxmysql\n4. Blip duplicado: verifique se o recurso nao foi iniciado duas vezes',
      'atualizacoes': 'Para atualizar um recurso:\n\n1. Faca backup da configuracao atual\n2. Baixe a nova versao\n3. Substitua os arquivos\n4. Restaure a configuracao\n5. Restart o recurso\n\nUse o Update Center no Workspace para automatizar.',
      'frameworks': 'Frameworks suportados:\n\n- QBCore: framework popular, baseado em QB\n- Qbox: fork moderno e modular do QBCore\n- ESX: framework classico\n- standalone: funciona sem framework\n\nA maioria dos recursos GordaoMod suporta QBCore e Qbox nativamente.'
    };
    main.appendChild(el('div','detail-section','<p style="white-space:pre-wrap;font-size:15px;line-height:1.8">'+escape(content[topic]||'Conteudo nao disponivel.')+'</p>'));
  });

  // /criador
  route('/criador', function(main){
    main.appendChild(el('div','page-header','<h1>Criador</h1><p>Ecossistema de criadores de recursos</p>'));
    main.appendChild(el('div','detail-section','<h3>GordaoMod Studio DEMO</h3><p style="color:var(--text-secondary);margin-bottom:16px">Estudio ficticio de desenvolvimento de recursos para FiveM. Todos os recursos sao demonstrativos.</p>'+
      '<div class="kpi-row">'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Recursos publicados</div><div class="kpi-tile-value">'+D.SEED.resources.length+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Categorias</div><div class="kpi-tile-value">'+D.SEED.categories.length+'</div></div>'+
      '<div class="kpi-tile"><div class="kpi-tile-label">Colecoes</div><div class="kpi-tile-value">'+D.SEED.collections.length+'</div></div>'+
      '</div>'));
    main.appendChild(el('div','detail-section','<h3>Recursos recentes</h3><div class="resource-list">'+
      D.get('resources').slice(0,5).map(resourceListItem).join('')+'</div>'));
  });

  // /workspace/resources
  route('/workspace/resources', function(main){
    main.appendChild(el('div','page-header','<h1>Resource Manager</h1><p>Gerencie os recursos instalados no servidor DEMO</p>'));
    var sr = D.get('serverResources');
    var table = el('div','detail-section');
    var html = '<table class="data-table"><thead><tr><th>Recurso</th><th>Versao</th><th>Status</th><th>Acoes</th></tr></thead><tbody>';
    sr.forEach(function(s){
      var r = D.findById('resources', s.resourceId);
      if(!r) return;
      var statusBadge = s.status === 'active' ? '<span class="badge badge-success">Ativo</span>' :
        s.status === 'update' ? '<span class="badge badge-warning">Atualizacao</span>' :
        s.status === 'attention' ? '<span class="badge badge-danger">Atencao</span>' :
        '<span class="badge badge-neutral">Desativado</span>';
      html += '<tr data-id="'+s.id+'"><td><a href="#/recurso/'+r.slug+'">'+escape(r.name)+'</a></td><td class="mono">v'+escape(s.installedVersion)+'</td><td>'+statusBadge+'</td>'+
        '<td><button class="btn btn-sm btn-ghost" data-action="toggle">'+(s.enabled?'Desativar':'Ativar')+'</button> '+
        '<button class="btn btn-sm btn-ghost" data-action="config">Configurar</button> '+
        (s.status === 'update' ? '<button class="btn btn-sm btn-primary" data-action="update">Atualizar</button>' : '')+'</td></tr>';
    });
    html += '</tbody></table>';
    table.innerHTML = html;
    main.appendChild(table);
    // Wire actions
    table.querySelectorAll('tr[data-id]').forEach(function(tr){
      var id = tr.dataset.id;
      tr.querySelectorAll('button[data-action]').forEach(function(btn){
        btn.addEventListener('click', function(){
          var action = btn.dataset.action;
          var s = D.get('serverResources').find(function(x){ return x.id === id; });
          if(!s) return;
          if(action === 'toggle'){
            D.updateItem('serverResources', id, { enabled: !s.enabled, status: !s.enabled ? 'active' : 'desativado' });
            toast('Recurso '+(s.enabled?'desativado':'ativado'), 'success');
            render('/workspace/resources');
          } else if(action === 'config'){
            openConfigDrawer(s.resourceId);
          } else if(action === 'update'){
            navigate('/workspace/updates');
          }
        });
      });
    });
  });

  // /workspace/dependencies
  route('/workspace/dependencies', function(main){
    main.appendChild(el('div','page-header','<h1>Dependency Checker</h1><p>Verifique as dependencias dos recursos instalados</p>'));
    var sr = D.get('serverResources');
    var allDeps = {};
    var missing = [];
    sr.forEach(function(s){
      var r = D.findById('resources', s.resourceId);
      if(!r) return;
      r.dependencies.forEach(function(d){
        if(d.required){
          allDeps[d.name] = (allDeps[d.name] || 0) + 1;
        }
      });
    });
    var installed = ['ox_lib', 'oxmysql', 'qb-core'];
    Object.keys(allDeps).forEach(function(d){
      if(installed.indexOf(d) < 0) missing.push(d);
    });
    var status = el('div','detail-section');
    if(missing.length === 0){
      status.innerHTML = '<h3>Status</h3><p style="color:var(--success);font-size:18px">Tudo compativel ✓</p><p style="color:var(--text-secondary)">Todas as dependencias obrigatorias estao instaladas.</p>';
    } else {
      status.innerHTML = '<h3>Status</h3><p style="color:var(--danger);font-size:18px">'+missing.length+' dependencia(s) ausente(s)</p><ul style="margin-top:12px">'+missing.map(function(m){ return '<li>'+escape(m)+'</li>'; }).join('')+'</ul>';
    }
    main.appendChild(status);
    var tree = el('div','detail-section');
    var treeHtml = '<h3>Grafo de dependencias</h3>';
    sr.forEach(function(s){
      var r = D.findById('resources', s.resourceId);
      if(!r) return;
      treeHtml += '<div class="dep-tree" style="margin-bottom:16px"><div class="dep-root">'+escape(r.name)+'</div>';
      r.dependencies.forEach(function(d){
        var ok = installed.indexOf(d.name) >= 0;
        treeHtml += '<div class="dep-node">'+escape(d.name)+(ok?' <span class="badge badge-success" style="font-size:9px">instalado</span>':' <span class="badge badge-danger" style="font-size:9px">ausente</span>')+'</div>';
      });
      treeHtml += '</div>';
    });
    tree.innerHTML = treeHtml;
    main.appendChild(tree);
  });

  // /workspace/updates
  route('/workspace/updates', function(main){
    main.appendChild(el('div','page-header','<h1>Update Center</h1><p>Atualizacoes disponiveis para os recursos instalados</p>'));
    var sr = D.get('serverResources');
    var updates = sr.filter(function(s){ return s.status === 'update'; });
    if(updates.length === 0){
      main.appendChild(el('div','', emptyState('Nenhuma atualizacao disponivel','Todos os recursos estao na versao mais recente')));
      return;
    }
    updates.forEach(function(s){
      var r = D.findById('resources', s.resourceId);
      if(!r) return;
      var ch = (D.get('changelogs')[r.id] || [])[0];
      var card = el('div','detail-section');
      var html = '<h3>'+escape(r.name)+'</h3><p style="color:var(--text-secondary);margin-bottom:12px">v'+escape(s.installedVersion)+' → v'+escape(r.version)+'</p>';
      if(ch){
        html += '<div style="margin-bottom:12px">';
        if(ch.fixed) html += '<p><strong>Corrigido:</strong> '+ch.fixed.map(escape).join(', ')+'</p>';
        if(ch.improved) html += '<p><strong>Melhorado:</strong> '+ch.improved.map(escape).join(', ')+'</p>';
        if(ch.changed) html += '<p><strong>Alterado:</strong> '+ch.changed.map(escape).join(', ')+'</p>';
        html += '</div>';
      }
      html += '<div id="prog-'+s.id+'" style="margin-bottom:12px"></div>';
      html += '<button class="btn btn-primary" data-id="'+s.id+'">Atualizar DEMO</button>';
      card.innerHTML = html;
      main.appendChild(card);
      card.querySelector('button').addEventListener('click', function(){
        var prog = card.querySelector('#prog-'+s.id);
        var steps = ['Baixando...', 'Verificando...', 'Aplicando...', 'Concluido'];
        var i = 0;
        function next(){
          if(i >= steps.length){
            D.updateItem('serverResources', s.id, { status: 'active', installedVersion: r.version });
            D.addItem('activity', { id: 'a'+Date.now(), type: 'update', text: r.name+' atualizado para v'+r.version, date: new Date().toISOString().slice(0,10), user: 'Admin' });
            toast(r.name+' atualizado', 'success');
            render('/workspace/updates');
            return;
          }
          prog.innerHTML = '<div style="font-size:13px;margin-bottom:4px">'+steps[i]+'</div><div class="progress-bar"><div class="progress-fill" style="width:'+((i+1)/steps.length*100)+'%"></div></div>';
          i++;
          setTimeout(next, 600);
        }
        next();
      });
    });
  });

  // /workspace/install
  route('/workspace/install', function(main){
    main.appendChild(el('div','page-header','<h1>Install Wizard</h1><p>Adicione um novo recurso ao servidor DEMO</p>'));
    var steps = ['Selecionar','Dependencias','Compatibilidade','Configurar','Revisar','Instalar'];
    var stepHtml = '<div class="wizard-steps">';
    steps.forEach(function(s, i){ stepHtml += '<div class="wizard-step" data-step="'+i+'"><div class="wizard-step-num">'+(i+1)+'</div>'+s+'</div>'; });
    stepHtml += '</div>';
    main.appendChild(el('div','', stepHtml));
    var body = el('div','wizard-body');
    main.appendChild(body);
    var state = { step: 0, resourceId: null, config: {} };
    function showStep(){
      main.querySelectorAll('.wizard-step').forEach(function(s, i){ s.classList.toggle('active', i === state.step); });
      body.innerHTML = '';
      if(state.step === 0){
        var res = D.get('resources').filter(function(r){ return !D.get('serverResources').find(function(s){ return s.resourceId === r.id; }); });
        body.innerHTML = '<div class="form-group"><label class="form-label">Selecione um recurso</label><select class="form-select" id="wizRes"></select></div>';
        var sel = body.querySelector('#wizRes');
        res.slice(0,30).forEach(function(r){ sel.appendChild(new Option(r.name+' ('+r.framework+')', r.id)); });
        body.appendChild(el('div','', '<button class="btn btn-primary" id="nextBtn">Proximo</button>'));
        body.querySelector('#nextBtn').addEventListener('click', function(){ state.resourceId = sel.value; state.step = 1; showStep(); });
      } else if(state.step === 1){
        var r = D.findById('resources', state.resourceId);
        if(!r){ state.step = 0; showStep(); return; }
        body.innerHTML = '<div class="detail-section"><h3>Dependencias de '+escape(r.name)+'</h3><div class="dep-tree"><div class="dep-root">'+escape(r.name)+'</div>'+
          r.dependencies.map(function(d){ return '<div class="dep-node">'+escape(d.name)+(d.required?' <span class="badge badge-warning" style="font-size:9px">obrigatorio</span>':'')+'</div>'; }).join('')+'</div></div>'+
          '<button class="btn btn-secondary" id="backBtn">Voltar</button> <button class="btn btn-primary" id="nextBtn">Proximo</button>';
        body.querySelector('#backBtn').addEventListener('click', function(){ state.step = 0; showStep(); });
        body.querySelector('#nextBtn').addEventListener('click', function(){ state.step = 2; showStep(); });
      } else if(state.step === 2){
        var r2 = D.findById('resources', state.resourceId);
        body.innerHTML = '<div class="detail-section"><h3>Compatibilidade</h3><div class="compat-matrix">'+
          Object.keys(r2.compatibility).map(function(k){
            var v = r2.compatibility[k];
            var cls = v === true ? 'badge-success' : (v === 'requires' ? 'badge-warning' : 'badge-danger');
            var label = v === true ? 'Compativel' : (v === 'requires' ? 'Requer adaptacao' : 'Incompativel');
            return '<div class="compat-item"><span>'+escape(k)+'</span><span class="badge '+cls+'">'+label+'</span></div>';
          }).join('')+'</div></div>'+
          '<button class="btn btn-secondary" id="backBtn">Voltar</button> <button class="btn btn-primary" id="nextBtn">Proximo</button>';
        body.querySelector('#backBtn').addEventListener('click', function(){ state.step = 1; showStep(); });
        body.querySelector('#nextBtn').addEventListener('click', function(){ state.step = 3; showStep(); });
      } else if(state.step === 3){
        var r3 = D.findById('resources', state.resourceId);
        var cfg = D.get('configs')[r3.id] || [
          { key: 'pagamentoBase', label: 'Pagamento base', type: 'number', value: 850, unit: 'R$' },
          { key: 'cooldown', label: 'Cooldown', type: 'number', value: 30, unit: 'min' },
          { key: 'blips', label: 'Blips no mapa', type: 'toggle', value: true }
        ];
        body.innerHTML = '<div class="detail-section"><h3>Configuracao</h3>';
        cfg.forEach(function(c){
          if(c.type === 'toggle'){
            body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><div class="toggle '+(c.value?'on':'')+'" data-key="'+c.key+'"></div></div>');
          } else if(c.type === 'select'){
            body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><select class="form-select" data-key="'+c.key+'">'+c.options.map(function(o){ return '<option '+((o===c.value)?'selected':'')+'>'+o+'</option>'; }).join('')+'</select></div>');
          } else {
            body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><input class="form-input" type="'+c.type+'" data-key="'+c.key+'" value="'+c.value+'"> '+(c.unit?'<span style="color:var(--text-muted);font-size:12px">'+c.unit+'</span>':'')+'</div>');
          }
        });
        body.insertAdjacentHTML('beforeend', '</div><button class="btn btn-secondary" id="backBtn">Voltar</button> <button class="btn btn-primary" id="nextBtn">Proximo</button>');
        body.querySelectorAll('.toggle').forEach(function(t){ t.addEventListener('click', function(){ t.classList.toggle('on'); }); });
        body.querySelector('#backBtn').addEventListener('click', function(){ state.step = 2; showStep(); });
        body.querySelector('#nextBtn').addEventListener('click', function(){
          body.querySelectorAll('[data-key]').forEach(function(i){
            var key = i.dataset.key;
            var val = i.classList.contains('toggle') ? i.classList.contains('on') : i.value;
            state.config[key] = val;
          });
          state.step = 4; showStep();
        });
      } else if(state.step === 4){
        var r4 = D.findById('resources', state.resourceId);
        body.innerHTML = '<div class="detail-section"><h3>Revisao</h3>'+
          '<p><strong>Recurso:</strong> '+escape(r4.name)+'</p>'+
          '<p><strong>Versao:</strong> '+escape(r4.version)+'</p>'+
          '<p><strong>Framework:</strong> '+escape(r4.framework)+'</p>'+
          '<p><strong>Dependencias:</strong> '+r4.dependencies.map(function(d){return d.name;}).join(', ')+'</p>'+
          '<p><strong>Configuracao:</strong> '+Object.keys(state.config).map(function(k){ return k+'='+state.config[k]; }).join(', ')+'</p></div>'+
          '<button class="btn btn-secondary" id="backBtn">Voltar</button> <button class="btn btn-primary" id="nextBtn">Instalar DEMO</button>';
        body.querySelector('#backBtn').addEventListener('click', function(){ state.step = 3; showStep(); });
        body.querySelector('#nextBtn').addEventListener('click', function(){ state.step = 5; showStep(); });
      } else if(state.step === 5){
        var r5 = D.findById('resources', state.resourceId);
        body.innerHTML = '<div id="installProg"></div>';
        var prog = body.querySelector('#installProg');
        var steps2 = ['Baixando recurso...', 'Verificando integridade...', 'Instalando arquivos...', 'Configurando...', 'Concluido!'];
        var i = 0;
        function next(){
          if(i >= steps2.length){
            D.addItem('serverResources', { id: 'sr'+Date.now(), resourceId: state.resourceId, status: 'active', installedVersion: r5.version, enabled: true });
            D.addItem('activity', { id: 'a'+Date.now(), type: 'install', text: r5.name+' instalado via wizard', date: new Date().toISOString().slice(0,10), user: 'Admin' });
            toast(r5.name+' instalado com sucesso', 'success');
            setTimeout(function(){ navigate('/workspace/resources'); }, 1200);
            return;
          }
          prog.innerHTML = '<div style="font-size:14px;margin-bottom:8px">'+steps2[i]+'</div><div class="progress-bar"><div class="progress-fill" style="width:'+((i+1)/steps2.length*100)+'%"></div></div>';
          i++;
          setTimeout(next, 700);
        }
        next();
      }
    }
    showStep();
  });

  // 404
  route('/404', function(main){
    main.appendChild(el('div','not-found','<h1>404</h1><p>Esse recurso nao foi encontrado.</p>'+
      '<div style="display:flex;gap:12px;justify-content:center"><button class="btn btn-primary" onclick="location.hash=\'#/recursos\'">Ver recursos</button>'+
      '<button class="btn btn-secondary" onclick="location.hash=\'#/workspace\'">Voltar ao inicio</button></div>'));
  });

  // === CONFIG DRAWER ===
  function openConfigDrawer(resourceId){
    var r = D.findById('resources', resourceId);
    if(!r) return;
    var cfg = D.get('configs')[r.id] || [
      { key: 'pagamentoBase', label: 'Pagamento base', type: 'number', value: 850, unit: 'R$' },
      { key: 'cooldown', label: 'Cooldown', type: 'number', value: 30, unit: 'min' },
      { key: 'blips', label: 'Blips no mapa', type: 'toggle', value: true }
    ];
    var drawer = $('drawer');
    var overlay = $('drawerOverlay');
    drawer.innerHTML = '';
    drawer.appendChild(el('div','drawer-header','<h3>Configurar '+escape(r.name)+'</h3><button class="icon-btn" id="closeDrawer" aria-label="Fechar">✕</button>'));
    var body = el('div','drawer-body');
    cfg.forEach(function(c){
      if(c.type === 'toggle'){
        body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><div class="toggle '+(c.value?'on':'')+'" data-key="'+c.key+'"></div></div>');
      } else if(c.type === 'select'){
        body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><select class="form-select" data-key="'+c.key+'">'+c.options.map(function(o){ return '<option '+((o===c.value)?'selected':'')+'>'+o+'</option>'; }).join('')+'</select></div>');
      } else {
        body.insertAdjacentHTML('beforeend', '<div class="form-group"><label class="form-label">'+c.label+'</label><input class="form-input" type="'+c.type+'" data-key="'+c.key+'" value="'+c.value+'"> '+(c.unit?'<span style="color:var(--text-muted);font-size:12px">'+c.unit+'</span>':'')+'</div>');
      }
    });
    drawer.appendChild(body);
    drawer.appendChild(el('div','drawer-footer','<button class="btn btn-secondary" id="cancelCfg">Cancelar</button><button class="btn btn-primary" id="saveCfg">Salvar DEMO</button>'));
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.querySelectorAll('.toggle').forEach(function(t){ t.addEventListener('click', function(){ t.classList.toggle('on'); }); });
    drawer.querySelector('#closeDrawer').addEventListener('click', closeDrawer);
    drawer.querySelector('#cancelCfg').addEventListener('click', closeDrawer);
    drawer.querySelector('#saveCfg').addEventListener('click', function(){
      var newCfg = [];
      drawer.querySelectorAll('[data-key]').forEach(function(i){
        var key = i.dataset.key;
        var orig = cfg.find(function(c){ return c.key === key; });
        var val = i.classList.contains('toggle') ? i.classList.contains('on') : i.value;
        newCfg.push(Object.assign({}, orig, { value: val }));
      });
      var configs = D.get('configs');
      configs[r.id] = newCfg;
      D.save('configs', configs);
      D.addItem('activity', { id: 'a'+Date.now(), type: 'config', text: 'Configuracao de '+r.name+' salva', date: new Date().toISOString().slice(0,10), user: 'Admin' });
      toast('Configuracao salva (DEMO)', 'success');
      closeDrawer();
    });
  }
  function closeDrawer(){
    $('drawer').classList.remove('open');
    $('drawerOverlay').classList.remove('open');
  }

  // Export
  window.GordaoModViews = {
    render: render,
    navigate: navigate,
    openConfigDrawer: openConfigDrawer,
    closeDrawer: closeDrawer,
    toast: toast,
    resourceCard: resourceCard,
    emptyState: emptyState
  };
})(window);
