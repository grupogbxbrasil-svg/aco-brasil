// Cria o PRIMEIRO administrador. Só funciona com a tabela de usuários vazia
// e com a chave secreta SETUP_KEY configurada no Cloudflare (Settings → Variables and Secrets).
import { json, igual, novoConvite } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.SETUP_KEY) return json({ erro: "Setup desativado." }, 404);
  let d;
  try { d = await request.json(); } catch { return json({ erro: "Dados inválidos." }, 400); }
  if (!igual(String(d.chave || ""), env.SETUP_KEY)) return json({ erro: "Chave inválida." }, 403);

  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM usuarios").first();
  if (n.n > 0) return json({ erro: "Já existe usuário cadastrado. Use a tela de administração." }, 409);

  const usuario = String(d.usuario || "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{2,40}$/.test(usuario)) return json({ erro: "Usuário inválido." }, 400);
  await env.DB.prepare("INSERT INTO usuarios (usuario, nome, perfil, criado_em) VALUES (?, ?, 'admin', ?)")
    .bind(usuario, String(d.nome || usuario).slice(0, 80), Date.now()).run();
  const token = await novoConvite(env, usuario);
  const url = new URL(request.url);
  return json({ ok: true, link: `${url.origin}/portal/primeiro-acesso.html#${token}` });
}
