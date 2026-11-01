/* Aba "Leads" da página de cada dupla (Marabá).
   Mostra os leads que a Contactei qualificou e direcionou para a dupla; a dupla atualiza Status e Observação.
   Carregado pela página do vendedor no Wix (u6hb2) e injetado no painel. Sem senhas aqui: o acesso é validado no servidor. */
(function(){
const LD_LEADS="https://docs.google.com/spreadsheets/d/e/2PACX-1vSWkUwIA-PcekRj-_pjqx5QaorNtpov6LEijjKBumZacl1zn4qzelC9Ck3ikI0s0d-6WnAC9VKuwIIB/pub?single=true&output=csv&gid=191255704";
const LD_PUB="https://docs.google.com/spreadsheets/d/e/2PACX-1vSWkUwIA-PcekRj-_pjqx5QaorNtpov6LEijjKBumZacl1zn4qzelC9Ck3ikI0s0d-6WnAC9VKuwIIB/pub?single=true&output=csv&gid=";
/* abas que as duplas já preenchiam na planilha (Status e Observação) */
const LD_ABAS={"Rafael / Martinho":"301912048","Israel / Stefanny":"428476033","Jadson / Rebeca":"597943590"};
const LD_EMAIL={"rafaelmartinho":"Rafael / Martinho","israelstefanny":"Israel / Stefanny","jadsonrebeca":"Jadson / Rebeca"};
const LD_DUPLAS=["Israel / Stefanny","Jadson / Rebeca","Rafael / Martinho","Jessica","Matheus"];
const LD_COR={"Em contato":"#1f57a3","Em cotação":"#b07600","Vendido":"#13703c","Sem interesse":"#b3261e","Não atende":"#66758a","Novo":"#7a47aa"};
let LD={st:"", leads:null, acoes:null, dupla:null, todos:false, status:[], filtro:"", fdupla:"", erro:"", aberto:null};
let LD_SEQ=0;const LD_PEND={};
addEventListener("message",e=>{const d=e.data||{};if((d.tipo=="pldr"||d.tipo=="fxr")&&d.id&&LD_PEND[d.id]){LD_PEND[d.id](d);delete LD_PEND[d.id]}});
function ldPede(m,to){return new Promise(res=>{const id="ld"+(++LD_SEQ)+"_"+Date.now();LD_PEND[id]=res;parent.postMessage({...m,id},"*");setTimeout(()=>{if(LD_PEND[id]){delete LD_PEND[id];res({ok:false,r:{ok:false,erro:"O site não respondeu. Tente de novo."}})}},to||60000)})}
const ldCsv=t=>{const L=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==","){r.push(c);c=""}else if(ch=="\n"){r.push(c);L.push(r);r=[];c=""}else if(ch!="\r")c+=ch}r.push(c);L.push(r);return L};
const ldDig=s=>String(s||"").replace(/\D/g,"");
const ldNn=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toUpperCase().replace(/\b(LTDA|ME|EPP|EIRELI|S\/?A|SA)\b/g,"").replace(/[^A-Z0-9]/g,"");
const ldEsc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ldTit=s=>String(s||"").toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const ldData=iso=>{const d=new Date(iso);return isNaN(d)?"–":d.toLocaleDateString("pt-BR")};
function ldDestEmail(e){const k=String(e||"").toLowerCase().split("@")[0].replace(/le+ads$/,"");return LD_EMAIL[k]||""}
function ldDest(v){const s=ldNn(v);if(!s)return"";return LD_DUPLAS.find(x=>ldNn(x)==s)||LD_DUPLAS.find(x=>x.includes("/")&&x.split("/").every(p=>s.includes(ldNn(p).slice(0,5))))||""}
function ldWa(t){const d=ldDig(t);if(d.length<10)return ldEsc(t||"–");return `<a href="https://wa.me/${d.length<=11?"55"+d:d}" target="_blank" style="color:#128c4b;font-weight:700;text-decoration:none">${ldEsc(t)} ↗</a>`}

async function ldCarrega(){
  LD.st="carregando";LD.erro="";
  const [fx,rb,...abas]=await Promise.all([ldPede({tipo:"fx",url:LD_LEADS+"&t="+Date.now()},90000),ldPede({tipo:"pld",op:"listar"})].concat(Object.values(LD_ABAS).map(g=>ldPede({tipo:"fx",url:LD_PUB+g+"&t="+Date.now()},90000))));
  /* status e observação que já estavam na planilha de cada dupla (por CNPJ) */
  LD.plan={};abas.forEach(a=>{ldCsv(a.text||"").forEach(x=>{const c=ldDig(x[1]);if(c.length>=11&&(x[5]||x[6]))LD.plan["c"+c]={status:(x[5]||"").trim(),obs:(x[6]||"").trim()}})});
  const r=rb.r||{};
  if(!r.ok){LD.st="erro";LD.erro=r.erro||"Não consegui ler os leads.";ldRedesenha();return}
  LD.dupla=r.dupla;LD.todos=r.todos;LD.status=r.status||[];LD.acoes=r.itens||[];
  const L=ldCsv(fx.text||"");const h=L.findIndex(x=>x[1]&&/raz/i.test(x[1]));const out=[];
  L.slice(h+1).forEach(x=>{if(!x[1]||!x[1].trim())return;const cnpj=ldDig(x[6]),sap=ldDig(x[17]).replace(/^0+/,"");
    out.push({chave:cnpj?("c"+cnpj):sap?("s"+sap):("n"+ldNn(x[1]).slice(0,40)),razao:x[1].trim(),etapaPl:(x[2]||"").trim(),cnpj,cid:ldTit(x[7]),rota:ldTit((x[9]||"").replace(/^rota\s+/i,"")),
      email:x[18],vend:x[10],comprador:x[12],tel1:x[13],tel2:x[14],relatoPl:x[16],email:x[18]})});
  LD.leads=out;LD.st="ok";ldAplica();ldRedesenha();
}
function ldAplica(){
  const hc={},hd={};LD.acoes.forEach(a=>{(a.tipo=="dupla"?hd:hc)[a.chave]=((a.tipo=="dupla"?hd:hc)[a.chave]||[]).concat([a])});
  LD.leads.forEach(l=>{const c=hc[l.chave]||[],d=hd[l.chave]||[];const ult=c[c.length-1];
    l.etapa=ult&&ult.etapa?ult.etapa:l.etapaPl;l.destino=ldDestEmail(l.email)||ldDest(l.vend);let qd=null;
    for(let i=c.length-1;i>=0;i--){if(c[i].destino){l.destino=c[i].destino;break}}
    for(let i=c.length-1;i>=0;i--){if(c[i].etapa=="Qualificado"){qd=c[i].data;break}}
    l.qualEm=qd;l.relatoC=(ult&&ult.relato)||l.relatoPl||"";l.comprador=(ult&&ult.comprador)||l.comprador;l.tel=(ult&&ult.telefone)||l.tel1;
    l.histD=d;const ud=d[d.length-1];const pl=(LD.plan||{})[l.chave];l.status=ud?ud.statusDupla||"":(pl&&LD.status.includes(pl.status)?pl.status:"");l.obs=ud?ud.obs:(pl?pl.obs:"");l.atualizado=ud?ud.data:null;
    l.comprou=0;try{if(typeof D!="undefined"&&D.length){const k=ldNn(l.razao);l.comprou=D.filter(n=>n.m>=6&&ldNn(n.nome)==k).reduce((s,n)=>s+n.t,0)}}catch(_){}});
}
function ldMeus(){return (LD.leads||[]).filter(l=>l.etapa=="Qualificado"&&l.destino&&(LD.todos?(!LD.fdupla||l.destino==LD.fdupla):l.destino==LD.dupla))}
function ldRedesenha(){try{if(typeof ABA!="undefined"&&ABA=="leads")render()}catch(_){}}

window.vLeadsD=function(){
  const cab=`<div class="tit"><div class="sup">Leads · prospecção Contactei</div><h1>${LD.todos?"Leads qualificados por dupla":"Leads qualificados para "+ldEsc(LD.dupla||"a dupla")}</h1></div>`;
  if(!LD.st){ldCarrega();return cab+'<div class="carga"><div class="spin"></div>Lendo os leads…</div>'}
  if(LD.st=="carregando")return cab+'<div class="carga"><div class="spin"></div>Lendo os leads…</div>';
  if(LD.st=="erro")return cab+`<div class="box vazio">${ldEsc(LD.erro)} <button class="btn" onclick="LD_recarregar()">Tentar de novo</button></div>`;
  const M=ldMeus();const cont=s=>M.filter(l=>(l.status||"Novo")==s).length;
  const k=(l,v,c,sub)=>`<div class="box" style="margin:0;border-left:4px solid ${c};padding:12px 14px"><div style="font-size:11px;font-weight:700;color:#66758a;text-transform:uppercase">${l}</div><div style="font-size:26px;font-weight:800;color:#0b2a55">${v}</div><div style="font-size:12px;color:#66758a">${sub||""}</div></div>`;
  const q=ldNn(LD.filtro);const F=M.filter(l=>!q||ldNn(l.razao).includes(q)||ldNn(l.cid).includes(q)).sort((a,b)=>(a.status?1:0)-(b.status?1:0)||String(b.qualEm||"").localeCompare(String(a.qualEm||"")));
  const vend=M.filter(l=>l.comprou>0);
  const porDupla=LD.todos?LD_DUPLAS.map(d=>[d,(LD.leads||[]).filter(l=>l.etapa=="Qualificado"&&l.destino==d)]).filter(x=>x[1].length):[];
  return cab+
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px">
   ${k("Leads recebidos",M.length,"#0b4a9a","qualificados pela Contactei")}${k("Novos",cont("Novo"),LD_COR.Novo,"ainda sem status")}
   ${k("Em contato",cont("Em contato"),LD_COR["Em contato"])}${k("Em cotação",cont("Em cotação"),LD_COR["Em cotação"])}
   ${k("Vendido",cont("Vendido"),LD_COR.Vendido,vend.length?`${vend.length} já com nota desde jun`:"")}${k("Sem interesse",cont("Sem interesse"),LD_COR["Sem interesse"])}</div>
  ${LD.todos?`<div class="box"><h2>Por dupla</h2><div class="rol"><table><thead><tr><th>Dupla</th><th class="n">Recebidos</th><th class="n">Sem status</th><th class="n">Em cotação</th><th class="n">Vendido</th><th class="n">Sem interesse</th></tr></thead><tbody>${porDupla.map(([d,a])=>`<tr class="cl" onclick="LD_dupla('${ldEsc(d)}')"><td><b>${ldEsc(d)}</b></td><td class="n">${a.length}</td><td class="n">${a.filter(l=>!l.status).length}</td><td class="n">${a.filter(l=>l.status=="Em cotação").length}</td><td class="n">${a.filter(l=>l.status=="Vendido").length}</td><td class="n">${a.filter(l=>l.status=="Sem interesse").length}</td></tr>`).join("")}</tbody></table></div></div>`:""}
  <div class="box"><h2>Relação de leads</h2><div class="sub">Atualize o Status e escreva a Observação de cada cliente. Clique em Salvar na linha.</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><input id="ldBusca" placeholder="Buscar empresa ou cidade" value="${ldEsc(LD.filtro)}" style="padding:8px 10px;border:1px solid #dde3ee;border-radius:8px;min-width:240px">
   ${LD.todos?`<select id="ldDupla" style="padding:8px 10px;border:1px solid #dde3ee;border-radius:8px"><option value="">Todas as duplas</option>${LD_DUPLAS.map(d=>`<option ${d==LD.fdupla?"selected":""}>${ldEsc(d)}</option>`).join("")}</select>`:""}
   <button class="btn" onclick="LD_recarregar()" style="background:#0b2a55;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer">Atualizar</button></div>
   <div class="rol"><table><thead><tr><th>Empresa</th><th>Cidade</th><th>Contato</th><th>Telefone</th><th>Relato da Contactei</th>${LD.todos?"<th>Dupla</th>":""}<th style="min-width:150px">Status</th><th style="min-width:240px">Observação</th><th></th></tr></thead><tbody>
   ${F.map((l,i)=>`<tr><td><b>${ldEsc(l.razao)}</b><br><small style="color:#66758a">${ldEsc(l.cnpj||"")}${l.qualEm?" · qualificado em "+ldData(l.qualEm):""}</small>${l.comprou>0?`<br><span class="tag" style="background:#dcf5e5;color:#13703c">comprou ${l.comprou.toLocaleString("pt-BR",{maximumFractionDigits:1})} t desde jun</span>`:""}</td>
    <td>${ldEsc(l.cid)}</td><td>${ldEsc(l.comprador||"–")}</td><td>${ldWa(l.tel)}</td><td style="max-width:260px"><small>${ldEsc(l.relatoC)}</small></td>${LD.todos?`<td>${ldEsc(l.destino)}</td>`:""}
    <td><select id="ldS${i}" style="padding:6px;border:1px solid #dde3ee;border-radius:8px;font-weight:700;color:${LD_COR[l.status]||"#7a47aa"}"><option value="">Novo (sem status)</option>${LD.status.map(s=>`<option ${s==l.status?"selected":""}>${ldEsc(s)}</option>`).join("")}</select></td>
    <td><textarea id="ldO${i}" rows="2" style="width:100%;padding:6px;border:1px solid #dde3ee;border-radius:8px;font:inherit;font-size:12px" placeholder="Ex.: cotação enviada, aguardando retorno">${ldEsc(l.obs||"")}</textarea>${l.atualizado?`<small style="color:#66758a">atualizado em ${ldData(l.atualizado)}</small>`:""}</td>
    <td><button onclick="LD_salvar(${i})" id="ldB${i}" style="background:#f26b1d;color:#fff;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;font-weight:700">Salvar</button></td></tr>`).join("")||`<tr><td colspan="9" class="vazio">Nenhum lead qualificado para ${LD.todos?"esta seleção":"a dupla"} ainda. Quando a Contactei qualificar um cliente e direcionar para vocês, ele aparece aqui.</td></tr>`}
   </tbody></table></div></div>`;
};
window.LD_recarregar=()=>{LD.st="";ldRedesenha()};
window.LD_dupla=d=>{LD.fdupla=d;ldRedesenha()};
window.LD_salvar=async i=>{
  const M=ldMeus();const q=ldNn(LD.filtro);const F=M.filter(l=>!q||ldNn(l.razao).includes(q)||ldNn(l.cid).includes(q)).sort((a,b)=>(a.status?1:0)-(b.status?1:0)||String(b.qualEm||"").localeCompare(String(a.qualEm||"")));
  const l=F[i];if(!l)return;const s=document.getElementById("ldS"+i).value,o=document.getElementById("ldO"+i).value.trim(),b=document.getElementById("ldB"+i);
  b.disabled=true;b.textContent="Salvando…";
  const r=(await ldPede({tipo:"pld",op:"salvar",a:{chave:l.chave,razao:l.razao,status:s,obs:o,dupla:l.destino}})).r||{};
  if(!r.ok){b.disabled=false;b.textContent="Erro: tentar de novo";b.title=r.erro||"";return}
  LD.acoes.push({tipo:"dupla",chave:l.chave,statusDupla:s,obs:o,data:r.data||new Date().toISOString()});ldAplica();ldRedesenha();
};
document.addEventListener("input",e=>{if(e.target&&e.target.id=="ldBusca"){clearTimeout(window.__ldT);window.__ldT=setTimeout(()=>{LD.filtro=e.target.value;const p=e.target.selectionStart;ldRedesenha();const n=document.getElementById("ldBusca");if(n){n.focus();n.setSelectionRange(p,p)}},400)}});
document.addEventListener("change",e=>{if(e.target&&e.target.id=="ldDupla"){LD.fdupla=e.target.value;ldRedesenha()}});
})();
