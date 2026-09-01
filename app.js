/* GordaoMod 2.0 — App Controller */
(function(window){
  'use strict';
  var V = window.GordaoModViews;
  var D = window.GordaoModData;

  // Sidebar nav
  var navItems = [
    { section: 'Plataforma', items: [
      { label: 'Workspace', icon: '🏠', path: '/workspace' },
      { label: 'Recursos', icon: '📦', path: '/recursos' },
      { label: 'Coleções', icon: '🗂️', path: '/colecoes' },
      { label: 'Categorias', icon: '🏷️', path: '/categorias' },
      { label: 'Bundles', icon: '🎁', path: '/bundles' },
      { label: 'Comparar', icon: '⚖️', path: '/comparar' }
    ]},
    { section: 'Servidor', items: [
      { label: 'Resource Manager', icon: '📋', path: '/workspace/resources' },
      { label: 'Dependency Checker', icon: '🔗', path: '/workspace/dependencies' },
      { label: 'Update Center', icon: '⬆️', path: '/workspace/updates' },
      { label: 'Install Wizard', icon: '➕', path: '/workspace/install' }
    ]},
    { section: 'Recursos', items: [
      { label: 'Documentação', icon: '📖', path: '/docs' },
      { label: 'Criador', icon: '👤', path: '/criador' }
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
        a.innerHTML = '<span style="font-size:16px">'+item.icon+'</span> '+escape(item.label);
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
        if(!q || r.name.toLowerCase().indexOf(q) >= 0 || r.shortDesc.toLowerCase().indexOf(q) >= 0){
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
      if(!q || 'documentação'.indexOf(q) >= 0) items.push({ label: 'Documentação', cat: 'Pagina', path: '/docs' });
      // Workspace
      if(!q || 'workspace'.indexOf(q) >= 0) items.push({ label: 'Workspace', cat: 'Pagina', path: '/workspace' });

      results.innerHTML = '';
      items.slice(0, 20).forEach(function(item, i){
        var el = document.createElement('div');
        el.className = 'cmd-item' + (i === 0 ? ' selected' : '');
        el.innerHTML = '<span>🔍</span> '+escape(item.label)+'<span class="cmd-item-category">'+item.cat+'</span>';
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
        var first = results.querySelector('.cmd-item');
        if(first) first.click();
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
      if((e.ctrlKey || e.metaKey) && e.key === 'k'){
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
      toggle.innerHTML = '☰';
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
