/* Aba "Avaliação 360" do Painel da Diretoria (carregada pela página KPIs do Wix).
   Os dados (itens, notas, marcações) vêm do servidor do Wix (backend/avaliacao360.web.js) via mensagem 'a360'.
   Aqui só fica a tela: nada de dados da avaliação neste arquivo. */
(function () {
  var A3 = { dados: null, carregando: false, erro: '', filtroArea: '', filtroSit: '', todos: false, abertos: {}, salvando: {} };
  var PEND = {}, N = 0;
  addEventListener('message', function (e) { var d = e.data || {}; if (d.tipo === 'a360r' && d.id && PEND[d.id]) { PEND[d.id](d.r || {}); delete PEND[d.id]; } });
  function pede(m) { return new Promise(function (res) { var id = 'a3' + (++N); PEND[id] = res; m.tipo = 'a360'; m.id = id; parent.postMessage(m, '*'); setTimeout(function () { if (PEND[id]) { delete PEND[id]; res({ ok: false, erro: 'O servidor não respondeu. Tente de novo.' }); } }, 30000); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function n1(v) { return Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }
  function pc(v) { return (Math.round((v || 0) * 1000) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; }
  function hoje() { var d = new Date(); return d.toISOString().slice(0, 10); }
  function dataBR(s) { if (!s) return ''; var p = String(s).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }
  var COR = { 'Não iniciado': ['#8a94a3', '#eef1f5'], 'Em andamento': ['#b7791f', '#fdf3dc'], 'Concluído': ['#1f7a45', '#e3f6ea'], 'Depende da ArcelorMittal': ['#5b4bb7', '#efedff'], 'Não se aplica': ['#64748b', '#f1f5f9'] };
  var PESSOAS = ['Gilvan', 'Vitor', 'Anthony', 'Filipe', 'Luis', 'Bruna', 'Josimar', 'Lavínia', 'Logística', 'Diretoria', 'ArcelorMittal'];
  var CSS = '<style>.a3 .a3k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}@media(max-width:900px){.a3 .a3k{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.a3 .a3c{background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:16px}.a3 .a3c small{display:block;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.a3 .a3c b{display:block;font-size:28px;color:#0b2a55;margin:6px 0 2px}.a3 .a3c span{font-size:13px;color:#5b6b7d}' +
    '.a3 table{width:100%;border-collapse:collapse;font-size:14px}.a3 th{text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;padding:8px;border-bottom:1px solid #e3e8ef}.a3 td{padding:8px;border-bottom:1px solid #f0f2f6;vertical-align:middle}' +
    '.a3 .bar{height:8px;background:#eef1f5;border-radius:99px;overflow:hidden;min-width:120px}.a3 .bar i{display:block;height:100%;border-radius:99px}' +
    '.a3 .chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 14px}.a3 .chip{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer}.a3 .chip.on{background:#0b2a55;color:#fff;border-color:#0b2a55}' +
    '.a3 .it{background:#fff;border:1px solid #e3e8ef;border-left:5px solid #c0392b;border-radius:10px;padding:14px 16px;margin-bottom:10px}.a3 .it.ok{border-left-color:#1f7a45}.a3 .it.and{border-left-color:#b7791f}' +
    '.a3 .ith{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.a3 .itt{font-weight:700;color:#0b2a55;font-size:15px}.a3 .its{font-size:12.5px;color:#64748b;margin-top:2px}' +
    '.a3 .perd{font-weight:800;color:#c0392b;white-space:nowrap}.a3 .obs{font-size:13px;color:#475569;background:#f8fafc;border-radius:8px;padding:8px 10px;margin:8px 0}' +
    '.a3 .frm{display:grid;grid-template-columns:200px 170px 150px 1fr auto;gap:8px;align-items:start;margin-top:8px}@media(max-width:1000px){.a3 .frm{grid-template-columns:1fr 1fr}}' +
    '.a3 select,.a3 input,.a3 textarea{border:1px solid #cbd5e1;border-radius:8px;padding:7px 9px;font:inherit;font-size:13.5px;width:100%;box-sizing:border-box;background:#fff}.a3 textarea{min-height:36px;resize:vertical}' +
    '.a3 .sv{background:#0b2a55;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;white-space:nowrap}.a3 .sv[disabled]{opacity:.5;cursor:default}' +
    '.a3 .tag{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:700}.a3 .hist{font-size:12.5px;color:#475569;margin-top:6px}.a3 .hist div{padding:2px 0}.a3 .lnk{color:#0b4a9a;cursor:pointer;font-size:12.5px;font-weight:700}' +
    '.a3 .venc{color:#c0392b;font-weight:700}.a3 .sec{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin:22px 0 10px}</style>';

  function carrega() {
    if (A3.carregando) return; A3.carregando = true; A3.erro = '';
    pede({ op: 'listar', uni: 'maraba' }).then(function (r) { A3.carregando = false; if (r && r.ok) A3.dados = r; else A3.erro = (r && r.erro) || 'Não foi possível ler a Avaliação 360.'; try { render(); } catch (e) { } });
  }
  function situacaoDe(id) { var m = (A3.dados.marcacoes || {})[id]; return (m && m.situacao) || 'Não iniciado'; }

  window.a3Filtro = function (k, v) { A3[k] = A3[k] === v ? '' : v; render(); };
  window.a3Todos = function () { A3.todos = !A3.todos; render(); };
  window.a3Hist = function (id) { A3.abertos[id] = !A3.abertos[id]; render(); };
  window.a3Salvar = function (id) {
    var g = function (k) { var el = document.getElementById('a3' + k + '_' + id); return el ? el.value : ''; };
    var campos = { situacao: g('s'), responsavel: g('r'), prazo: g('p'), comentario: g('c') };
    A3.salvando[id] = 1; render();
    pede({ op: 'salvar', uni: 'maraba', item: id, campos: campos }).then(function (r) {
      delete A3.salvando[id];
      if (r && r.ok) { A3.dados.marcacoes[id] = r.marcacao; A3.dados.proj = r.proj; var ms = A3.dados.meses || []; var i = ms.findIndex(function (x) { return x.mes === r.mes.mes; }); if (i >= 0) ms[i] = r.mes; else ms.push(r.mes); A3.dados.meses = ms; }
      else alert((r && r.erro) || 'Não foi possível salvar.');
      render();
    });
  };

  function linhaItem(it, D) {
    var m = (D.marcacoes || {})[it.id] || {}, s = m.situacao || 'Não iniciado', perd = it.m - it.n, cor = COR[s] || COR['Não iniciado'];
    var cls = s === 'Concluído' ? ' ok' : (s === 'Em andamento' ? ' and' : '');
    var venc = m.prazo && m.prazo < hoje() && s !== 'Concluído' && s !== 'Não se aplica';
    var dis = D.edita ? '' : ' disabled';
    var h = '<div class="it' + (perd > 0 ? cls : ' ok') + '"><div class="ith"><div><div class="itt">' + esc(it.id) + ' · ' + esc(it.d) + '</div><div class="its">' + esc(D.areas[it.a] || '') + ' · ' + esc(it.s || '') + ' · nota ' + n1(it.n) + ' de ' + n1(it.m) + '</div></div>' +
      '<div style="text-align:right">' + (perd > 0 ? '<div class="perd">−' + n1(perd) + ' pts</div>' : '<div style="color:#1f7a45;font-weight:700">pontuação cheia</div>') + '<span class="tag" style="color:' + cor[0] + ';background:' + cor[1] + '">' + esc(s) + '</span></div></div>';
    if (it.o) h += '<div class="obs"><b>Avaliador:</b> ' + esc(it.o) + '</div>';
    if (perd > 0) {
      h += '<div class="frm"><select id="a3s_' + it.id + '"' + dis + '>' + D.situacoes.map(function (x) { return '<option' + (x === s ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select>' +
        '<input id="a3r_' + it.id + '" list="a3pess" placeholder="Responsável" value="' + esc(m.responsavel || '') + '"' + dis + '>' +
        '<input id="a3p_' + it.id + '" type="date" title="Prazo" value="' + esc(m.prazo || '') + '"' + dis + '>' +
        '<textarea id="a3c_' + it.id + '" placeholder="O que foi feito / próximo passo"' + dis + '>' + esc(m.comentario || '') + '</textarea>' +
        (D.edita ? '<button class="sv" onclick="a3Salvar(\'' + it.id + '\')"' + (A3.salvando[it.id] ? ' disabled' : '') + '>' + (A3.salvando[it.id] ? 'Salvando…' : 'Salvar') + '</button>' : '<span></span>') + '</div>';
      var info = [];
      if (m.prazo) info.push('Prazo: <span class="' + (venc ? 'venc' : '') + '">' + dataBR(m.prazo) + (venc ? ' (vencido)' : '') + '</span>');
      if (m.atualizado) info.push('Atualizado em ' + dataBR(m.atualizado) + (m.por ? ' por ' + esc(m.por) : ''));
      if (m.hist && m.hist.length) info.push('<span class="lnk" onclick="a3Hist(\'' + it.id + '\')">' + (A3.abertos[it.id] ? 'esconder histórico' : 'histórico (' + m.hist.length + ')') + '</span>');
      if (info.length) h += '<div class="hist">' + info.join(' · ') + '</div>';
      if (A3.abertos[it.id] && m.hist) h += '<div class="hist">' + m.hist.slice().reverse().map(function (x) { return '<div>' + dataBR(x.data) + ' · <b>' + esc(x.situacao) + '</b>' + (x.responsavel ? ' · ' + esc(x.responsavel) : '') + (x.prazo ? ' · prazo ' + dataBR(x.prazo) : '') + (x.comentario ? ' — ' + esc(x.comentario) : '') + (x.por ? ' (' + esc(x.por) + ')' : '') + '</div>'; }).join('') + '</div>';
    }
    return h + '</div>';
  }

  window.vA360 = function () {
    if (!A3.dados) { if (!A3.erro) carrega(); return CSS + '<div class="a3"><div class="box" style="padding:28px;text-align:center">' + (A3.erro ? esc(A3.erro) + ' <span class="lnk" onclick="(function(){window.a3Recarrega()})()">tentar de novo</span>' : 'Carregando a Avaliação 360…') + '</div></div>'; }
    var D = A3.dados, av = D.avaliacoes || [], ult = av[av.length - 1] || { total: [0, 0], areas: {} }, ant = av.length > 1 ? av[av.length - 2] : null, P = D.proj || {};
    var perdidos = D.itens.filter(function (x) { return x.n < x.m; }), ptsPerd = perdidos.reduce(function (a, x) { return a + x.m - x.n; }, 0);
    var h = CSS + '<div class="a3"><datalist id="a3pess">' + PESSOAS.map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist>';
    h += '<h2 style="margin:0">Avaliação 360º · DBA Marabá</h2><div class="sub" style="margin:4px 0 16px">Checklist ArcelorMittal CDB/DBA · avaliação ' + esc(ult.titulo || '') + (D.edita ? ' · marque o andamento de cada item; a evolução é registrada mês a mês.' : ' · somente consulta.') + '</div>';
    h += '<div class="a3k"><div class="a3c"><small>Nota atual</small><b>' + pc(ult.total[1] / ult.total[0]) + '</b><span>' + n1(ult.total[1]) + ' de ' + n1(ult.total[0]) + ' pontos</span></div>' +
      '<div class="a3c"><small>Avaliação anterior</small><b>' + (ant ? pc(ant.total[1] / ant.total[0]) : '—') + '</b><span>' + (ant ? esc(ant.titulo) + ' · ' + (ult.total[1] / ult.total[0] >= ant.total[1] / ant.total[0] ? '+' : '') + n1((ult.total[1] / ult.total[0] - ant.total[1] / ant.total[0]) * 100) + ' p.p. agora' : '') + '</span></div>' +
      '<div class="a3c"><small>Pontos perdidos</small><b style="color:#c0392b">' + n1(ptsPerd) + '</b><span>em ' + perdidos.length + ' itens</span></div>' +
      '<div class="a3c"><small>Projeção com o que já foi concluído</small><b style="color:#1f7a45">' + pc(P.pct) + '</b><span>+' + n1(P.ganho) + ' pts recuperados · ' + ((P.cont || {})['Concluído'] || 0) + ' concluídos, ' + ((P.cont || {})['Em andamento'] || 0) + ' em andamento</span></div></div>';
    // áreas
    h += '<div class="box"><h2>Por área</h2><div class="sub">Aderência por área: avaliação anterior × atual · ordenado pelos pontos perdidos</div><div style="overflow-x:auto"><table><tr><th>Área</th><th>' + (ant ? esc(ant.data.slice(5) + '/' + ant.data.slice(2, 4)) : 'Anterior') + '</th><th>Atual</th><th></th><th>Pontos perdidos</th></tr>';
    Object.keys(D.areas).map(function (k) { var a = ult.areas[k] || [0, 0], b = ant ? (ant.areas[k] || [0, 0]) : null; return { k: k, a: a, b: b, perd: a[0] - a[1] }; }).sort(function (x, y) { return y.perd - x.perd; }).forEach(function (r) {
      var p = r.a[0] ? r.a[1] / r.a[0] : 0, c = p >= .9 ? '#1f7a45' : p >= .7 ? '#b7791f' : '#c0392b';
      h += '<tr><td><b>' + esc(D.areas[r.k]) + '</b></td><td>' + (r.b && r.b[0] ? pc(r.b[1] / r.b[0]) : '—') + '</td><td><b style="color:' + c + '">' + pc(p) + '</b></td><td style="width:30%"><div class="bar"><i style="width:' + Math.round(p * 100) + '%;background:' + c + '"></i></div></td><td>' + (r.perd > 0 ? '<span class="perd">−' + n1(r.perd) + '</span>' : '—') + '</td></tr>';
    });
    h += '</table></div></div>';
    // evolução mensal
    var ms = D.meses || [];
    h += '<div class="box" style="margin-top:14px"><h2>Evolução mês a mês</h2><div class="sub">Fotografia do plano de ação no fim de cada mês (atualiza sozinha a cada marcação). Projeção = nota atual + pontos dos itens concluídos.</div>';
    if (!ms.length) h += '<div class="sub" style="margin-top:8px">Ainda sem marcações. A primeira marcação abre o mês de ' + new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) + '.</div>';
    else { h += '<div style="overflow-x:auto"><table><tr><th>Mês</th><th>Projeção</th><th>Pontos recuperados</th><th>Concluídos</th><th>Em andamento</th><th>Não iniciados</th><th>Dependem da ArcelorMittal</th></tr>'; ms.slice().reverse().forEach(function (x) { var c = x.cont || {}; h += '<tr><td><b>' + esc(x.mes.slice(5) + '/' + x.mes.slice(0, 4)) + '</b></td><td><b>' + pc(x.pct) + '</b></td><td>+' + n1(x.ganho) + '</td><td>' + (c['Concluído'] || 0) + '</td><td>' + (c['Em andamento'] || 0) + '</td><td>' + (c['Não iniciado'] || 0) + '</td><td>' + (c['Depende da ArcelorMittal'] || 0) + '</td></tr>'; }); h += '</table></div>'; }
    h += '</div>';
    // plano de ação
    h += '<div class="sec">Onde estamos perdendo · plano de ação</div><div class="chips">';
    Object.keys(D.areas).forEach(function (k) { if (D.itens.some(function (x) { return String(x.a) === k && x.n < x.m; })) h += '<span class="chip' + (A3.filtroArea === k ? ' on' : '') + '" onclick="a3Filtro(\'filtroArea\',\'' + k + '\')">' + esc(D.areas[k]) + '</span>'; });
    h += '<span style="width:12px"></span>';
    D.situacoes.forEach(function (s) { var n = perdidos.filter(function (x) { return situacaoDe(x.id) === s; }).length; if (n) h += '<span class="chip' + (A3.filtroSit === s ? ' on' : '') + '" onclick="a3Filtro(\'filtroSit\',\'' + esc(s) + '\')">' + esc(s) + ' (' + n + ')</span>'; });
    h += '</div>';
    var lista = (A3.todos ? D.itens.slice() : perdidos.slice()).filter(function (x) { return (!A3.filtroArea || String(x.a) === A3.filtroArea) && (!A3.filtroSit || situacaoDe(x.id) === A3.filtroSit); });
    lista.sort(function (a, b) { return (b.m - b.n) - (a.m - a.n) || String(a.id).localeCompare(String(b.id), 'pt', { numeric: true }); });
    if (!lista.length) h += '<div class="box sub" style="padding:18px">Nenhum item com esse filtro.</div>';
    lista.forEach(function (it) { h += linhaItem(it, D); });
    h += '<div style="margin:10px 0 30px"><span class="lnk" onclick="a3Todos()">' + (A3.todos ? 'Mostrar só onde perdemos pontos' : 'Mostrar todos os ' + D.itens.length + ' itens da avaliação') + '</span></div></div>';
    return h;
  };
  window.a3Recarrega = function () { A3.erro = ''; A3.dados = null; render(); };
})();
