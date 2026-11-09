// Define a senha a partir do link de convite (primeiro acesso ou redefinição).
import { json, sha256, hashSenha, senhaValida, criarSessao, bloqueado, registrarFalha } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ erro: "Dados inválidos." }, 400); }
  const ip = "ip:" + (request.headers.get("cf-connecting-ip") || "?");
  if (await bloqueado(env, [ip])) return json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, 429);

  const token = String(d.token || "");
  if (!/^[0-9a-f]{48}$/.test(token)) { await registrarFalha(env, [ip]); return json({ erro: "Link inválido ou expirado." }, 400); }
  if (!senhaValida(d.senha)) return json({ erro: "A senha precisa ter pelo menos 8 caracteres." }, 400);

  const u = await env.DB.prepare("SELECT usuario FROM usuarios WHERE convite = ? AND convite_exp > ? AND ativo = 1")
    .bind(await sha256(token), Date.now()).first();
  if (!u) { await registrarFalha(env, [ip]); return json({ erro: "Link inválido ou expirado. Peça um novo ao administrador." }, 400); }

  const { hash, salt } = await hashSenha(d.senha);
  await env.DB.prepare("UPDATE usuarios SET senha_hash = ?, senha_salt = ?, convite = NULL, convite_exp = NULL WHERE usuario = ?")
    .bind(hash, salt, u.usuario).run();
  await env.DB.prepare("DELETE FROM sessoes WHERE usuario = ?").bind(u.usuario).run();
  return json({ ok: true }, 200, { "set-cookie": await criarSessao(env, u.usuario) });
}
