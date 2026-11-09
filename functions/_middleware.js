// Protege todo o /portal no servidor. O site institucional continua público.
import { usuarioDaSessao, PRIVILEGIADOS } from "./_lib/auth.js";

const PUBLICOS = new Set(["/portal/login.html", "/portal/primeiro-acesso.html", "/portal/app/manifest.json"]);
const SO_PRIVILEGIADOS = new Set(["/portal/diretoria.html", "/portal/financeiro.html", "/portal/duplas.html"]);
const POR_DUPLA = new Set(["/portal/painel.html", "/portal/performance.html"]);
const OCULTOS = /^\/(functions\/|schema\.sql$|wrangler\.toml$|\.git)/;

function normalizar(p) {
  // Pages serve "/portal/x" e "/portal/x.html" igual; trata os dois.
  if (p === "/portal" || p === "/portal/") return "/portal/app.html";
  if (p.startsWith("/portal/") && !/\.[a-z0-9]+$/i.test(p)) return p + ".html";
  return p;
}

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  const p = normalizar(decodeURIComponent(url.pathname));

  if (OCULTOS.test(p)) return new Response("Não encontrado", { status: 404 });
  if (!p.startsWith("/portal/") || PUBLICOS.has(p) || p.startsWith("/portal/app/icone") || p === "/portal/app/apple-touch-icon.png") {
    return next();
  }

  const u = await usuarioDaSessao(request, env);
  if (!u) {
    if (!p.endsWith(".html")) return new Response("Não autorizado", { status: 401 });
    const volta = encodeURIComponent(url.pathname + url.search);
    return Response.redirect(`${url.origin}/portal/login.html?volta=${volta}`, 302);
  }

  const priv = PRIVILEGIADOS.includes(u.perfil);
  let ok = true;
  if (p === "/portal/admin.html") ok = u.perfil === "admin";
  else if (SO_PRIVILEGIADOS.has(p)) ok = priv;
  else if (POR_DUPLA.has(p)) ok = priv || (u.perfil === "vendedor" && url.searchParams.get("d") === u.dupla);

  if (!ok) {
    if (POR_DUPLA.has(p) && u.perfil === "vendedor" && u.dupla) {
      return Response.redirect(`${url.origin}${url.pathname}?d=${encodeURIComponent(u.dupla)}`, 302);
    }
    return new Response("Acesso negado para o seu perfil.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const resp = await next();
  const r = new Response(resp.body, resp);
  r.headers.set("cache-control", "private, no-store");
  r.headers.set("x-robots-tag", "noindex");
  return r;
}
