/* Aba "Leads" (prospecção Contactei) — páginas das duplas/vendedores, da supervisão e da diretoria.
   Marabá: a Contactei qualifica e já escolhe a dupla.
   Belém: a Contactei qualifica; a Supervisão Belém (Alessandra) escolhe o vendedor/dupla.
          Se o cliente comprou depois do início do trabalho, o lead vai sozinho para o vendedor que vendeu.
   Sem senhas aqui: o acesso é validado no servidor (backend/prospeccao.web.js). */
(function(){
const LD_PUBM="https://docs.google.com/spreadsheets/d/e/2PACX-1vSWkUwIA-PcekRj-_pjqx5QaorNtpov6LEijjKBumZacl1zn4qzelC9Ck3ikI0s0d-6WnAC9VKuwIIB/pub?single=true&output=csv&gid=";
const LD_PUBB="https://docs.google.com/spreadsheets/d/e/2PACX-1vS7Cz40wQ3c1egLW4eIM7PtA1IDEo0mGxM_Zee3b-Og1fIkx-HZZut8kuhuVHZ9ZHMafJ1eZB80Feh-/pub?single=true&output=csv&gid=";
const CFG={
  maraba:{nome:"Marabá",leads:LD_PUBM+"191255704",modo:"contactei",inicio:6,mesIni:"jun",
    abas:[LD_PUBM+"301912048",LD_PUBM+"428476033",LD_PUBM+"597943590",
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOHMlqaOkAL4MWtLtYNbTMF3zv9hQWEhanys7dSxnXWJV2d3WuejDnPG5LYdqRLgiodaGF6TncUo8n/pub?single=true&output=csv&gid=1765537608" /* cópia preenchida por Martinho e Rafael */,
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSyPxMYQ79oc9eFsGyRnOSSj_L01bTsKigqdmTdQZk5ktedLg4ebCr6dNrhen-KnqWA0hL02Ug4ZAQ/pub?output=csv" /* preenchida por Israel e Stefanny */,
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBrcxvYmbR_eV_8JQlBQhb76SMI3tcJUrqkROLLz2nP1FXEcqtHb6rGhvqVvnUyncedRY1iyZbE5pi/pub?output=csv" /* preenchida por Rebeca e Jadson */],
    email:{"rafaelmartinho":"Rafael / Martinho","israelstefanny":"Israel / Stefanny","jadsonrebeca":"Jadson / Rebeca"},
    destinos:["Israel / Stefanny","Jadson / Rebeca","Rafael / Martinho","Jessica","Matheus"]},
  belem:{nome:"Belém",leads:LD_PUBB+"191255704",modo:"supervisor",inicio:9,mesIni:"set",abas:[],email:{},
    destinos:["Alcir","Francitonio","Raphael","Cibelle","Renato","Jennifer","Alvaro","Fabio / Marcelle","Alessandra / Jessica"]}
};
const LD_COR={"Em contato":"#1f57a3","Em cotação":"#b07600","Vendido":"#13703c","Sem interesse":"#b3261e","Não atende":"#66758a","Novo":"#7a47aa"};
let LD={st:"",uni:"",leads:null,acoes:null,dupla:null,todos:false,sup:false,status:[],filtro:"",fdupla:"",erro:"",soRet:true};
let LD_SEQ=0;const LD_PEND={};
addEventListener("message",e=>{const d=e.data||{};if((d.tipo=="pldr"||d.tipo=="fxr")&&d.id&&LD_PEND[d.id]){LD_PEND[d.id](d);delete LD_PEND[d.id]}});
function ldPede(m,to){return new Promise(res=>{const id="ld"+(++LD_SEQ)+"_"+Date.now();LD_PEND[id]=res;parent.postMessage({...m,id},"*");setTimeout(()=>{if(LD_PEND[id]){delete LD_PEND[id];res({ok:false,r:{ok:false,erro:"O site não respondeu. Tente de novo."}})}},to||60000)})}
const ldCsv=t=>{const L=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==","){r.push(c);c=""}else if(ch=="\n"){r.push(c);L.push(r);r=[];c=""}else if(ch!="\r")c+=ch}r.push(c);L.push(r);return L};
const ldDig=s=>String(s||"").replace(/\D/g,"");const ldZ=s=>ldDig(s).replace(/^0+/,"");
const ldNn=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().replace(/\b(LTDA|ME|EPP|EIRELI|S\/?A|SA)\b/g,"").replace(/[^A-Z0-9]/g,"");
const ldW=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().trim().split(/[\s\/&]+/)[0];
const ldEsc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ldTit=s=>String(s||"").toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const ldData=iso=>{const d=new Date(iso);return isNaN(d)?"–":d.toLocaleDateString("pt-BR")};
const ldF1=v=>(+v||0).toLocaleString("pt-BR",{maximumFractionDigits:1});
const C=()=>CFG[LD.uni]||CFG.maraba;
function ldDestEmail(e){const k=String(e||"").toLowerCase().split("@")[0].replace(/le+ads$/,"");return C().email[k]||""}
function ldDest(v){const s=ldNn(v);if(!s)return"";const ds=C().destinos;return ds.find(x=>ldNn(x)==s)||ds.find(x=>x.includes("/")&&x.split("/").every(p=>s.includes(ldNn(p).slice(0,5))))||""}
/* nome do vendedor da nota -> vendedor/dupla da lista (pelo primeiro nome) */
function ldVendDest(nome){const w=ldW(nome);if(!w)return"";return C().destinos.find(d=>d.split("/").some(p=>ldW(p)==w))||""}
function ldWa(t){const d=ldDig(t);if(d.length<10)return ldEsc(t||"–");return `<a href="https://wa.me/${d.length<=11?"55"+d:d}" target="_blank" style="color:#128c4b;font-weight:700;text-decoration:none">${ldEsc(t)} ↗</a>`}
const uniAtual=()=>{try{return typeof UNI!="undefined"&&CFG[UNI]?UNI:""}catch(_){return""}};

async function ldCarrega(){
  LD.st="carregando";LD.erro="";
  const rb=await ldPede({tipo:"pld",op:"listar",uni:uniAtual()||"maraba"});const r=rb.r||{};
  if(!r.ok){LD.st="erro";LD.erro=r.erro||"Não consegui ler os leads.";ldRedesenha();return}
  LD.uni=CFG[r.unidade]?r.unidade:"maraba";LD.dupla=r.dupla;LD.todos=!!r.todos;LD.sup=!!r.sup;LD.status=r.status||[];LD.acoes=r.itens||[];
  const [fx,...abas]=await Promise.all([ldPede({tipo:"fx",url:C().leads+"&t="+Date.now()},90000)].concat(C().abas.map(u=>ldPede({tipo:"fx",url:u+"&t="+Date.now()},90000))));
  LD.plan={};abas.forEach(a=>{ldCsv(a.text||"").forEach(x=>{const c=ldDig(x[1]);if(c.length>=11&&(x[5]||x[6]))LD.plan["c"+c]={status:(x[5]||"").trim(),obs:(x[6]||"").trim()}})});
  const L=ldCsv(fx.text||"");const h=L.findIndex(x=>x[1]&&/raz/i.test(x[1]));const out=[];
  L.slice(h+1).forEach(x=>{if(!x[1]||!x[1].trim())return;const cnpj=ldDig(x[6]),sap=ldZ(x[17]);
    out.push({chave:cnpj?("c"+cnpj):sap?("s"+sap):("n"+ldNn(x[1]).slice(0,40)),razao:x[1].trim(),etapaPl:(x[2]||"").trim(),cnpj,sap,cid:ldTit(x[7]),rota:ldTit((x[9]||"").replace(/^rota\s+/i,"")),
      email:x[18],vend:x[10],comprador:x[12],tel1:x[13],tel2:x[14],relatoPl:x[16]})});
  LD.leads=out;LD.st="ok";ldAplica();ldRedesenha();
}
function ldVendas(l){ /* notas do painel (D) para este cliente desde o início do trabalho */
  try{if(typeof D=="undefined"||!D.length)return[];const k=ldNn(l.razao);const ini=C().inicio;
    return D.filter(n=>n.m>=ini&&((l.sap&&ldZ(n.cli)==l.sap)||ldNn(n.nome)==k))}catch(_){return[]}}
function ldAplica(){
  const hc={},hd={},ha={};LD.acoes.forEach(a=>{const o=a.tipo=="dupla"?hd:a.tipo=="atrib"?ha:hc;(o[a.chave]=o[a.chave]||[]).push(a)});
  const sup=C().modo=="supervisor";
  LD.leads.forEach(l=>{const c=hc[l.chave]||[],d=hd[l.chave]||[],at=ha[l.chave]||[];const ult=c[c.length-1];
    l.etapa=ult&&ult.etapa?ult.etapa:l.etapaPl;let qd=null;for(let i=c.length-1;i>=0;i--){if(c[i].etapa=="Qualificado"){qd=c[i].data;break}}
    const nv=ldVendas(l);l.comprou=nv.reduce((s,n)=>s+n.t,0);
    const pv={};nv.forEach(n=>{const k=ldVendDest(n.dupla)||ldVendDest(n.vend);if(k)pv[k]=(pv[k]||0)+n.t});l.vendeu=Object.entries(pv).sort((a,b)=>b[1]-a[1]).map(x=>x[0])[0]||"";
    l.auto=false;l.manual=at.length?at[at.length-1].destino:"";
    if(sup){l.destino=l.manual||l.vendeu||"";l.auto=!l.manual&&!!l.vendeu}
    else{l.destino=ldDestEmail(l.email)||ldDest(l.vend);for(let i=c.length-1;i>=0;i--){if(c[i].destino){l.destino=c[i].destino;break}}if(l.manual)l.destino=l.manual}
    l.qualEm=qd;l.relatoC=(ult&&ult.relato)||l.relatoPl||"";l.comprador=(ult&&ult.comprador)||l.comprador;l.tel=(ult&&ult.telefone)||l.tel1;
    const ud=d[d.length-1];const pl=(LD.plan||{})[l.chave];l.status=ud?ud.statusDupla||"":(pl&&LD.status.includes(pl.status)?pl.status:"");l.obs=ud?ud.obs:(pl?pl.obs:"");l.atualizado=ud?ud.data:null;});
}
const qual=()=>(LD.leads||[]).filter(l=>l.etapa=="Qualificado"||(C().modo=="supervisor"&&l.auto&&l.etapa));
function ldMeus(){return qual().filter(l=>l.destino&&(LD.todos?(!LD.fdupla||l.destino==LD.fdupla):l.destino==LD.dupla))}
function ldPend(){return LD.todos&&C().modo=="supervisor"?qual().filter(l=>!l.destino):[]}
function ldRedesenha(){try{if(typeof ABA!="undefined"&&ABA=="leads")render()}catch(_){}}
function ldLista(){const M=ldMeus();return ldFiltra(LD.todos&&LD.soRet?M.filter(l=>l.status||(l.obs&&l.obs.trim())):M)}
function ldFiltra(M){const q=ldNn(LD.filtro);return M.filter(l=>!q||ldNn(l.razao).includes(q)||ldNn(l.cid).includes(q)).sort((a,b)=>(a.status?1:0)-(b.status?1:0)||String(b.qualEm||"").localeCompare(String(a.qualEm||"")))}
const selDest=(id,v)=>`<select id="${id}" style="padding:6px;border:1px solid #dde3ee;border-radius:8px"><option value="">Escolha…</option>${C().destinos.map(d=>`<option ${d==v?"selected":""}>${ldEsc(d)}</option>`).join("")}</select>`;
const btn=(t,f,cor)=>`<button onclick="${f}" style="background:${cor||"#f26b1d"};color:#fff;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;font-weight:700;white-space:nowrap">${t}</button>`;

window.vLeadsD=function(){
  if(!document.getElementById("ldCss"))document.head.insertAdjacentHTML("beforeend",'<style id="ldCss">.ldt{table-layout:fixed;width:100%;min-width:1100px;border-collapse:collapse}.ldt th,.ldt td{white-space:normal!important;overflow-wrap:anywhere;word-break:break-word;vertical-align:top;padding:9px 8px;text-align:left}.ldt td small{display:block;line-height:1.35}.ldt .rel{color:#4a5a70;font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.ldt select,.ldt textarea{max-width:100%;box-sizing:border-box}</style>');
  if(LD.st=="ok"&&LD.todos&&uniAtual()&&uniAtual()!=LD.uni)LD.st="";
  const quem=LD.todos?(C().modo=="supervisor"?"Leads de "+C().nome+" · definição de vendedor":"Leads qualificados por dupla · "+C().nome):"Leads qualificados para "+ldEsc(LD.dupla||"você");
  const cab=`<div class="tit"><div class="sup">Leads · prospecção Contactei</div><h1>${quem}</h1></div>`;
  if(!LD.st){ldCarrega();return cab+'<div class="carga"><div class="spin"></div>Lendo os leads…</div>'}
  if(LD.st=="carregando")return cab+'<div class="carga"><div class="spin"></div>Lendo os leads…</div>';
  if(LD.st=="erro")return cab+`<div class="box vazio">${ldEsc(LD.erro)} ${btn("Tentar de novo","LD_recarregar()","#0b2a55")}</div>`;
  const M=ldMeus(),P=ldPend();const cont=s=>M.filter(l=>(l.status||"Novo")==s).length;
  const k=(l,v,c,sub)=>`<div class="box" style="margin:0;border-left:4px solid ${c};padding:12px 14px"><div style="font-size:11px;font-weight:700;color:#66758a;text-transform:uppercase">${l}</div><div style="font-size:26px;font-weight:800;color:#0b2a55">${v}</div><div style="font-size:12px;color:#66758a">${sub||""}</div></div>`;
  const F=ldFiltra(LD.todos&&LD.soRet?M.filter(l=>l.status||(l.obs&&l.obs.trim())):M);const vend=M.filter(l=>l.comprou>0);const sup=C().modo=="supervisor";
  const porDupla=LD.todos?C().destinos.map(d=>[d,qual().filter(l=>l.destino==d)]).filter(x=>x[1].length):[];
  return cab+
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px">
   ${LD.todos&&sup?k("Aguardando definição",P.length,"#e2483d","qualificados sem vendedor"):""}
   ${k(LD.todos?"Direcionados":"Leads recebidos",M.length,"#0b4a9a",sup?f0auto(M):"qualificados pela Contactei")}${k("Novos",cont("Novo"),LD_COR.Novo,"ainda sem status")}
   ${k("Em contato",cont("Em contato"),LD_COR["Em contato"])}${k("Em cotação",cont("Em cotação"),LD_COR["Em cotação"])}
   ${k("Vendido",cont("Vendido"),LD_COR.Vendido,vend.length?`${vend.length} já com nota desde ${C().mesIni}`:"")}${k("Sem interesse",cont("Sem interesse"),LD_COR["Sem interesse"])}</div>
  ${LD.todos&&sup?`<div class="box" style="border:2px solid #f3c2bd"><h2>Aguardando definição do vendedor</h2><div class="sub">Leads que a Contactei qualificou. Escolha o vendedor ou a dupla e clique em Direcionar. Quem comprou desde ${C().mesIni} já vai sozinho para o vendedor que vendeu.</div>
   <div class="rol"><table class="ldt"><colgroup><col style="width:22%"><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:22%"><col style="width:14%"><col style="width:8%"></colgroup><thead><tr><th>Empresa</th><th>Cidade</th><th>Contato</th><th>Telefone</th><th>Relato da Contactei</th><th>Vendedor / dupla</th><th></th></tr></thead><tbody>
   ${P.map((l,i)=>`<tr><td><b>${ldEsc(l.razao)}</b><br><small style="color:#66758a">${ldEsc(l.cnpj||"")}${l.qualEm?" · qualificado em "+ldData(l.qualEm):""}</small></td><td>${ldEsc(l.cid)}</td><td>${ldEsc(l.comprador||"–")}</td><td>${ldWa(l.tel)}</td><td><div class="rel" title="${ldEsc(l.relatoC)}">${ldEsc(l.relatoC)||"–"}</div></td>
    <td>${selDest("ldP"+i,"")}</td><td>${btn("Direcionar","LD_atribuir('P',"+i+")")}</td></tr>`).join("")||'<tr><td colspan="7" class="vazio">Nenhum lead aguardando. Tudo direcionado ✔</td></tr>'}
   </tbody></table></div></div>`:""}
  ${LD.todos?`<div class="box"><h2>Por ${sup?"vendedor":"dupla"}</h2><div class="rol"><table><thead><tr><th>${sup?"Vendedor / dupla":"Dupla"}</th><th class="n">Recebidos</th><th class="n">Sem status</th><th class="n">Em cotação</th><th class="n">Vendido</th><th class="n">Sem interesse</th></tr></thead><tbody>${porDupla.map(([d,a])=>`<tr class="cl" onclick="LD_dupla('${ldEsc(d)}')"><td><b>${ldEsc(d)}</b></td><td class="n">${a.length}</td><td class="n">${a.filter(l=>!l.status).length}</td><td class="n">${a.filter(l=>l.status=="Em cotação").length}</td><td class="n">${a.filter(l=>l.status=="Vendido").length}</td><td class="n">${a.filter(l=>l.status=="Sem interesse").length}</td></tr>`).join("")||'<tr><td colspan="6" class="vazio">Nenhum lead direcionado ainda</td></tr>'}</tbody></table></div></div>`:""}
  <div class="box"><h2>${LD.todos?"Retornos dos vendedores":"Relação de leads"}</h2><div class="sub">${LD.todos?(LD.soRet?"Só os leads em que o vendedor já registrou status ou observação.":"Todos os leads direcionados"+(sup?". Para trocar o vendedor, escolha outro e clique em Direcionar.":".")):"Atualize o Status e escreva a Observação de cada cliente. Clique em Salvar na linha."}</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><input id="ldBusca" placeholder="Buscar empresa ou cidade" value="${ldEsc(LD.filtro)}" style="padding:8px 10px;border:1px solid #dde3ee;border-radius:8px;min-width:240px">
   ${LD.todos?`<select id="ldDupla" style="padding:8px 10px;border:1px solid #dde3ee;border-radius:8px"><option value="">Todos</option>${C().destinos.map(d=>`<option ${d==LD.fdupla?"selected":""}>${ldEsc(d)}</option>`).join("")}</select>`:""}
   ${LD.todos?`<select id="ldRet" style="padding:8px 10px;border:1px solid #dde3ee;border-radius:8px"><option value="1" ${LD.soRet?"selected":""}>Só com retorno do vendedor</option><option value="0" ${LD.soRet?"":"selected"}>Todos os direcionados</option></select>`:""}
   ${btn("Atualizar","LD_recarregar()","#0b2a55")}</div>
   <div class="rol"><table class="ldt"><colgroup><col style="width:19%"><col style="width:8%"><col style="width:10%"><col style="width:10%"><col style="width:17%">${LD.todos?'<col style="width:11%">':""}<col style="width:10%"><col style="width:${LD.todos?15:22}%"><col style="width:${LD.todos?0:6}%"></colgroup><thead><tr><th>Empresa</th><th>Cidade</th><th>Contato</th><th>Telefone</th><th>Relato da Contactei</th>${LD.todos?"<th>Vendedor / dupla</th>":""}<th>Status</th><th>Observação</th><th></th></tr></thead><tbody>
   ${F.map((l,i)=>`<tr><td><b>${ldEsc(l.razao)}</b><br><small style="color:#66758a">${ldEsc(l.cnpj||"")}${l.qualEm?" · qualificado em "+ldData(l.qualEm):""}</small>${l.comprou>0?`<br><span class="tag" style="background:#dcf5e5;color:#13703c">comprou ${ldF1(l.comprou)} t desde ${C().mesIni}${l.vendeu?" · "+ldEsc(l.vendeu):""}</span>`:""}${l.auto?`<br><span class="tag" style="background:#e3f4f7;color:#0f6b7a">direcionado automático (venda)</span>`:""}</td>
    <td>${ldEsc(l.cid)}</td><td>${ldEsc(l.comprador||"–")}</td><td>${ldWa(l.tel)}</td><td><div class="rel" title="${ldEsc(l.relatoC)}">${ldEsc(l.relatoC)||"–"}</div></td>
    ${LD.todos?`<td>${sup&&LD.sup?selDest("ldD"+i,l.destino)+"<div style='margin-top:4px'>"+btn("Direcionar","LD_atribuir('D',"+i+")","#0b4a9a")+"</div>":"<b>"+ldEsc(l.destino)+"</b>"}</td>`:""}
    <td>${LD.todos?`<b style="color:${LD_COR[l.status]||"#7a47aa"}">${ldEsc(l.status||"Novo")}</b>`:`<select id="ldS${i}" style="padding:6px;border:1px solid #dde3ee;border-radius:8px;font-weight:700;color:${LD_COR[l.status]||"#7a47aa"}"><option value="">Novo (sem status)</option>${LD.status.map(s=>`<option ${s==l.status?"selected":""}>${ldEsc(s)}</option>`).join("")}</select>`}</td>
    <td>${LD.todos?`<div class="rel" style="-webkit-line-clamp:4;color:#1d2a3a" title="${ldEsc(l.obs||"")}">${ldEsc(l.obs||"–")}</div>`:`<textarea id="ldO${i}" rows="2" style="width:100%;padding:6px;border:1px solid #dde3ee;border-radius:8px;font:inherit;font-size:12px" placeholder="Ex.: cotação enviada, aguardando retorno">${ldEsc(l.obs||"")}</textarea>`}${l.atualizado?`<br><small style="color:#66758a">atualizado em ${ldData(l.atualizado)}</small>`:""}</td>
    <td>${LD.todos?"":btn("Salvar","LD_salvar("+i+")")}</td></tr>`).join("")||`<tr><td colspan="9" class="vazio">${LD.todos&&LD.soRet?"Nenhum vendedor registrou retorno ainda. Assim que registrarem, aparece aqui.":"Nenhum lead "+(LD.todos?"direcionado nesta seleção":"para você")+" ainda."}</td></tr>`}
   </tbody></table></div></div>`;
};
function f0auto(M){const a=M.filter(l=>l.auto).length;return a?a+" automático(s) por venda":"com vendedor definido"}
window.LD_recarregar=()=>{LD.st="";ldRedesenha()};
window.LD_dupla=d=>{LD.fdupla=d;ldRedesenha()};
window.LD_salvar=async i=>{
  const l=ldFiltra(ldMeus())[i];if(!l)return;const s=document.getElementById("ldS"+i).value,o=document.getElementById("ldO"+i).value.trim();const b=event&&event.target;
  if(b){b.disabled=true;b.textContent="Salvando…"}
  const r=(await ldPede({tipo:"pld",op:"salvar",a:{chave:l.chave,razao:l.razao,status:s,obs:o,dupla:l.destino}})).r||{};
  if(!r.ok){if(b){b.disabled=false;b.textContent="Erro: tentar de novo";b.title=r.erro||""}return}
  LD.acoes.push({tipo:"dupla",chave:l.chave,statusDupla:s,obs:o,data:r.data||new Date().toISOString()});ldAplica();ldRedesenha();
};
window.LD_atribuir=async(qual_,i)=>{
  const l=(qual_=="P"?ldPend():ldLista())[i];if(!l)return;const v=document.getElementById("ld"+qual_+i).value;if(!v)return;const b=event&&event.target;
  if(b){b.disabled=true;b.textContent="Direcionando…"}
  const r=(await ldPede({tipo:"pld",op:"atribuir",a:{chave:l.chave,razao:l.razao,destino:v,unidade:LD.uni}})).r||{};
  if(!r.ok){if(b){b.disabled=false;b.textContent="Erro: tentar de novo";b.title=r.erro||""}return}
  LD.acoes.push({tipo:"atrib",chave:l.chave,destino:v,data:r.data||new Date().toISOString()});ldAplica();ldRedesenha();
};
document.addEventListener("input",e=>{if(e.target&&e.target.id=="ldBusca"){clearTimeout(window.__ldT);window.__ldT=setTimeout(()=>{LD.filtro=e.target.value;const p=e.target.selectionStart;ldRedesenha();const n=document.getElementById("ldBusca");if(n){n.focus();n.setSelectionRange(p,p)}},400)}});
document.addEventListener("change",e=>{if(e.target&&e.target.id=="ldDupla"){LD.fdupla=e.target.value;ldRedesenha()}if(e.target&&e.target.id=="ldRet"){LD.soRet=e.target.value=="1";ldRedesenha()}});
})();
