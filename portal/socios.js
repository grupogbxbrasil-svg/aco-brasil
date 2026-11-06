/* Aba "Meu painel" dos sócios e da sucessão (Painel da Diretoria, carregado pela página KPIs do Wix).
   Cada um vê o próprio setor em destaque: Comercial, Financeiro ou Logística; o Maurício vê o todo.
   Os números vêm do servidor do Wix (backend/socios.web.js) pela mensagem 'socio'. Aqui só fica a tela. */
(function () {
  var S = { dados: null, carregando: false, erro: '', lido: 0 };
  var PEND = {}, N = 0;
  addEventListener('message', function (e) { var d = e.data || {}; if (d.tipo === 'socior' && d.id && PEND[d.id]) { PEND[d.id](d.r || {}); delete PEND[d.id]; } });
  function pede(m) { return new Promise(function (res) { var id = 'sc' + (++N); PEND[id] = res; m.tipo = 'socio'; m.id = id; parent.postMessage(m, '*'); setTimeout(function () { if (PEND[id]) { delete PEND[id]; res({ ok: false, erro: 'O servidor não respondeu. Toque em Atualizar.' }); } }, 45000); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ok(v) { return v != null && isFinite(v); }
  function n0(v) { return ok(v) ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '–'; }
  function n1(v) { return ok(v) ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '–'; }
  function pc(v) { return ok(v) ? (Math.round(v * 1000) / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : '–'; }
  function pcN(v) { return ok(v) ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : '–'; }
  function rs(v) { if (!ok(v)) return '–'; var a = Math.abs(v); if (a >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi'; if (a >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil'; return 'R$ ' + n0(v); }
  var MESN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function mesNome(k) { if (!k) return ''; var p = String(k).split('-'); return MESN[+p[1] - 1] + '/' + String(p[0]).slice(2); }
  var UNI = [['maraba', 'DBA Marabá'], ['belem', 'DBA Belém']];
  var SET = [['civil', 'Construção civil'], ['industria', 'Indústria'], ['planos', 'Planos e derivados'], ['tubos', 'Tubos'], ['terceiros', 'Terceiros'], ['bba', 'BBA']];
  var SETOR_NOME = { comercial: 'Comercial', financeiro: 'Financeiro', logistica: 'Logística', geral: 'Visão do todo' };
  function cor(at) { if (!ok(at)) return '#94a3b8'; return at >= 1 ? '#1f7a45' : at >= 0.9 ? '#b7791f' : '#c0392b'; }

  var CSS = '<style>' +
    '.sc{font-size:15px}.sc h3{font-size:19px;color:#0b2a55;margin:26px 0 10px;display:flex;align-items:center;gap:10px}.sc h3 .tag{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:#f26b1d;color:#fff;border-radius:99px;padding:3px 10px}' +
    '.sc .hd{background:#0b2a55;color:#fff;border-radius:14px;padding:20px 22px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.sc .hd b{font-size:24px;display:block}.sc .hd span{opacity:.8;font-size:14px}.sc .hd button{background:#fff;color:#0b2a55;border:0;border-radius:10px;padding:10px 16px;font-weight:700;font-size:14px;cursor:pointer}' +
    '.sc .duas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}@media(max-width:860px){.sc .duas{grid-template-columns:minmax(0,1fr)}}' +
    '.sc .cx{min-width:0;overflow-x:auto;background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:16px}.sc .cx h4{margin:0 0 12px;font-size:15px;color:#0b2a55;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.sc .cx h4 small{font-weight:500;color:#64748b;font-size:12px}' +
    '.sc .ks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media(max-width:520px){.sc .ks{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.sc .k{background:#f6f8fb;border-radius:10px;padding:10px 12px}.sc .k small{display:block;font-size:11.5px;color:#64748b;text-transform:uppercase;letter-spacing:.05em}.sc .k b{display:block;font-size:22px;color:#0b2a55;margin-top:2px}.sc .k span{font-size:12.5px;color:#5b6b7d}' +
    '.sc .bar{height:10px;background:#eef1f5;border-radius:99px;overflow:hidden;margin:6px 0 2px}.sc .bar i{display:block;height:100%;border-radius:99px}' +
    '.sc table{width:100%;min-width:300px;border-collapse:collapse;font-size:13.5px;margin-top:12px}.sc th{text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;padding:6px;border-bottom:1px solid #e3e8ef}.sc th:first-child,.sc td:first-child{text-align:left}.sc td{text-align:right;padding:6px;border-bottom:1px solid #f0f2f6}' +
    '.sc .ev{display:flex;align-items:flex-end;gap:6px;height:110px;margin-top:12px}.sc .ev div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:11px;color:#64748b}.sc .ev i{display:block;width:100%;border-radius:4px 4px 0 0;background:#0b2a55}.sc .ev .m{position:relative;width:100%;flex:1;display:flex;align-items:flex-end}.sc .ev .mt{position:absolute;left:0;right:0;border-top:2px dashed #f26b1d}' +
    '.sc .al{border-radius:10px;padding:10px 12px;font-size:13.5px;margin-top:10px}.sc .al.r{background:#fdecea;color:#8a1c12}.sc .al.a{background:#fff4dc;color:#7a4b06}.sc .al.v{background:#e6f4ec;color:#14532d}' +
    '.sc .lk{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.sc .lk button{border:1px solid #cbd5e1;background:#fff;border-radius:99px;padding:7px 14px;font-size:13px;cursor:pointer;color:#0b2a55;font-weight:600}' +
    '.sc .mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}@media(max-width:860px){.sc .mini{grid-template-columns:minmax(0,1fr)}}' +
    '.sc .vz{color:#64748b;font-size:13.5px}' +
    '</style>';

  function vaiAba(k) { try { ABA = k; localStorage.setItem('dir_aba', k); render(); scrollTo({ top: 0 }); } catch (e) { } }
  window.__scAba = vaiAba;
  function atalhos(l) { return '<div class="lk">' + l.map(function (x) { return '<button onclick="__scAba(\'' + x[0] + '\')">' + esc(x[1]) + ' →</button>'; }).join('') + '</div>'; }
  function semDado(o, txt) { return !o || o.erro ? '<div class="vz">' + esc(txt) + (o && o.erro ? ' (' + esc(o.erro) + ')' : '') + '</div>' : ''; }

  // ---------- Comercial ----------
  function comCompleto(c, nome) {
    var v = semDado(c, 'Sem leitura do RESULTADO BI agora.'); if (v) return '<div class="cx"><h4>' + nome + '</h4>' + v + '</div>';
    var t = c.tot || {}, at = c.ating, ap = c.atingProj;
    var h = '<div class="cx"><h4>' + nome + ' <small>' + esc(mesNome(c.mes)) + ' · dia útil ' + n0(c.dias && c.dias.dc) + ' de ' + n0(c.dias && c.dias.ut) + '</small></h4>';
    h += '<div class="ks"><div class="k"><small>Faturado</small><b>' + n1(c.fat) + ' t</b><span>meta ' + n0(c.meta) + ' t · ' + pc(at) + '</span><div class="bar"><i style="width:' + Math.min(100, (at || 0) * 100) + '%;background:' + cor(at) + '"></i></div></div>' +
      '<div class="k"><small>Projeção do mês</small><b style="color:' + cor(ap) + '">' + n0(c.proj) + ' t</b><span>' + pc(ap) + ' da meta</span></div>' +
      '<div class="k"><small>Carteira</small><b>' + n1(t.cart) + ' t</b><span>fat. + carteira ' + n0((c.fat || 0) + (t.cart || 0)) + ' t</span></div>' +
      '<div class="k"><small>Clientes com compra</small><b>' + n0(t.cli) + '</b><span>ticket ' + n1(t.ticket) + ' t</span></div>' +
      '<div class="k"><small>PVL faturado</small><b>' + n0(t.pvl) + '</b><span>R$/t</span></div>' +
      '<div class="k"><small>Markup</small><b>' + pcN(t.markup) + '</b><span>RAG ' + n0(t.rag) + '</span></div></div>';
    h += '<table><tr><th>Setor</th><th>Meta</th><th>Fat.</th><th>%</th><th>Cart.</th><th>PVL</th><th>Mkp</th></tr>' + SET.map(function (s) { var x = (c.setores || {})[s[0]]; if (!x) return ''; var a = x.meta ? x.fat / x.meta : null; return '<tr><td>' + s[1] + '</td><td>' + n0(x.meta) + '</td><td>' + n1(x.fat) + '</td><td style="color:' + cor(a) + ';font-weight:700">' + pc(a) + '</td><td>' + n1(x.cart) + '</td><td>' + n0(x.pvl) + '</td><td>' + pcN(x.markup) + '</td></tr>'; }).join('') + '</table>';
    var ev = (c.evol || []).filter(function (m) { return m.fat > 0 || m.mes === c.mes; });
    if (ev.length) {
      var mx = Math.max.apply(null, ev.map(function (m) { return Math.max(m.fat || 0, m.meta || 0); }).concat([1]));
      h += '<div class="ev">' + ev.map(function (m) { var a = m.meta ? m.fat / m.meta : null; return '<div title="' + mesNome(m.mes) + ': ' + n1(m.fat) + ' t de ' + n0(m.meta) + ' t"><span style="color:' + cor(a) + ';font-weight:700">' + (ok(a) ? Math.round(a * 100) + '%' : '') + '</span><div class="m"><i style="height:' + ((m.fat || 0) / mx * 100) + '%;' + (m.mes === c.mes ? 'background:#f26b1d' : '') + '"></i>' + (m.meta ? '<b class="mt" style="bottom:' + (m.meta / mx * 100) + '%"></b>' : '') + '</div>' + MESN[+m.mes.slice(5) - 1] + '</div>'; }).join('') + '</div><div class="vz" style="margin-top:4px">Barras: faturado no mês · tracejado: meta</div>';
    }
    if (c.anterior && c.anterior.meta) { var aa = c.anterior.fat / c.anterior.meta; h += '<div class="al ' + (aa >= 1 ? 'v' : 'a') + '">' + esc(mesNome(c.anterior.mes)) + ' fechou com ' + n0(c.anterior.fat) + ' t de ' + n0(c.anterior.meta) + ' t (' + pc(aa) + ').</div>'; }
    return h + '</div>';
  }
  function comResumo(c, nome) { if (!c || c.erro) return '<div class="vz">' + nome + ': sem leitura</div>'; return '<div style="margin-bottom:8px"><b>' + nome + '</b> · ' + n1(c.fat) + ' de ' + n0(c.meta) + ' t (' + pc(c.ating) + ') · projeção <b style="color:' + cor(c.atingProj) + '">' + pc(c.atingProj) + '</b></div>'; }

  // ---------- Logística ----------
  function logCompleto(l, nome) {
    var v = semDado(l, 'Sem leitura do Painel da carteira agora.'); if (v) return '<div class="cx"><h4>' + nome + '</h4>' + v + '</div>';
    var tot = l.total || {}, bl = l.bloqueada || {}, fv = l.faturavel || {}, tr = l.travada || {}, ru = l.ruptura || {};
    var ph = ok(l.podeHoje) ? l.podeHoje / 100 : null;
    var h = '<div class="cx"><h4>' + nome + ' <small>base ' + esc(l.base || '–') + '</small></h4>';
    h += '<div class="ks"><div class="k"><small>Pode faturar hoje</small><b style="color:' + (ph >= 0.3 ? '#1f7a45' : ph >= 0.15 ? '#b7791f' : '#c0392b') + '">' + pc(ph) + '</b><span>' + n1(fv.t) + ' t · ' + n0(fv.ordens) + ' ordens</span></div>' +
      '<div class="k"><small>Carteira total</small><b>' + n1(tot.t) + ' t</b><span>' + n0(tot.ordens) + ' ordens</span></div>' +
      '<div class="k"><small>Bloqueada</small><b>' + n1(bl.t) + ' t</b><span>' + pcN(bl.pct) + ' · pgto/crédito/estoque</span></div>' +
      '<div class="k"><small>Travada por 1 item</small><b>' + n1(tr.t) + ' t</b><span>' + n0(tr.ordens) + ' ordem(ns)</span></div>' +
      '<div class="k"><small>Ruptura hoje</small><b>' + esc(ru.rupturaHoje || '–') + '</b><span>' + esc(ru.skus || '') + ' em risco · ' + esc(ru.vendaRisco || '') + '</span></div>' +
      '<div class="k"><small>Ageing +90 dias</small><b>' + esc(ru.ageing90 || '–') + '</b><span>sem giro ' + esc(ru.semGiro || '–') + '</span></div></div>';
    if (ru.status) h += '<div class="al ' + (/REPOR|CRIT/i.test(ru.status) ? 'r' : /ATEN/i.test(ru.status) ? 'a' : 'v') + '">Estoque: <b>' + esc(ru.status) + '</b> · ' + esc(ru.pctVenda || '') + ' da venda média em risco.</div>';
    if (l.cif) h += '<div class="al a">' + esc(l.cif.titulo || 'Pré-rotas CIF') + ': ' + n1((l.cif.faturavelKg || 0) / 1000) + ' t faturáveis · ' + esc(l.cif.status || '') + '</div>';
    if (l.bases) { var b = l.bases, at = (b.atrasadas || []); h += at.length ? '<div class="al r">Bases atrasadas: ' + esc(at.join(', ')) + (b.semRegistro && b.semRegistro.length ? ' · sem registro: ' + esc(b.semRegistro.join(', ')) : '') + '</div>' : '<div class="al v">Bases da Logística em dia.</div>'; }
    return h + '</div>';
  }
  function logResumo(l, nome) { if (!l || l.erro) return '<div class="vz">' + nome + ': sem leitura</div>'; var at = l.bases && l.bases.atrasadas ? l.bases.atrasadas.length : 0; return '<div style="margin-bottom:8px"><b>' + nome + '</b> · pode faturar hoje ' + pcN(l.podeHoje) + ' · bloqueada ' + n1(l.bloqueada && l.bloqueada.t) + ' t' + (at ? ' · <span style="color:#c0392b">' + at + ' base(s) atrasada(s)</span>' : '') + '</div>'; }

  // ---------- Financeiro ----------
  function finCompleto(f, nome) {
    var v = semDado(f, 'Sem leitura das bases do Financeiro agora.'); if (v) return '<div class="cx"><h4>' + nome + '</h4>' + v + '</div>';
    var d = f.dba, h = '<div class="cx"><h4>' + nome + (d && d.enviado ? ' <small>risco enviado em ' + esc(String(d.enviado).slice(0, 16)) + '</small>' : '') + '</h4>';
    if (d) {
      h += '<div class="ks"><div class="k"><small>Em atraso</small><b style="color:' + (d.atraso > 0 ? '#c0392b' : '#1f7a45') + '">' + rs(d.atraso) + '</b><span>' + n0(d.clientesAtraso) + ' clientes · ' + n0(d.atraso30) + ' com +30 dias</span></div>' +
        '<div class="k"><small>Contas a receber</small><b>' + rs(d.receber) + '</b><span>exposição ' + rs(d.exposicao) + '</span></div>' +
        '<div class="k"><small>Limite DBA</small><b>' + rs(d.limite) + '</b><span>' + n0(d.clientes) + ' clientes com crédito</span></div>' +
        '<div class="k"><small>Bloqueados</small><b>' + n0(d.bloqueados) + '</b><span>clientes com bloqueio SAP</span></div>' +
        '<div class="k"><small>OV aguardando liberação</small><b>' + rs(d.ovPendente) + '</b><span>ordens pendentes</span></div></div>';
      if (d.maiores && d.maiores.length) h += '<table><tr><th>Maiores atrasos</th><th>Valor</th><th>Dias</th></tr>' + d.maiores.map(function (x) { return '<tr><td>' + esc(x.nome) + '</td><td>' + rs(x.atr) + '</td><td>' + n0(x.dias) + '</td></tr>'; }).join('') + '</table>';
    } else h += '<div class="vz">O risco DBA (SAP) desta unidade ainda não foi enviado pelo Financeiro.</div>';
    var lin = [];
    if (f.alpe) lin.push('<tr><td>ALPE</td><td>' + rs(f.alpe.limite) + '</td><td>' + rs(f.alpe.disponivel) + '</td><td>' + n0(f.alpe.clientes) + '</td></tr>');
    if (f.amcard) lin.push('<tr><td>AMCARD</td><td>' + rs(f.amcard.limite) + '</td><td>' + rs(f.amcard.disponivel) + '</td><td>' + n0(f.amcard.clientes) + '</td></tr>');
    if (f.seguro) lin.push('<tr><td>Seguro ArcelorMittal</td><td>' + rs(f.seguro.limite) + '</td><td>exp. ' + rs(f.seguro.exposicao) + '</td><td>' + n0(f.seguro.clientes) + '</td></tr>');
    if (lin.length) h += '<table><tr><th>Linhas de crédito</th><th>Limite</th><th>Disponível</th><th>Clientes</th></tr>' + lin.join('') + '</table>';
    return h + '</div>';
  }
  function finResumo(f, nome) { if (!f || f.erro || !f.dba) return '<div class="vz">' + nome + ': risco DBA não enviado</div>'; return '<div style="margin-bottom:8px"><b>' + nome + '</b> · em atraso <b style="color:' + (f.dba.atraso > 0 ? '#c0392b' : '#1f7a45') + '">' + rs(f.dba.atraso) + '</b> (' + n0(f.dba.clientesAtraso) + ' clientes) · ' + n0(f.dba.bloqueados) + ' bloqueados</div>'; }

  var BLOCOS = {
    comercial: { t: 'Comercial', full: comCompleto, mini: comResumo, lk: [['resumo', 'Resumo'], ['ranking', 'Ranking'], ['funil', 'Funil'], ['metodologia', 'Metodologia'], ['pex', 'PEX']] },
    logistica: { t: 'Logística', full: logCompleto, mini: logResumo, lk: [['logistica', 'Relatórios da Logística']] },
    financeiro: { t: 'Financeiro', full: finCompleto, mini: finResumo, lk: [['credito', 'Radar de crédito'], ['remuneracao', 'Remuneração']] }
  };
  function setor(k, completo, destaque) {
    var b = BLOCOS[k], dd = S.dados[k] || {};
    if (completo) return '<h3>' + b.t + (destaque ? ' <span class="tag">seu setor</span>' : '') + '</h3><div class="duas">' + UNI.map(function (u) { return b.full(dd[u[0]], u[1]); }).join('') + '</div>' + atalhos(b.lk.filter(function (x) { return ABAS.some(function (a) { return a[0] === x[0]; }); }));
    return '<div class="cx"><h4>' + b.t + '</h4>' + UNI.map(function (u) { return b.mini(dd[u[0]], u[1]); }).join('') + atalhos(b.lk.filter(function (x) { return ABAS.some(function (a) { return a[0] === x[0]; }); }).slice(0, 2)) + '</div>';
  }

  function carregar() {
    if (S.carregando) return; S.carregando = true; S.erro = '';
    pede({ op: 'painel' }).then(function (r) {
      S.carregando = false;
      if (!r || !r.ok) { S.erro = (r && r.erro) || 'Não consegui carregar.'; } else { S.dados = r; S.lido = Date.now(); }
      try { if (ABA === 'socio') render(); } catch (e) { }
    });
  }
  window.__scAtualizar = function () { S.dados = null; carregar(); try { render(); } catch (e) { } };

  window.vSocio = function () {
    if (!S.dados && !S.carregando && !S.erro) carregar();
    if (S.erro) return CSS + '<div class="sc"><div class="al r">' + esc(S.erro) + ' <button onclick="__scAtualizar()">Tentar de novo</button></div></div>';
    if (!S.dados) return CSS + '<div class="sc"><div class="vz" style="padding:30px 0">Carregando o seu painel (Comercial, Logística e Financeiro das duas unidades)…</div></div>';
    if (Date.now() - S.lido > 10 * 60 * 1000) setTimeout(carregar, 0);
    var p = S.dados.perfil || {}, set = p.setor || 'geral';
    var hora = new Date(S.dados.lidoEm || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var h = CSS + '<div class="sc"><div class="hd"><div><b>Olá, ' + esc(p.nome || '') + '</b><span>' + esc(p.papel || '') + ' · ' + esc(SETOR_NOME[set] || '') + ' em destaque · DBA Marabá e DBA Belém · lido às ' + hora + '</span></div><button onclick="__scAtualizar()">Atualizar</button></div>';
    if (p.mesa && ABAS.some(function (a) { return a[0] === 'mesa'; })) h += '<div class="al v" style="margin-top:14px;font-size:15px">📝 <b>Mesa do Maurício</b>: escreva ideias, ensinamentos e pedidos; a resposta volta para você lá. <button onclick="__scAba(\'mesa\')" style="margin-left:8px">Abrir a Mesa →</button></div>';
    if (set === 'geral') { ['comercial', 'logistica', 'financeiro'].forEach(function (k) { h += setor(k, true, false); }); }
    else {
      h += setor(set, true, true);
      h += '<h3>Outros setores</h3><div class="mini">' + ['comercial', 'logistica', 'financeiro'].filter(function (k) { return k !== set; }).map(function (k) { return setor(k, false); }).join('') + '</div>';
    }
    return h + '</div>';
  };
})();
