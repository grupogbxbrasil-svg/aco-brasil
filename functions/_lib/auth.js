// Utilitários de autenticação do portal (Cloudflare Pages Functions + D1).
const enc = new TextEncoder();
const ITER = 100000;               // limite máximo do PBKDF2 nos Workers
export const COOKIE = "ab_sessao";
const SESSAO_MS = 12 * 3600 * 1000;
export const PERFIS = ["admin", "diretoria", "supervisao", "logistica", "vendedor"];

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
export const aleatorio = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
export async function sha256(t) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(t))); }

export async function hashSenha(senha, salt = aleatorio(16)) {
  const chave = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: ITER }, chave, 256);
  return { hash: hex(bits), salt };
}

export function igual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function senhaValida(s) {
  return typeof s === "string" && s.length >= 8 && s.length <= 200;
}

export const json = (dados, status = 200, extra = {}) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

function lerCookie(req, nome) {
  const c = req.headers.get("cookie") || "";
  for (const p of c.split(";")) {
    const [k, ...v] = p.trim().split("=");
    if (k === nome) return v.join("=");
  }
  return null;
}

export async function criarSessao(env, usuario) {
  const token = aleatorio(32);
  const expira = Date.now() + SESSAO_MS;
  await env.DB.prepare("INSERT INTO sessoes (token_hash, usuario, expira) VALUES (?, ?, ?)").bind(await sha256(token), usuario, expira).run();
  await env.DB.prepare("DELETE FROM sessoes WHERE expira < ?").bind(Date.now()).run();
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSAO_MS / 1000}`;
}

export const cookieSair = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export async function usuarioDaSessao(req, env) {
  const token = lerCookie(req, COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const r = await env.DB.prepare(
    `SELECT u.usuario, u.nome, u.perfil, u.dupla, u.unidade FROM sessoes s JOIN usuarios u ON u.usuario = s.usuario
     WHERE s.token_hash = ? AND s.expira > ? AND u.ativo = 1`
  ).bind(await sha256(token), Date.now()).first();
  return r || null;
}

export async function encerrarSessao(req, env) {
  const token = lerCookie(req, COOKIE);
  if (token) await env.DB.prepare("DELETE FROM sessoes WHERE token_hash = ?").bind(await sha256(token)).run();
}

// Limite de tentativas: 10 falhas em 15 min por IP ou por usuário.
const JANELA = 15 * 60 * 1000;
export async function bloqueado(env, chaves) {
  const desde = Date.now() - JANELA;
  for (const k of chaves) {
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM tentativas WHERE chave = ? AND em > ?").bind(k, desde).first();
    if (r && r.n >= 10) return true;
  }
  return false;
}
export async function registrarFalha(env, chaves) {
  const agora = Date.now();
  for (const k of chaves) await env.DB.prepare("INSERT INTO tentativas (chave, em) VALUES (?, ?)").bind(k, agora).run();
  await env.DB.prepare("DELETE FROM tentativas WHERE em < ?").bind(agora - JANELA).run();
}

// Convite (primeiro acesso / redefinição): token aleatório, guardado só como hash, vale 7 dias.
export async function novoConvite(env, usuario) {
  const token = aleatorio(24);
  await env.DB.prepare("UPDATE usuarios SET convite = ?, convite_exp = ? WHERE usuario = ?")
    .bind(await sha256(token), Date.now() + 7 * 86400 * 1000, usuario).run();
  return token;
}

export const PRIVILEGIADOS = ["admin", "diretoria", "supervisao"];
