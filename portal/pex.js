/* Aba "PEX" (Programa de Excelência ArcelorMittal 2026) — painéis da Diretoria e da Supervisão.
   Os números e lançamentos vêm do servidor do Wix (backend/pex.web.js) via mensagem 'pex'.
   Aqui só fica a tela. */
(function () {
  var P = { d: null, uni: '', mes: '', carregando: false, erro: '', salvando: false, dvSalv: {}, aberto: '' };
  var PEND = {}, N = 0;
  addEventListener('message', function (e) { var d = e.data || {}; if (d.tipo === 'pexr' && d.id && PEND[d.id]) { PEND[d.id](d.r || {}); delete PEND[d.id]; } });
  function pede(m) { return new Promise(function (res) { var id = 'px' + (++N); PEND[id] = res; m.tipo = 'pex'; m.id = id; parent.postMessage(m, '*'); setTimeout(function () { if (PEND[id]) { delete PEND[id]; res({ ok: false, erro: 'O servidor não respondeu. Tente de novo.' }); } }, 40000); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(v, d) { if (v == null || v === '') return '—'; return Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 1 : d }); }
  function pc(v) { return v == null ? '—' : (Math.round(v * 1000) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; }
  var MN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function mesNome(k) { var p = String(k).split('-'); return MN[+p[1] - 1] + '/' + p[0].slice(2); }
  var CSS = '<style>.px .pk{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}@media(max-width:900px){.px .pk{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.px .pc{background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:16px}.px .pc small{display:block;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.px .pc b{display:block;font-size:28px;color:#0b2a55;margin:6px 0 2px}.px .pc span{font-size:13px;color:#5b6b7d}' +
    '.px table{width:100%;border-collapse:collapse;font-size:14px}.px th{text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;padding:8px;border-bottom:1px solid #e3e8ef}.px td{padding:8px;border-bottom:1px solid #f0f2f6;vertical-align:middle}' +
    '.px .grp td{background:#f8fafc;font-weight:800;color:#0b2a55;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em}.px .bar{height:8px;background:#eef1f5;border-radius:99px;overflow:hidden;min-width:80px}.px .bar i{display:block;height:100%;border-radius:99px}' +
    '.px .src{font-size:11.5px;color:#64748b}.px .tag{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700}.px .pend{color:#b7791f;background:#fdf3dc}.px .dv{color:#5b4bb7;background:#efedff;cursor:pointer}' +
    '.px .top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:4px 0 16px}.px select,.px input,.px textarea{border:1px solid #cbd5e1;border-radius:8px;padding:7px 9px;font:inherit;font-size:13.5px;background:#fff;box-sizing:border-box}' +
    '.px .frm{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:10px}.px .frm label{font-size:12px;color:#475569;display:block;margin-bottom:3px}.px .frm input,.px .frm select{width:100%}' +
    '.px .sv{background:#0b2a55;color:#fff;border:0;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer}.px .sv[disabled]{opacity:.5}.px .lnk{color:#0b4a9a;cursor:pointer;font-weight:700;font-size:13px}' +
    '.px .dq{background:#fff;border:1px solid #e3e8ef;border-left:5px solid #5b4bb7;border-radius:10px;padding:12px 14px;margin-bottom:10px}.px .dq.ok{border-left-color:#1f7a45}.px .dq textarea{width:100%;min-height:44px;margin-top:8px}' +
    '.px .sec{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin:22px 0 10px}.px .note{font-size:12.5px;color:#64748b}</style>';

  function carrega(uni) {
    P.carregando = true; P.erro = '';
    pede({ op: 'listar', uni: uni || P.uni || '' }).then(function (r) {
      P.carregando = false;
      if (r && r.ok) { P.d = r; P.uni = r.uni; if (!P.mes || !r.meses[P.mes]) P.mes = r.atual; } else P.erro = (r && r.erro) || 'Não foi possível ler o PEX.';
      try { render(); } catch (e) { }
    });
  }
  window.pxUni = function (u) { P.d = null; P.uni = u; P.mes = ''; carrega(u); render(); };
  window.pxMes = function (m) { P.mes = m; render(); };
  window.pxAbre = function (k) { P.aberto = P.aberto === k ? '' : k; render(); };
  window.pxSalvar = function () {
    var c = {}; [].forEach.call(document.querySelectorAll('[data-pxc]'), function (el) { c[el.getAttribute('data-pxc')] = el.value; });
    P.salvando = true; render();
    pede({ op: 'salvar', uni: P.uni, mes: P.mes, campos: c }).then(function (r) {
      P.salvando = false;
      if (r && r.ok) { P.d.meses[r.mes] = r.resultado; } else alert((r && r.erro) || 'Não foi possível salvar.');
      render();
    });
  };
  window.pxDuvida = function (id) {
    var st = document.getElementById('pxds_' + id), rs = document.getElementById('pxdr_' + id);
    P.dvSalv[id] = 1; render();
    pede({ op: 'duvida', item: id, campos: { status: st ? st.value : 'Aberta', resposta: rs ? rs.value : '' } }).then(function (r) {
      delete P.dvSalv[id]; if (r && r.ok) P.d.duvidas = r.duvidas; else alert((r && r.erro) || 'Não foi possível salvar.'); render();
    });
  };
  window.pxNovaDuvida = function () {
    var t = prompt('Nova dúvida para o KDE:'); if (!t) return;
    pede({ op: 'duvida', item: 'novo', campos: { pergunta: t, status: 'Aberta' } }).then(function (r) { if (r && r.ok) P.d.duvidas = r.duvidas; render(); });
  };
  window.pxRecarrega = function () { P.d = null; P.erro = ''; carrega(P.uni); render(); };

  function cor(x) { if (x.pts == null) return '#cbd5e1'; var f = x.max ? x.pts / x.max : 0; return f >= 1 ? '#1f7a45' : f >= .5 ? '#b7791f' : f > 0 ? '#e8692c' : '#c0392b'; }
  function atTxt(x) {
    if (x.k === 'agciv' || x.k === 'agind') return x.at == null ? '—' : pc(x.at) + ' <span class="src">(meta ≤ ' + pc(x.alvo) + ')</span>';
    if (x.k === 'nps') return x.at == null ? '—' : pc(x.at) + ' <span class="src">respostas (mín. 15%)</span>';
    if (x.k === 'acel') return x.real === 'sim' ? 'Atingiu' : x.real === 'nao' ? 'Não atingiu' : '—';
    return pc(x.at);
  }
  function rotulo(k) {
    return { longosFat: 'Longos · faturado (t)', longosMeta: 'Longos · meta (t)', planosFat: 'Planos · faturado (t)', planosMeta: 'Planos · MRF (t)', tubosFat: 'Tubos · faturado (t)', tubosMeta: 'Tubos · MRF (t)', ca50Real: 'PVL CA50 · faturado (R$/t)', ca50Meta: 'PVL CA50 · MRF (R$/t)', trefReal: 'PVL Trefilados · faturado (R$/t)', trefMeta: 'PVL Trefilados · MRF (R$/t)', pvlIndReal: 'PVL Indústria · faturado (R$/t)', pvlIndMeta: 'PVL Indústria · MRF (R$/t)', agCivAgeing: 'Ageing Civil · ageing virada (t)', agCivEstoque: 'Ageing Civil · estoque virada (t)', agIndAgeing: 'Ageing Indústria · ageing virada (t)', agIndEstoque: 'Ageing Indústria · estoque virada (t)', npsNota: 'NPS · nota', npsRespostas: 'NPS · respostas', npsClientes: 'NPS · clientes c/ compra Longos', metodNota: 'Metodologia · nota (0–100)' }[k] || k;
  }

  window.vPEX = function () {
    if (!P.d) { if (!P.carregando && !P.erro) carrega(P.uni); return CSS + '<div class="px"><div class="box" style="padding:28px;text-align:center">' + (P.erro ? esc(P.erro) + ' · <span class="lnk" onclick="pxRecarrega()">tentar de novo</span>' : 'Carregando o PEX…') + '</div></div>'; }
    var D = P.d, M = D.meses[P.mes] || D.meses[D.atual], ks = Object.keys(D.meses).sort();
    var h = CSS + '<div class="px"><h2 style="margin:0">PEX 2026 · Programa de Excelência ArcelorMittal</h2><div class="sub" style="margin:4px 0 6px">Cartilha KPI\'s PEX (2ª edição) · pontuação mensal máxima de 317 pts · Volume e PVL Indústria vêm do Resultado BI; o resto é lançado aqui.</div>';
    h += '<div class="top">';
    if (D.unis.length > 1) h += '<select onchange="pxUni(this.value)">' + D.unis.map(function (u) { return '<option value="' + u + '"' + (u === D.uni ? ' selected' : '') + '>' + esc(D.nomes[u]) + '</option>'; }).join('') + '</select>'; else h += '<b>' + esc(D.nomes[D.uni]) + '</b>';
    h += '<select onchange="pxMes(this.value)">' + ks.slice().reverse().map(function (k) { return '<option value="' + k + '"' + (k === P.mes ? ' selected' : '') + '>' + mesNome(k) + (k === D.atual ? ' (atual)' : '') + '</option>'; }).join('') + '</select>';
    h += '<span class="lnk" onclick="pxRecarrega()">↻ atualizar</span></div>';
    if (D.erroBI) h += '<div class="box note" style="padding:10px 14px;margin-bottom:12px;border-left:4px solid #b7791f">' + esc(D.erroBI) + '</div>';
    var grp = {}; M.indicadores.forEach(function (x) { grp[x.grupo] = grp[x.grupo] || { pts: 0, max: 0 }; grp[x.grupo].pts += x.pts || 0; grp[x.grupo].max += x.max; });
    var pv = grp['PVL'] || { pts: 0, max: 0 }, vo = grp['Volume'] || { pts: 0, max: 0 };
    h += '<div class="pk"><div class="pc"><small>Pontuação de ' + mesNome(P.mes) + '</small><b>' + nf(M.total) + '</b><span>de ' + nf(M.max) + ' pts · ' + pc(M.pct) + (M.pendentes ? ' · ' + M.pendentes + ' indicador(es) sem dado' : '') + '</span></div>' +
      '<div class="pc"><small>Volume</small><b>' + nf(vo.pts) + '</b><span>de ' + nf(vo.max) + ' pts (Longos, Planos, Tubos)</span></div>' +
      '<div class="pc"><small>PVL</small><b>' + nf(pv.pts) + '</b><span>de ' + nf(pv.max) + ' pts (CA50, Trefilados, Indústria)</span></div>' +
      '<div class="pc"><small>Faltando para 100%</small><b style="color:#c0392b">' + nf(Math.max(0, M.max - M.total)) + '</b><span>pts no mês</span></div></div>';
    // tabela
    h += '<div class="box"><h2>Indicadores de ' + mesNome(P.mes) + '</h2><div class="sub">Pontos pela régua da cartilha · <span class="tag pend">sem dado</span> = falta lançar · <span class="tag dv">dúvida</span> = regra a confirmar com o KDE</div><div style="overflow-x:auto"><table><tr><th>Indicador</th><th>Realizado</th><th>Meta</th><th>Atingimento</th><th></th><th>Pontos</th><th>Máx.</th><th>Fonte</th></tr>';
    var g0 = '';
    M.indicadores.forEach(function (x) {
      if (x.grupo !== g0) { g0 = x.grupo; h += '<tr class="grp"><td colspan="8">' + esc(g0) + '</td></tr>'; }
      var f = x.pts == null ? 0 : Math.min(1, x.max ? x.pts / x.max : 0);
      var real = x.k === 'acel' ? '—' : x.k === 'nps' ? (x.real == null ? '—' : 'nota ' + nf(x.real) + ' · ' + nf(x.extra.respostas, 0) + ' resp. / ' + nf(x.extra.clientes, 0) + ' cli.') : nf(x.real, x.un === 'R$/t' ? 0 : 1);
      var meta = x.k === 'agciv' || x.k === 'agind' ? 'estoque ' + nf(x.meta) : x.k === 'acel' ? '—' : nf(x.meta, x.un === 'R$/t' ? 0 : 1);
      h += '<tr><td><b>' + esc(x.nome) + '</b>' + (x.duvida ? ' <span class="tag dv" onclick="document.getElementById(\'pxd_' + x.duvida + '\').scrollIntoView({behavior:\'smooth\'})">dúvida</span>' : '') + '</td><td>' + real + '</td><td>' + meta + '</td><td>' + atTxt(x) + '</td>' +
        '<td style="width:14%"><div class="bar"><i style="width:' + Math.round(f * 100) + '%;background:' + cor(x) + '"></i></div></td>' +
        '<td><b style="color:' + cor(x) + '">' + (x.pts == null ? '<span class="tag pend">sem dado</span>' : nf(x.pts)) + '</b></td><td>' + nf(x.max) + '</td><td class="src">' + esc(x.fonte) + '</td></tr>';
    });
    h += '<tr><td colspan="5"><b>Total do mês</b></td><td><b>' + nf(M.total) + '</b></td><td><b>' + nf(M.max) + '</b></td><td></td></tr></table></div>';
    h += '<div class="note" style="margin-top:8px">Avaliação 360 é anual (Comitê Colegiado, lançada até 31/12) e não entra no placar mensal. Com a nota atual de Marabá (68), fica abaixo de 70: pela página 5 da cartilha, 0 pts. Veja a aba Avaliação 360.</div></div>';
    // lançamentos
    if (D.edita) {
      var man = M.manual || {};
      h += '<div class="box" style="margin-top:14px"><h2>Lançar dados de ' + mesNome(P.mes) + '</h2><div class="sub">Campo em branco = usa o que a rotina gravou na aba PEX Entradas (aparece em cinza) ou o Resultado BI. Preencha só para corrigir. Valores em números, com vírgula ou ponto.' + (man.atualizado ? ' · último lançamento ' + new Date(man.atualizado).toLocaleString('pt-BR') + (man.por ? ' por ' + esc(man.por) : '') : '') + '</div><div class="frm">';
      ['longosFat', 'longosMeta', 'planosFat', 'planosMeta', 'tubosFat', 'tubosMeta', 'ca50Real', 'ca50Meta', 'trefReal', 'trefMeta', 'pvlIndReal', 'pvlIndMeta', 'agCivAgeing', 'agCivEstoque', 'agIndAgeing', 'agIndEstoque', 'npsNota', 'npsRespostas', 'npsClientes', 'metodNota'].forEach(function (k) {
        var rt = (M.rotina || {})[k];
        h += '<div><label>' + esc(rotulo(k)) + '</label><input data-pxc="' + k + '" inputmode="decimal" value="' + esc(man[k] == null ? '' : man[k]) + '"' + (rt != null ? ' placeholder="rotina: ' + esc(rt) + '"' : '') + '></div>';
      });
      h += '<div><label>KPI Acelerador (AMis)</label><select data-pxc="acel"><option value="">— sem dado —</option><option value="sim"' + (man.acel === 'sim' ? ' selected' : '') + '>Atingiu (+16,83 pts)</option><option value="nao"' + (man.acel === 'nao' ? ' selected' : '') + '>Não atingiu</option></select></div>';
      h += '<div style="grid-column:1/-1"><label>Observação do mês</label><input data-pxc="obs" value="' + esc(man.obs || '') + '"></div></div>';
      h += '<div style="margin-top:12px"><button class="sv" onclick="pxSalvar()"' + (P.salvando ? ' disabled' : '') + '>' + (P.salvando ? 'Salvando…' : 'Salvar lançamentos') + '</button></div></div>';
    }
    // evolução
    h += '<div class="box" style="margin-top:14px"><h2>Evolução mês a mês</h2><div class="sub">Pontuação mensal de 2026 · indicadores sem dado contam como 0</div><div style="overflow-x:auto"><table><tr><th>Mês</th><th>Volume</th><th>PVL</th><th>Ageing</th><th>NPS</th><th>Metodologia</th><th>Acelerador</th><th>Total</th><th>% do máx.</th><th>Sem dado</th></tr>';
    ks.slice().reverse().forEach(function (k) {
      var X = D.meses[k], g = {}; X.indicadores.forEach(function (x) { g[x.grupo] = (g[x.grupo] || 0) + (x.pts || 0); });
      h += '<tr' + (k === P.mes ? ' style="background:#f5f8ff"' : '') + '><td><span class="lnk" onclick="pxMes(\'' + k + '\')">' + mesNome(k) + '</span></td><td>' + nf(g['Volume']) + '</td><td>' + nf(g['PVL']) + '</td><td>' + nf(g['Ageing']) + '</td><td>' + nf(g['NPS']) + '</td><td>' + nf(g['Metodologia']) + '</td><td>' + nf(g['KPI Acelerador']) + '</td><td><b>' + nf(X.total) + '</b></td><td>' + pc(X.pct) + '</td><td>' + (X.pendentes || '—') + '</td></tr>';
    });
    h += '</table></div></div>';
    // dúvidas
    var ab = (D.duvidas || []).filter(function (q) { return q.status !== 'Esclarecida'; }).length;
    h += '<div class="sec">Dúvidas da regra para o Rafael (KDE) · ' + ab + ' em aberto</div>';
    (D.duvidas || []).forEach(function (q) {
      var ok = q.status === 'Esclarecida';
      h += '<div class="dq' + (ok ? ' ok' : '') + '" id="pxd_' + q.id + '"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b style="color:#0b2a55">' + esc(q.pergunta) + '</b>' +
        (D.edita ? '<select id="pxds_' + q.id + '"><option' + (!ok ? ' selected' : '') + '>Aberta</option><option' + (ok ? ' selected' : '') + '>Esclarecida</option></select>' : '<span class="tag ' + (ok ? '' : 'pend') + '">' + esc(q.status) + '</span>') + '</div>';
      if (D.edita) h += '<textarea id="pxdr_' + q.id + '" placeholder="Resposta do KDE">' + esc(q.resposta || '') + '</textarea><div style="display:flex;gap:10px;align-items:center;margin-top:6px"><button class="sv" style="padding:6px 12px" onclick="pxDuvida(\'' + q.id + '\')"' + (P.dvSalv[q.id] ? ' disabled' : '') + '>' + (P.dvSalv[q.id] ? 'Salvando…' : 'Salvar') + '</button>' + (q.atualizado ? '<span class="note">' + new Date(q.atualizado).toLocaleString('pt-BR') + (q.por ? ' · ' + esc(q.por) : '') + '</span>' : '') + '</div>';
      else if (q.resposta) h += '<div class="note" style="margin-top:6px">' + esc(q.resposta) + '</div>';
      h += '</div>';
    });
    if (D.edita) h += '<span class="lnk" onclick="pxNovaDuvida()">+ acrescentar dúvida</span>';
    h += '<div style="height:30px"></div></div>';
    return h;
  };
})();
