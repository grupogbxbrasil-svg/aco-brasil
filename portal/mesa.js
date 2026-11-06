/* Aba "Mesa do Maurício" do Painel da Diretoria (carregada pela página KPIs do Wix).
   O Maurício escreve do jeito dele; o Claude lê, responde aqui e avisa o Gilvan.
   As conversas ficam no servidor do Wix (backend/mesa.web.js) e chegam pela mensagem 'mesa'. Aqui só fica a tela. */
(function () {
  var M = { dados: null, carregando: false, erro: '', tipo: 'ideia', enviando: false, aviso: '', rascunho: '', resp: {}, abertos: {}, filtro: 'abertas' };
  var PEND = {}, N = 0, timer = null;
  addEventListener('message', function (e) { var d = e.data || {}; if (d.tipo === 'mesar' && d.id && PEND[d.id]) { PEND[d.id](d.r || {}); delete PEND[d.id]; } });
  function pede(m) { return new Promise(function (res) { var id = 'ms' + (++N); PEND[id] = res; m.tipo = 'mesa'; m.id = id; parent.postMessage(m, '*'); setTimeout(function () { if (PEND[id]) { delete PEND[id]; res({ ok: false, erro: 'O servidor não respondeu. Tente de novo.' }); } }, 30000); }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function quando(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  function texto(t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  var TIPOS = [['ideia', '💡', 'Ideia'], ['ensinamento', '📚', 'Ensinamento'], ['tarefa', '✅', 'Tarefa para fazer'], ['pergunta', '❓', 'Pergunta']];
  var TNOME = {}; TIPOS.forEach(function (t) { TNOME[t[0]] = t[1] + ' ' + t[2]; });
  var ST = { aguardando: ['Aguardando resposta', '#7a4b06', '#fff4dc'], respondido: ['Respondido', '#14532d', '#e6f4ec'], concluido: ['Concluído', '#475569', '#eef1f5'] };

  var CSS = '<style>' +
    '.ms{font-size:17px;max-width:980px}.ms .hd{background:#0b2a55;color:#fff;border-radius:16px;padding:22px 24px}.ms .hd b{font-size:26px;display:block}.ms .hd p{margin:8px 0 0;opacity:.88;line-height:1.5;font-size:16px}' +
    '.ms .nova{background:#fff;border:1px solid #e3e8ef;border-radius:16px;padding:20px;margin-top:16px}' +
    '.ms .tp{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}@media(max-width:700px){.ms .tp{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.ms .tp button{border:2px solid #cbd5e1;background:#fff;border-radius:14px;padding:14px 8px;font-size:16px;font-weight:700;color:#0b2a55;cursor:pointer;line-height:1.3}.ms .tp button span{display:block;font-size:26px}.ms .tp button.on{border-color:#f26b1d;background:#fff4ec}' +
    '.ms textarea{width:100%;box-sizing:border-box;min-height:170px;border:2px solid #cbd5e1;border-radius:14px;padding:14px;font-size:18px;line-height:1.5;font-family:inherit;resize:vertical}.ms textarea:focus{outline:none;border-color:#0b2a55}' +
    '.ms .dica{color:#5b6b7d;font-size:14.5px;margin:8px 0 12px}' +
    '.ms .env{width:100%;background:#f26b1d;color:#fff;border:0;border-radius:14px;padding:16px;font-size:19px;font-weight:800;cursor:pointer}.ms .env[disabled]{opacity:.6;cursor:wait}' +
    '.ms .ok{background:#e6f4ec;color:#14532d;border-radius:12px;padding:12px 14px;margin-top:12px;font-size:16px}.ms .er{background:#fdecea;color:#8a1c12;border-radius:12px;padding:12px 14px;margin-top:12px;font-size:16px}' +
    '.ms h3{font-size:21px;color:#0b2a55;margin:28px 0 10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}' +
    '.ms .fl button{border:1px solid #cbd5e1;background:#fff;border-radius:99px;padding:7px 14px;font-size:14px;cursor:pointer;margin-left:6px}.ms .fl button.on{background:#0b2a55;color:#fff;border-color:#0b2a55}' +
    '.ms .cv{background:#fff;border:1px solid #e3e8ef;border-radius:16px;padding:16px 18px;margin-bottom:12px}' +
    '.ms .cvh{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;cursor:pointer}.ms .cvt{font-weight:800;color:#0b2a55;font-size:17px}.ms .cvs{font-size:13.5px;color:#64748b;margin-top:2px}' +
    '.ms .chip{border-radius:99px;padding:4px 12px;font-size:13px;font-weight:700;white-space:nowrap}' +
    '.ms .bal{border-radius:14px;padding:12px 14px;margin-top:10px;line-height:1.55;font-size:16.5px}.ms .bal small{display:block;font-size:12.5px;font-weight:700;margin-bottom:4px;opacity:.75}' +
    '.ms .eu{background:#f1f5fb;border:1px solid #dbe4f0}.ms .cl{background:#fff8f2;border:1px solid #fbd9c2}' +
    '.ms .rp textarea{min-height:90px;font-size:16.5px;margin-top:12px}.ms .rpb{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}.ms .rpb button{border:0;border-radius:12px;padding:11px 16px;font-size:15.5px;font-weight:700;cursor:pointer}.ms .b1{background:#0b2a55;color:#fff}.ms .b2{background:#eef1f5;color:#0b2a55}' +
    '.ms .vz{color:#64748b;padding:18px 0}' +
    '</style>';

  function rerender() { try { if (ABA === 'mesa') { var a = document.activeElement, id = a && a.id, pos = a && a.selectionStart; render(); if (id) { var b = document.getElementById(id); if (b) { b.focus(); try { b.setSelectionRange(pos, pos); } catch (e) { } } } } } catch (e) { } }
  function carregar(silencioso) {
    if (M.carregando) return; M.carregando = true;
    pede({ op: 'listar' }).then(function (r) {
      M.carregando = false;
      if (!r || !r.ok) { if (!silencioso) M.erro = (r && r.erro) || 'Não consegui abrir a Mesa.'; } else { M.erro = ''; M.dados = r; }
      // não redesenha enquanto a pessoa está escrevendo
      var ae = document.activeElement; if (silencioso && ae && ae.tagName === 'TEXTAREA') return;
      rerender();
    });
  }
  function relogio() { if (timer) return; timer = setInterval(function () { try { if (ABA === 'mesa') carregar(true); } catch (e) { } }, 60000); }

  window.__msTipo = function (t) { M.rascunho = (document.getElementById('msTxt') || {}).value || M.rascunho; M.tipo = t; rerender(); };
  window.__msDig = function (el) { M.rascunho = el.value; };
  window.__msEnviar = function () {
    var el = document.getElementById('msTxt'); var t = (el && el.value || '').trim();
    if (!t) { M.aviso = ''; M.erro = 'Escreva a mensagem antes de enviar.'; rerender(); return; }
    M.enviando = true; M.erro = ''; M.aviso = ''; M.rascunho = t; rerender();
    pede({ op: 'enviar', dados: { tipo: M.tipo, texto: t } }).then(function (r) {
      M.enviando = false;
      if (!r || !r.ok) { M.erro = (r && r.erro) || 'Não consegui enviar. Seu texto continua aí; tente de novo.'; }
      else { M.rascunho = ''; M.aviso = 'Recebido! O Claude responde aqui em até 1 hora (de segunda a sábado, das 7h às 20h) e avisa o Gilvan.'; if (M.dados) M.dados.conversas.unshift(r.conversa); M.abertos[r.conversa.id] = true; }
      rerender();
    });
  };
  function estaAberto(c) { return M.abertos[c.id] !== undefined ? M.abertos[c.id] : (c.status !== 'concluido' && c.mensagens.length <= 4); }
  window.__msAbre = function (id) { var c = ((M.dados && M.dados.conversas) || []).filter(function (x) { return x.id === id; })[0]; M.abertos[id] = c ? !estaAberto(c) : true; rerender(); };
  window.__msRespDig = function (id, el) { M.resp[id] = el.value; };
  window.__msResponder = function (id) {
    var t = String(M.resp[id] || '').trim(); if (!t) return;
    pede({ op: 'enviar', dados: { id: id, texto: t } }).then(function (r) {
      if (!r || !r.ok) { alert((r && r.erro) || 'Não consegui enviar.'); return; }
      M.resp[id] = ''; troca(r.conversa); rerender();
    });
  };
  window.__msStatus = function (id, st) { pede({ op: 'status', cid: id, status: st }).then(function (r) { if (r && r.ok) { troca(r.conversa); rerender(); } }); };
  window.__msFiltro = function (f) { M.filtro = f; rerender(); };
  function troca(c) { if (!M.dados || !c) return; M.dados.conversas = M.dados.conversas.map(function (x) { return x.id === c.id ? c : x; }); }

  function conversa(c) {
    var st = ST[c.status] || ST.aguardando, aberto = estaAberto(c);
    var ult = c.mensagens[c.mensagens.length - 1] || {};
    var h = '<div class="cv"><div class="cvh" onclick="__msAbre(\'' + c.id + '\')"><div><div class="cvt">' + esc(c.titulo || '') + '</div><div class="cvs">' + esc(TNOME[c.tipo] || '') + ' · ' + esc(c.autor || '') + ' · ' + quando(c.criadoEm) + ' · ' + c.mensagens.length + ' mensagem(ns)</div></div><span class="chip" style="color:' + st[1] + ';background:' + st[2] + '">' + st[0] + '</span></div>';
    if (!aberto) return h + '<div class="cvs" style="margin-top:8px">Última: ' + esc(ult.de || '') + ' · ' + quando(ult.em) + ' — toque para abrir</div></div>';
    h += c.mensagens.map(function (m) { var cl = m.de === 'Claude'; return '<div class="bal ' + (cl ? 'cl' : 'eu') + '"><small>' + esc(cl ? 'Claude' : m.de) + ' · ' + quando(m.em) + '</small>' + texto(m.texto) + '</div>'; }).join('');
    if (c.status === 'aguardando') h += '<div class="cvs" style="margin-top:10px">⏳ O Claude vai responder aqui.</div>';
    h += '<div class="rp"><textarea id="msR_' + c.id + '" placeholder="Continuar a conversa (complementar, corrigir, pedir mais detalhe)…" oninput="__msRespDig(\'' + c.id + '\',this)">' + esc(M.resp[c.id] || '') + '</textarea><div class="rpb"><button class="b1" onclick="__msResponder(\'' + c.id + '\')">Enviar resposta</button>' +
      (c.status !== 'concluido' ? '<button class="b2" onclick="__msStatus(\'' + c.id + '\',\'concluido\')">✔ Marcar como resolvido</button>' : '<button class="b2" onclick="__msStatus(\'' + c.id + '\',\'aguardando\')">Reabrir</button>') + '</div></div>';
    return h + '</div>';
  }

  window.vMesa = function () {
    relogio();
    if (!M.dados && !M.carregando && !M.erro) carregar(false);
    var eu = M.dados && M.dados.eu || '';
    var h = CSS + '<div class="ms"><div class="hd"><b>Mesa do Maurício</b><p>Escreva aqui do seu jeito: ideias, ensinamentos da sua experiência, tarefas que precisamos executar ou perguntas. O Claude lê, responde nesta mesma tela e avisa o Gilvan. Tudo fica guardado para a equipe aprender.</p></div>';
    h += '<div class="nova"><div class="tp">' + TIPOS.map(function (t) { return '<button class="' + (M.tipo === t[0] ? 'on' : '') + '" onclick="__msTipo(\'' + t[0] + '\')"><span>' + t[1] + '</span>' + t[2] + '</button>'; }).join('') + '</div>' +
      '<textarea id="msTxt" placeholder="' + (M.tipo === 'ensinamento' ? 'Ex.: Como eu negociava com cliente grande na ArcelorMittal…' : M.tipo === 'tarefa' ? 'Ex.: Precisamos levantar os clientes que pararam de comprar tubos…' : M.tipo === 'pergunta' ? 'Ex.: Quanto faturamos de Indústria em outubro em Belém?' : 'Ex.: E se a gente fizesse uma visita conjunta com a usina…') + '" oninput="__msDig(this)">' + esc(M.rascunho) + '</textarea>' +
      '<div class="dica">Dica: no celular, toque no 🎤 microfone do teclado e fale — o texto aparece sozinho.</div>' +
      '<button class="env" onclick="__msEnviar()"' + (M.enviando ? ' disabled' : '') + '>' + (M.enviando ? 'Enviando…' : 'Enviar para o Claude') + '</button>' +
      (M.aviso ? '<div class="ok">' + esc(M.aviso) + '</div>' : '') + (M.erro ? '<div class="er">' + esc(M.erro) + '</div>' : '') + '</div>';
    if (!M.dados) return h + '<div class="vz">' + (M.carregando ? 'Abrindo a Mesa…' : '') + '</div></div>';
    var cs = M.dados.conversas || [];
    var ab = cs.filter(function (c) { return c.status !== 'concluido'; }), co = cs.filter(function (c) { return c.status === 'concluido'; });
    var lista = M.filtro === 'abertas' ? ab : co;
    h += '<h3>Conversas<span class="fl"><button class="' + (M.filtro === 'abertas' ? 'on' : '') + '" onclick="__msFiltro(\'abertas\')">Em aberto (' + ab.length + ')</button><button class="' + (M.filtro === 'concluidas' ? 'on' : '') + '" onclick="__msFiltro(\'concluidas\')">Resolvidas (' + co.length + ')</button></span></h3>';
    h += lista.length ? lista.map(conversa).join('') : '<div class="vz">' + (M.filtro === 'abertas' ? 'Nenhuma conversa em aberto. Escreva a primeira aí em cima' + (eu ? ', ' + esc(eu) : '') + '.' : 'Nada resolvido ainda.') + '</div>';
    return h + '</div>';
  };
})();
