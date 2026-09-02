/* GordaoMod 2.0 — App Controller */
(function(window){
  'use strict';
  var V = window.GordaoModViews;
  var D = window.GordaoModData;
  if(!V || !D || typeof V.render !== 'function'){
    console.error('GordaoMod: data.js ou views.js não carregaram.');
    return;
  }

  // SVG icon map
  var iconMap = {
  "home": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg>",
  "package": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"/></svg>",
  "layers": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12 2 2 7 12 12 22 7 12 2\"/><polyline points=\"2 17 12 22 22 17\"/><polyline points=\"2 12 12 17 22 12\"/></svg>",
  "tag": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z\"/><line x1=\"7\" y1=\"7\" x2=\"7.01\" y2=\"7\"/></svg>",
  "gift": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"20 12 20 22 4 22 4 12\"/><rect x=\"2\" y=\"7\" width=\"20\" height=\"5\"/><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"7\"/><path d=\"M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z\"/><path d=\"M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z\"/></svg>",
  "scale": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><line x1=\"12\" y1=\"22\" x2=\"12\" y2=\"11\"/><line x1=\"7\" y1=\"11\" x2=\"17\" y2=\"11\"/></svg>",
  "clipboard": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\" ry=\"1\"/></svg>",
  "link": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg>",
  "refresh": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"23 4 23 10 17 10\"/><path d=\"M20.49 15a9 9 0 1 1-2.12-9.36L23 10\"/></svg>",
  "plus-circle": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"16\"/><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\"/></svg>",
  "book": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/></svg>",
  "user": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg>",
  "search": "<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/></svg>",
  "menu": "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/><line x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/></svg>"
};

  // Sidebar nav
  var navItems = [
    { section: 'Plataforma', items: [
      { label: 'Workspace', icon: 'home', path: '/workspace' },
      { label: 'Recursos', icon: 'package', path: '/recursos' },
      { label: 'Coleções', icon: 'layers', path: '/colecoes' },
      { label: 'Categorias', icon: 'tag', path: '/categorias' },
      { label: 'Bundles', icon: 'gift', path: '/bundles' },
      { label: 'Comparar', icon: 'scale', path: '/comparar' }
    ]},
    { section: 'Servidor', items: [
      { label: 'Gerenciador de Recursos', icon: 'clipboard', path: '/workspace/resources' },
      { label: 'Verificador de Dependências', icon: 'link', path: '/workspace/dependencies' },
      { label: 'Central de Atualizações', icon: 'refresh', path: '/workspace/updates' },
      { label: 'Assistente de Instalação', icon: 'plus-circle', path: '/workspace/install' }
    ]},
    { section: 'Recursos', items: [
      { label: 'Documentação', icon: 'book', path: '/docs' },
      { label: 'Criador', icon: 'user', path: '/criador' }
    ]}
  ];

  function buildSidebar(){
    var nav = document.getElementById('sidebarNav');
    if(!nav) return;
    nav.innerHTML = '';
    navItems.forEach(function(section){
      var sec = document.createElement('div');
      sec.className = 'nav-section';
      sec.innerHTML = '<div class="nav-section-title">'+escape(section.section)+'</div>';
      section.items.forEach(function(item){
        var a = document.createElement('a');
        a.href = '#' + item.path;
        a.className = 'nav-item';
        a.dataset.path = item.path;
        a.innerHTML = '<span class="nav-icon" aria-hidden="true">'+(iconMap[item.icon] || '')+'</span> '+escape(item.label);
        a.addEventListener('click', function(){
          if(window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
        });
        sec.appendChild(a);
      });
      nav.appendChild(sec);
    });
  }

  function escape(s){ return String(s||'').replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function updateActiveNav(path){
    document.querySelectorAll('.nav-item').forEach(function(a){
      a.classList.toggle('active', a.dataset.path === path);
    });
  }

  // Router
  function handleHash(){
    var hash = window.location.hash.replace(/^#/, '') || '/workspace';
    // Parse query string
    var qidx = hash.indexOf('?');
    var query = {};
    if(qidx >= 0){
      var qs = hash.substring(qidx+1);
      hash = hash.substring(0, qidx);
      qs.split('&').forEach(function(p){ var kv = p.split('='); query[kv[0]] = decodeURIComponent(kv[1]||''); });
    }
    V.render(hash, query);
    updateActiveNav(hash);
  }

  // Command palette
  function buildCommandPalette(){
    var overlay = document.getElementById('cmdOverlay');
    var input = document.getElementById('cmdInput');
    var results = document.getElementById('cmdResults');
    var searchBox = document.getElementById('searchBox');
    if(!overlay) return;

    function open(){
      overlay.classList.add('open');
      input.value = '';
      input.focus();
      searchAll('');
    }
    function close(){ overlay.classList.remove('open'); }

    function searchAll(q){
      q = q.toLowerCase();
      var items = [];
      // Resources
      D.get('resources').forEach(function(r){
        if(!q || r.name.toLowerCase().indexOf(q) >= 0 || (r.shortDesc || '').toLowerCase().indexOf(q) >= 0){
          items.push({ label: r.name, cat: 'Recurso', path: '/recurso/'+r.slug });
        }
      });
      // Categories
      D.get('categories').forEach(function(c){
        if(!q || c.name.toLowerCase().indexOf(q) >= 0){
          items.push({ label: c.name, cat: 'Categoria', path: '/categoria/'+c.slug });
        }
      });
      // Collections
      D.get('collections').forEach(function(c){
        if(!q || c.name.toLowerCase().indexOf(q) >= 0){
          items.push({ label: c.name, cat: 'Coleção', path: '/colecao/'+c.slug });
        }
      });
      // Docs
      if(!q || 'documentação'.indexOf(q) >= 0) items.push({ label: 'Documentação', cat: 'Página', path: '/docs' });
      // Workspace
      var workspaceItems = [
        { label: 'Workspace', cat: 'Página', path: '/workspace' },
        { label: 'Gerenciador de Recursos', cat: 'Página', path: '/workspace/resources' },
        { label: 'Verificador de Dependências', cat: 'Página', path: '/workspace/dependencies' },
        { label: 'Central de Atualizações', cat: 'Página', path: '/workspace/updates' },
        { label: 'Assistente de Instalação', cat: 'Página', path: '/workspace/install' }
      ];
      workspaceItems.forEach(function(w){
        if(!q || w.label.toLowerCase().indexOf(q) >= 0) items.push(w);
      });

      results.innerHTML = '';
      items.slice(0, 20).forEach(function(item, i){
        var el = document.createElement('div');
        el.className = 'cmd-item' + (i === 0 ? ' selected' : '');
        el.setAttribute('role', 'option');
        el.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        el.innerHTML = '<span class="cmd-search-icon" aria-hidden="true">'+iconMap.search+'</span> '+escape(item.label)+'<span class="cmd-item-category">'+item.cat+'</span>';
        el.addEventListener('click', function(){
          V.navigate(item.path);
          close();
        });
        results.appendChild(el);
      });
      if(items.length === 0) results.innerHTML = '<div class="empty-state"><p>Nenhum resultado</p></div>';
    }

    if(searchBox){
      searchBox.addEventListener('click', open);
      searchBox.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') open(); });
    }
    input.addEventListener('input', function(){ searchAll(input.value); });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape') close();
      if(e.key === 'Enter'){
        var selected = results.querySelector('.cmd-item.selected');
        var first = results.querySelector('.cmd-item');
        var target = selected || first;
        if(target) target.click();
      }
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        var sel = results.querySelector('.cmd-item.selected');
        var items = results.querySelectorAll('.cmd-item');
        var idx = Array.prototype.indexOf.call(items, sel);
        if(e.key === 'ArrowDown') idx = Math.min(idx+1, items.length-1);
        else idx = Math.max(idx-1, 0);
        if(sel) sel.classList.remove('selected');
        if(items[idx]){ items[idx].classList.add('selected'); items[idx].scrollIntoView(); }
      }
    });
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });

    // Global shortcut
    document.addEventListener('keydown', function(e){
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
        if(['INPUT','TEXTAREA','SELECT'].indexOf(e.target.tagName) >= 0) return;
        e.preventDefault();
        open();
      }
      if(e.key === 'Escape') close();
    });
  }

  // Notifications
  function buildNotifications(){
    var btn = document.getElementById('notifBtn');
    var panel = document.getElementById('notifPanel');
    if(!btn || !panel) return;
    var notifs = [
      { type: 'warn', title: 'Atualização disponível', desc: 'GM Empregos 2.4.1 disponível', time: '2h' },
      { type: 'danger', title: 'Dependência ausente', desc: 'qbx_core não encontrado', time: '5h' },
      { type: 'success', title: 'Recurso instalado', desc: 'GM Garagem adicionado', time: '1d' },
      { type: 'info', title: 'Coleção adicionada', desc: 'Servidor RP Essencial', time: '2d' }
    ];
    btn.addEventListener('click', function(){
      panel.classList.toggle('open');
      if(panel.classList.contains('open')){
        panel.innerHTML = '<div class="notif-panel-header">Notificações DEMO</div>';
        notifs.forEach(function(n){
          panel.insertAdjacentHTML('beforeend',
            '<div class="notif-item unread"><div class="notif-icon '+n.type+'">●</div>'+
            '<div><div class="notif-title">'+escape(n.title)+'</div><div class="notif-desc">'+escape(n.desc)+'</div>'+
            '<div class="notif-time">há '+n.time+'</div></div></div>');
        });
      }
    });
    document.addEventListener('click', function(e){
      if(!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
    });
  }

  // Drawer overlay
  function setupDrawer(){
    var overlay = document.getElementById('drawerOverlay');
    if(overlay) overlay.addEventListener('click', V.closeDrawer);
  }

  // Mobile sidebar toggle
  function setupMobile(){
    // Add mobile toggle button
    var main = document.querySelector('.main');
    if(main && !document.querySelector('.app-menu-toggle')){
      var toggle = document.createElement('button');
      toggle.className = 'app-menu-toggle';
      toggle.innerHTML = iconMap.menu;
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.addEventListener('click', function(){
        document.getElementById('sidebar').classList.toggle('open');
      });
      main.insertBefore(toggle, main.firstChild);
    }
  }

  // Init
  function init(){
    buildSidebar();
    buildCommandPalette();
    buildNotifications();
    setupDrawer();
    setupMobile();
    handleHash();
    window.addEventListener('hashchange', handleHash);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
