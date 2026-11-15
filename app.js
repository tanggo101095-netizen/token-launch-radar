// Token Launch Radar dashboard. Renders the board the model in
// lib/model.ts ranked, from ../data.js (window.RADAR_DATA). No network,
// no framework: filtering, sorting and the detail view all run here.
(function () {
  'use strict';
  var D = window.RADAR_DATA;
  var rows = D.rows;
  var bySlug = {};
  rows.forEach(function (r) { bySlug[r.slug] = r; });

  var $ = function (id) { return document.getElementById(id); };
  var fmtUsd = function (n) {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + n;
  };
  var fmtPct = function (v) {
    if (v === null || v === undefined) return '<span class="cat">n/a</span>';
    var cls = v >= 0 ? 'up' : 'down';
    return '<span class="' + cls + '">' + (v >= 0 ? '+' : '') + v.toFixed(1) + '%</span>';
  };
  var fmtAge = function (days) {
    if (days === null || days === undefined) return 'n/a';
    if (days >= 365) return (days / 365).toFixed(1) + ' yrs';
    if (days >= 30) return Math.round(days / 30) + ' mo';
    return days + ' d';
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // Masthead and the model strip: the formula, stated on the page itself.
  $('mastMeta').innerHTML =
    '<strong>' + rows.length + ' protocols ranked</strong><br>' +
    'of ' + D.total_protocols + ' in the snapshot &middot; ' + D.pre_token + ' record no token<br>' +
    'Snapshot as of ' + esc(D.as_of) + ' &middot; watchlist floor ' + fmtUsd(D.floor_usd);
  $('modelStrip').innerHTML =
    '<div class="step"><b>Implied value</b><span>TVL &times; category multiple &times; growth &times; maturity &times; breadth</span></div>' +
    '<div class="step"><b>Category multiple</b><span>The FDV/TVL a launched token of that kind carries, read against the launched set below</span></div>' +
    '<div class="step"><b>Growth</b><span>7-day TVL change, clamped so one hot week cannot dominate</span></div>' +
    '<div class="step"><b>Maturity</b><span>Years tracked with no token earn up to +20% of the multiple</span></div>' +
    '<div class="step"><b>Breadth</b><span>+3% per extra chain, up to eight</span></div>';

  // Filter options, from the data itself.
  var cats = {}, chains = {};
  rows.forEach(function (r) {
    if (r.category) cats[r.category] = 1;
    r.chains.forEach(function (c) { chains[c] = 1; });
  });
  Object.keys(cats).sort().forEach(function (c) {
    var o = document.createElement('option'); o.value = c; o.textContent = c; $('cat').appendChild(o);
  });
  Object.keys(chains).sort().forEach(function (c) {
    var o = document.createElement('option'); o.value = c; o.textContent = c; $('chain').appendChild(o);
  });

  var current = null;

  function visibleRows() {
    var q = $('q').value.trim().toLowerCase();
    var cat = $('cat').value, chain = $('chain').value;
    var watch = $('watchOnly').checked;
    var out = rows.filter(function (r) {
      if (watch && !r.on_watchlist) return false;
      if (cat && r.category !== cat) return false;
      if (chain && r.chains.indexOf(chain) < 0) return false;
      if (q && r.name.toLowerCase().indexOf(q) < 0 && r.slug.indexOf(q) < 0) return false;
      return true;
    });
    var sort = $('sort').value;
    var key = {
      value: function (r) { return -r.implied_value_usd; },
      tvl: function (r) { return -r.tvl_usd; },
      growth: function (r) { return -(r.change_7d === null ? -999 : r.change_7d); },
      age: function (r) { return -(r.age_days === null ? -1 : r.age_days); },
      name: function (r) { return r.name; }
    }[sort];
    out.sort(function (a, b) { var x = key(a), y = key(b); return x < y ? -1 : x > y ? 1 : 0; });
    return out;
  }

  function renderBoard() {
    var list = visibleRows();
    $('rowCount').textContent = 'Showing ' + list.length + ' of ' + rows.length;
    $('boardBody').innerHTML = list.map(function (r) {
      return '<tr data-slug="' + esc(r.slug) + '"' + (current === r.slug ? ' class="selected"' : '') + '>' +
        '<td class="num">' + r.rank + '</td>' +
        '<td><span class="name-cell">' + esc(r.name) + '</span>' +
        (r.on_watchlist ? '<span class="badge">watchlist</span>' : '') +
        '<span class="slug">' + esc(r.slug) + '</span></td>' +
        '<td class="cat">' + esc(r.category || 'Uncategorised') + '</td>' +
        '<td class="num">' + fmtUsd(r.tvl_usd) + '</td>' +
        '<td class="num">' + fmtPct(r.change_7d) + '</td>' +
        '<td class="num">' + fmtAge(r.age_days) + '</td>' +
        '<td class="num value">' + fmtUsd(r.implied_value_usd) + '</td>' +
        '<td class="open-hint">plan &rsaquo;</td></tr>';
    }).join('');
    Array.prototype.forEach.call($('boardBody').querySelectorAll('tr'), function (tr) {
      tr.addEventListener('click', function () { openDetail(tr.getAttribute('data-slug'), true); });
    });
  }

  function openDetail(slug, scroll) {
    var r = bySlug[slug];
    if (!r) return;
    current = slug;
    renderBoard();
    var el = $('detail');
    el.hidden = false;
    el.innerHTML =
      '<button class="close" id="detailClose" type="button">Close &times;</button>' +
      '<h2>' + esc(r.name) + (r.on_watchlist ? '<span class="badge">watchlist</span>' : '') + '</h2>' +
      '<p class="sub">Rank #' + r.rank + ' of ' + rows.length + ' &middot; ' + esc(r.category || 'Uncategorised') +
      ' &middot; tracked since ' + esc(r.listed_at || 'n/a') + '</p>' +
      '<div class="detail-grid"><div>' +
      '<h3>Why this value — the model, line by line</h3>' +
      '<div class="equation">' +
      '<div class="eq-row"><span>Total value locked</span><b>' + fmtUsd(r.tvl_usd) + '</b></div>' +
      '<div class="eq-row"><span>Category multiple (' + esc(r.category || 'default') + ')</span><b>&times; ' + r.base_multiple.toFixed(2) + '</b></div>' +
      '<div class="eq-row"><span>Growth (7d ' + (r.change_7d === null ? 'n/a' : r.change_7d.toFixed(1) + '%') + ')</span><b>&times; ' + r.growth_mult.toFixed(3) + '</b></div>' +
      '<div class="eq-row"><span>Maturity (' + fmtAge(r.age_days) + ' with no token)</span><b>&times; ' + r.maturity_mult.toFixed(3) + '</b></div>' +
      '<div class="eq-row"><span>Breadth (' + r.chains.length + (r.chains.length === 1 ? ' chain' : ' chains') + ')</span><b>&times; ' + r.breadth_mult.toFixed(3) + '</b></div>' +
      '<div class="eq-row eq-total"><span>Implied value</span><b>' + fmtUsd(r.implied_value_usd) + '</b></div>' +
      '</div>' +
      '<div class="kv"><span>Chains: <b>' + esc(r.chains.join(', ')) + '</b></span>' +
      '<span>Records a token: <b>no</b></span></div>' +
      '</div><div>' +
      '<h3>How to farm it</h3>' +
      '<ol class="steps">' + r.farm_steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '</div></div>';
    $('detailClose').addEventListener('click', function () {
      el.hidden = true;
      current = null;
      renderBoard();
    });
    el.scrollTop = 0;
  }

  $('liveBody').innerHTML = D.live.map(function (r) {
    return '<tr><td><span class="name-cell">' + esc(r.name) + '</span></td>' +
      '<td>' + esc(r.symbol || '') + '</td><td class="cat">' + esc(r.category || '') + '</td>' +
      '<td class="num">' + fmtUsd(r.tvl_usd) + '</td><td class="num">' + fmtUsd(r.mcap_usd) + '</td>' +
      '<td class="num">' + r.multiple.toFixed(2) + '&times;</td></tr>';
  }).join('');

  ['q', 'cat', 'chain', 'sort', 'watchOnly'].forEach(function (id) {
    $(id).addEventListener('input', renderBoard);
    $(id).addEventListener('change', renderBoard);
  });

  // Deep links for readers (and for the entry's own screenshots):
  // #detail=<slug> opens a protocol, #cat=<category> filters the board.
  var hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('cat')) $('cat').value = hash.get('cat');
  if (hash.get('watch') === '1') $('watchOnly').checked = true;
  renderBoard();
  if (hash.get('detail')) openDetail(hash.get('detail'), false);
})();
