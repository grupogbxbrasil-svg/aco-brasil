// Menu móvel
const btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
btn.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  btn.setAttribute('aria-expanded', aberto);
});
menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('aberto'); btn.setAttribute('aria-expanded', false); } });

// Item ativo do menu conforme rolagem
const links = [...menu.querySelectorAll('a[href^="#"]')];
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) obs.observe(s); });

document.getElementById('ano').textContent = new Date().getFullYear();

// NOTÍCIAS — edite esta lista para publicar comunicados.
// Formato: {data:"2026-10-23", titulo:"...", resumo:"...", imagem:"assets/img/arquivo.jpg"}
const NOTICIAS = [];

const el = document.getElementById('listaNoticias');
const fmt = d => new Date(d + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
el.innerHTML = NOTICIAS.length
  ? NOTICIAS.sort((a, b) => b.data.localeCompare(a.data)).map(n => `<article class="noticia">${n.imagem ? `<img src="${esc(n.imagem)}" alt="" loading="lazy">` : ''}<div><time datetime="${esc(n.data)}">${fmt(n.data)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.resumo)}</p></div></article>`).join('')
  : '<p class="vazio">Em breve, comunicados e novidades da Aço Brasil.</p>';
