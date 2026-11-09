import { json, hashSenha, igual, criarSessao, bloqueado, registrarFalha } from "../_lib/auth.js";

const ERRO = "Usuário ou senha inválidos.";

export async function onRequestPost({ request, env }) {
  let dados;
  try { dados = await request.json(); } catch { return json({ erro: ERRO }, 400); }
  const usuario = String(dados.usuario || "").trim().toLowerCase();
  const senha = String(dados.senha || "");
  const ip = request.headers.get("cf-connecting-ip") || "?";
  const chaves = ["ip:" + ip, "u:" + usuario];

  if (await bloqueado(env, chaves)) return json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, 429);

  const u = await env.DB.prepare("SELECT usuario, perfil, dupla, senha_hash, senha_salt, ativo FROM usuarios WHERE usuario = ?").bind(usuario).first();
  // Calcula o hash mesmo sem usuário para não revelar quais logins existem pelo tempo de resposta.
  const { hash } = await hashSenha(senha, u?.senha_salt || "salt-falso-000000");
  if (!u || !u.ativo || !u.senha_hash || !igual(hash, u.senha_hash)) {
    await registrarFalha(env, chaves);
    return json({ erro: ERRO }, 401);
  }

  const cookie = await criarSessao(env, u.usuario);
  const destino =
    u.perfil === "admin" ? "/portal/admin.html" :
    u.perfil === "vendedor" && u.dupla ? `/portal/painel.html?d=${encodeURIComponent(u.dupla)}` :
    ["diretoria", "supervisao"].includes(u.perfil) ? "/portal/diretoria.html" :
    "/portal/app.html";
  return json({ ok: true, destino }, 200, { "set-cookie": cookie });
}
