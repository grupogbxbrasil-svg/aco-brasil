/* Aba "Agenda" da Supervisão (página Supervisão do Wix) e da gerência (Diretoria/KPIs).
   Rotinas da metodologia (geradas pela data), recados da gerência e afazeres próprios, com situação e semana.
   Os dados ficam no servidor do Wix (backend/agenda.web.js) e chegam pela mensagem 'agenda'. Aqui só fica a tela. */
(function () {
  var G = { dados: null, carregando: false, erro: '', uni: '', data: '', filtro: 'todos', novo: false, salvando: false, aberto: {} };
  var PEND = {}, N = 0, timer = null;
  addEventListener('message', function (e) { var d = e.data || {}; if (d.tipo === 'agendar' && d.id && PEND[d.id]) { PEND[d.id](d.r || {}); delete PEND[d.id]; } });
  function pede(m) { return new Promise(function (res) { var id = 'ag' + (++N); PEND[id] = res; m.tipo = 'agenda'; m.id = id; parent.postMessage(m, '*'); setTimeout(function () { if (PEND[id]) { delete PEND[id]; res({ ok: false, erro: 'O servidor não respondeu. Tente de novo.' }); } }, 30000); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'], DC = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function dt(s) { var p = String(s).split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(d) { return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  function br(s) { var p = String(s).split('-'); return p[2] + '/' + p[1]; }
  function saud() { var h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
  var ST = { pendente: ['Pendente', '#f59e0b', 'rgba(245,158,11,.14)'], andamento: ['Em andamento', '#60a5fa', 'rgba(96,165,250,.16)'], concluida: ['Concluída', '#34d399', 'rgba(52,211,153,.14)'] };
  var PROX = { pendente: 'andamento', andamento: 'concluida', concluida: 'pendente' };
  var OR = { rotina: ['Rotina da metodologia', '#60a5fa'], recado: ['Recado da gerência', '#f26b1d'], proprio: ['Meu afazer', '#34d399'] };

  var CSS = '<style>' +
    '.ag{max-width:1000px;font-size:15px}.ag .cx{background:#0b1730;color:#e8eefb;border-radius:18px;padding:22px;border:1px solid #1d3159}' +
    '.ag .top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.ag h2{margin:0;font-size:26px;color:#fff}.ag .sub{color:#9fb3cf;font-size:13.5px;margin-top:4px}' +
    '.ag .unis button{background:#13254a;color:#cfe0ff;border:1px solid #2a4580;border-radius:99px;padding:7px 14px;font-size:13px;cursor:pointer;margin-left:6px}.ag .unis button.on{background:#f26b1d;border-color:#f26b1d;color:#fff}' +
    '.ag .ks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:18px 0}@media(max-width:640px){.ag .ks{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.ag .k{border-radius:12px;padding:12px 14px;cursor:pointer;border:1px solid transparent}.ag .k b{display:block;font-size:30px;line-height:1.1}.ag .k span{font-size:13px;color:#cbd5e1}.ag .k.on{border-color:#ffffff55}' +
    '.ag .sem{display:grid;grid-template-columns:auto repeat(6,minmax(0,1fr)) auto;gap:6px;align-items:stretch;margin-bottom:16px}' +
    '.ag .sem button{background:#101f3f;border:1px solid #1d3159;color:#cfe0ff;border-radius:12px;padding:8px 2px;cursor:pointer;font-size:12px;line-height:1.3}.ag .sem button b{display:block;font-size:17px;color:#fff}.ag .sem button.on{background:#f26b1d;border-color:#f26b1d}.ag .sem button.hj{box-shadow:inset 0 0 0 2px #60a5fa}.ag .sem button.nu{opacity:.45}.ag .sem .nav{padding:8px 10px;font-size:16px}' +
    '.ag .dots{display:flex;gap:3px;justify-content:center;margin-top:4px}.ag .dots i{width:6px;height:6px;border-radius:50%;background:#33507f}.ag .dots i.f{background:#34d399}' +
    '.ag h3{font-size:17px;margin:4px 0 10px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.ag h3 button{background:#f26b1d;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-weight:700;font-size:14px;cursor:pointer}' +
    '.ag .it{display:grid;grid-template-columns:62px 4px minmax(0,1fr) auto;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid #1a2c52}' +
    '@media(max-width:640px){.ag .it{grid-template-columns:46px 4px minmax(0,1fr);gap:10px}.ag .it>.chip{grid-column:3;justify-self:start;margin-top:-4px}.ag .br{grid-row:span 2}.ag .cx{padding:16px}}' +
    '.ag .hr{font-weight:700;font-size:16px;color:#fff;padding-top:2px}.ag .br{border-radius:4px;align-self:stretch;min-height:44px}' +
    '.ag .tt{font-weight:700;font-size:16px;color:#fff}.ag .ds{color:#b8c7e0;font-size:14px;margin-top:2px;line-height:1.45}.ag .mt{font-size:12px;color:#8aa0c4;margin-top:6px;display:flex;gap:8px;flex-wrap:wrap}' +
    '.ag .mt .at{color:#fda4af;font-weight:700}.ag .nt{background:#13254a;border-radius:10px;padding:8px 10px;margin-top:8px;font-size:13.5px;color:#dbe7ff}' +
    '.ag .chip{border:0;border-radius:99px;padding:6px 12px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}' +
    '.ag .acoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.ag .acoes button,.ag .acoes input{background:#13254a;border:1px solid #2a4580;color:#dbe7ff;border-radius:10px;padding:7px 10px;font-size:13px}.ag .acoes input{flex:1;min-width:160px}.ag .acoes button{cursor:pointer}' +
    '.ag .fm{background:#101f3f;border:1px solid #2a4580;border-radius:14px;padding:14px;margin-bottom:14px;display:grid;grid-template-columns:110px 130px minmax(0,1fr);gap:10px}@media(max-width:640px){.ag .fm{grid-template-columns:1fr 1fr}.ag .fm .w{grid-column:1/-1}}' +
    '.ag .fm input,.ag .fm textarea{background:#0b1730;border:1px solid #2a4580;color:#fff;border-radius:10px;padding:10px;font-size:15px;font-family:inherit;width:100%;box-sizing:border-box}.ag .fm textarea{grid-column:1/-1;min-height:70px}.ag .fm .bt{grid-column:1/-1;display:flex;gap:8px}.ag .fm .bt button{border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer}' +
    '.ag .vz{color:#9fb3cf;padding:18px 0}.ag .er{background:#3b1220;color:#fecdd3;border-radius:10px;padding:10px 12px;margin-bottom:12px}' +
    '.ag .leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#9fb3cf;margin-top:12px}.ag .leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}' +
    '</style>';

  function rr() { try { if (ABA === 'agenda') { var a = document.activeElement, id = a && a.id; render(); if (id) { var b = document.getElementById(id); if (b) b.focus(); } } } catch (e) { } }
  function carregar(sil) {
    if (G.carregando) return; G.carregando = true;
    pede({ op: 'listar', uni: G.uni, data: G.data }).then(function (r) {
      G.carregando = false;
      if (!r || !r.ok) { if (!sil) G.erro = (r && r.erro) || 'Não consegui abrir a agenda.'; } else { G.erro = ''; G.dados = r; G.uni = r.uni; G.data = r.data; }
      var ae = document.activeElement; if (sil && ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return; rr();
    });
  }
  function relogio() { if (timer) return; timer = setInterval(function () { try { if (ABA === 'agenda') carregar(true); } catch (e) { } }, 120000); }
  function troca(it) { if (!G.dados || !it) return; var ok = false; G.dados.itens = G.dados.itens.map(function (x) { if ((it.id && x.id === it.id) || (it.chave && x.chave === it.chave)) { ok = true; return Object.assign({}, it, { atrasado: x.atrasado }); } return x; }); if (!ok) G.dados.itens.push(it); }
  function salva(d) { d.uni = G.uni; return pede({ op: 'salvar', dados: d }).then(function (r) { if (!r || !r.ok) { G.erro = (r && r.erro) || 'Não consegui salvar.'; rr(); return null; } G.erro = ''; return r; }); }

  window.__agUni = function (u) { G.uni = u; G.dados = null; carregar(); rr(); };
  window.__agDia = function (d) { G.data = d; G.dados = null; carregar(); rr(); };
  window.__agSem = function (n) { var d = dt(G.data); G.data = iso(new Date(d.getTime() + n * 7 * 864e5)); G.dados = null; carregar(); rr(); };
  window.__agFiltro = function (f) { G.filtro = G.filtro === f ? 'todos' : f; rr(); };
  window.__agNovo = function () { G.novo = !G.novo; rr(); };
  window.__agAbre = function (k) { G.aberto[k] = !G.aberto[k]; rr(); };
  window.__agStatus = function (k) {
    var it = (G.dados.itens || []).filter(function (x) { return (x.id || x.chave) === k; })[0]; if (!it) return;
    var novo = PROX[it.status] || 'andamento'; var ant = it.status; it.status = novo; rr();
    salva({ acao: 'status', id: it.id, chave: it.id ? '' : it.chave, status: novo }).then(function (r) { if (r) { troca(r.item); carregar(true); } else { it.status = ant; rr(); } });
  };
  window.__agNota = function (k) {
    var it = (G.dados.itens || []).filter(function (x) { return (x.id || x.chave) === k; })[0]; var el = document.getElementById('agN_' + k.replace(/[^a-z0-9]/gi, '')); if (!it || !el) return;
    salva({ acao: 'status', id: it.id, chave: it.id ? '' : it.chave, status: it.status, nota: el.value }).then(function (r) { if (r) { troca(r.item); G.aberto[k] = false; rr(); } });
  };
  window.__agExcluir = function (id) { if (!confirm('Excluir este item?')) return; salva({ acao: 'excluir', id: id }).then(function (r) { if (r) { G.dados.itens = G.dados.itens.filter(function (x) { return x.id !== id; }); rr(); } }); };
  window.__agCriar = function () {
    var t = document.getElementById('agT').value.trim(); if (!t) { G.erro = 'Escreva o que precisa ser feito.'; rr(); return; }
    G.salvando = true; rr();
    salva({ acao: 'novo', titulo: t, desc: document.getElementById('agD').value, hora: document.getElementById('agH').value, data: document.getElementById('agDt').value || G.data }).then(function (r) { G.salvando = false; if (r) { G.novo = false; carregar(true); } rr(); });
  };

  function item(x) {
    var k = x.id || x.chave, st = ST[x.status] || ST.pendente, o = OR[x.origem] || OR.proprio, kk = String(k).replace(/[^a-z0-9]/gi, '');
    var meta = [o[0]];
    if (x.origem === 'recado' && x.autor) meta.push('de ' + esc(x.autor));
    if (x.atrasado) meta.push('<span class="at">atrasado desde ' + br(x.data) + '</span>');
    if (x.status === 'concluida' && x.autor && x.origem === 'rotina') meta.push('feito por ' + esc(x.autor));
    var h = '<div class="it"><div class="hr">' + esc(x.hora || '—') + '</div><div class="br" style="background:' + (x.atrasado ? '#fb7185' : o[1]) + '"></div><div><div class="tt">' + esc(x.titulo) + '</div>' + (x.desc ? '<div class="ds">' + esc(x.desc) + '</div>' : '') +
      '<div class="mt">' + meta.join(' · ') + ' · <a href="#" onclick="__agAbre(\'' + k + '\');return false" style="color:#9fc1ff">' + (x.nota ? 'ver/editar anotação' : 'anotar') + '</a>' + ((x.origem !== 'rotina' && (G.dados.gerencia || x.autor === G.dados.eu)) ? ' · <a href="#" onclick="__agExcluir(\'' + x.id + '\');return false" style="color:#fda4af">excluir</a>' : '') + '</div>' +
      (x.nota && !G.aberto[k] ? '<div class="nt">📝 ' + esc(x.nota) + '</div>' : '') +
      (G.aberto[k] ? '<div class="acoes"><input id="agN_' + kk + '" placeholder="Anotação (ex.: feito com 8 vendedores; falta o Israel)" value="' + esc(x.nota) + '"><button onclick="__agNota(\'' + k + '\')">Salvar</button></div>' : '') +
      '</div><button class="chip" title="Toque para mudar a situação" onclick="__agStatus(\'' + k + '\')" style="color:' + st[1] + ';background:' + st[2] + '">' + st[0] + '</button></div>';
    return h;
  }

  window.vAgenda = function () {
    relogio();
    if (!G.dados && !G.carregando && !G.erro) carregar();
    var h = CSS + '<div class="ag"><div class="cx">';
    if (!G.dados) return h + (G.erro ? '<div class="er">' + esc(G.erro) + '</div>' : '<div class="vz">Abrindo a agenda…</div>') + '</div></div>';
    var D = G.dados, d = dt(D.data), its = D.itens || [];
    var feitos = its.filter(function (x) { return x.status === 'concluida'; }).length, and = its.filter(function (x) { return x.status === 'andamento'; }).length, atr = its.filter(function (x) { return x.atrasado; }).length;
    h += '<div class="top"><div><h2>' + saud() + ', ' + esc(D.eu || '') + '! 👋</h2><div class="sub">' + DIAS[d.getUTCDay()] + ' · ' + d.getUTCDate() + ' de ' + MESES[d.getUTCMonth()] + ' de ' + d.getUTCFullYear() + (D.data !== D.hoje ? ' · <a href="#" onclick="__agDia(\'' + D.hoje + '\');return false" style="color:#9fc1ff">voltar para hoje</a>' : '') + '</div></div>' +
      (D.unis.length > 1 ? '<div class="unis">' + D.unis.map(function (u) { return '<button class="' + (u[0] === D.uni ? 'on' : '') + '" onclick="__agUni(\'' + u[0] + '\')">' + esc(u[1]) + '</button>'; }).join('') + '</div>' : '<div class="sub">' + esc((D.unis[0] || [])[1] || '') + '</div>') + '</div>';
    var K = [['todos', its.length, 'Atividades', '#60a5fa', 'rgba(96,165,250,.12)'], ['concluida', feitos, 'Concluídas', '#34d399', 'rgba(52,211,153,.12)'], ['pendente', its.length - feitos - and, 'Pendentes', '#f59e0b', 'rgba(245,158,11,.12)'], ['atrasado', atr, 'Atrasadas', atr ? '#fb7185' : '#64748b', atr ? 'rgba(251,113,133,.14)' : 'rgba(100,116,139,.12)']];
    h += '<div class="ks">' + K.map(function (k) { return '<div class="k' + (G.filtro === k[0] && k[0] !== 'todos' ? ' on' : '') + '" style="background:' + k[4] + '" onclick="__agFiltro(\'' + k[0] + '\')"><b style="color:' + k[3] + '">' + ('0' + k[1]).slice(-2) + '</b><span>' + k[2] + '</span></div>'; }).join('') + '</div>';
    h += '<div class="sem"><button class="nav" onclick="__agSem(-1)" aria-label="Semana anterior">‹</button>' + (D.semana || []).map(function (s) { var x = dt(s.data), dots = ''; for (var i = 0; i < Math.min(s.total, 6); i++) dots += '<i class="' + (i < s.feitos ? 'f' : '') + '"></i>'; return '<button class="' + (s.data === D.data ? 'on ' : '') + (s.data === D.hoje ? 'hj ' : '') + (s.util ? '' : 'nu') + '" onclick="__agDia(\'' + s.data + '\')">' + DC[x.getUTCDay()] + '<b>' + x.getUTCDate() + '</b><div class="dots">' + dots + '</div></button>'; }).join('') + '<button class="nav" onclick="__agSem(1)" aria-label="Próxima semana">›</button></div>';
    if (G.erro) h += '<div class="er">' + esc(G.erro) + '</div>';
    h += '<h3><span>' + (D.data === D.hoje ? 'Minha agenda de hoje' : 'Agenda de ' + br(D.data)) + '</span><button onclick="__agNovo()">' + (G.novo ? 'Fechar' : (D.gerencia ? '+ Enviar recado' : '+ Novo afazer')) + '</button></h3>';
    if (G.novo) h += '<div class="fm"><input id="agDt" type="date" value="' + D.data + '"><input id="agH" type="time" placeholder="Hora"><input id="agT" class="w" placeholder="' + (D.gerencia ? 'Recado para a supervisão de ' + esc(((D.unis.filter(function (u) { return u[0] === D.uni; })[0]) || [])[1] || '') : 'O que precisa ser feito') + '"><textarea id="agD" placeholder="Detalhes (opcional)"></textarea><div class="bt"><button onclick="__agCriar()" style="background:#f26b1d;color:#fff"' + (G.salvando ? ' disabled' : '') + '>' + (G.salvando ? 'Salvando…' : 'Salvar') + '</button><button onclick="__agNovo()" style="background:#13254a;color:#dbe7ff">Cancelar</button></div></div>';
    var lista = its.filter(function (x) { return G.filtro === 'todos' ? true : G.filtro === 'atrasado' ? x.atrasado : G.filtro === 'pendente' ? x.status !== 'concluida' : x.status === G.filtro; });
    h += lista.length ? lista.map(item).join('') : '<div class="vz">' + (its.length ? 'Nada neste filtro.' : 'Dia livre: nenhuma rotina ou recado.') + '</div>';
    h += '<div class="leg"><span><i style="background:#60a5fa"></i>Rotina da metodologia</span><span><i style="background:#f26b1d"></i>Recado da gerência</span><span><i style="background:#34d399"></i>Meu afazer</span><span><i style="background:#fb7185"></i>Atrasado</span><span>Toque na situação para avançar: Pendente → Em andamento → Concluída</span></div>';
    return h + '</div></div>';
  };
})();
