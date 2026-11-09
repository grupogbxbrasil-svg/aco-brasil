// Administração de usuários (só perfil admin).
// GET    → lista
// POST   → cria usuário e devolve link de primeiro acesso
// PATCH  → altera perfil/dupla/unidade/ativo, ou {usuario, redefinir:true} gera novo link
// DELETE ?usuario=x → remove
import { json, usuarioDaSessao, novoConvite, PERFIS } from "../../_lib/auth.js";

async function exigirAdmin(request, env) {
  const u = await usuarioDaSessao(request, env);
  if (!u) return [null, json({ erro: "Não autenticado" }, 401)];
  if (u.perfil !== "admin") return [null, json({ erro: "Acesso negado" }, 403)];
  // Proteção CSRF: chamadas que alteram dados precisam vir do próprio site.
  if (request.method !== "GET") {
    const origem = request.headers.get("origin");
    if (!origem || origem !== new URL(request.url).origin) return [null, json({ erro: "Origem inválida" }, 403)];
  }
  return [u, null];
}

const limpa = (v, n = 80) => (v == null || v === "" ? null : String(v).trim().slice(0, n));
const link = (request, token) => `${new URL(request.url).origin}/portal/primeiro-acesso.html#${token}`;

export async function onRequest({ request, env }) {
  const [admin, erro] = await exigirAdmin(request, env);
  if (erro) return erro;
  const m = request.method;

  if (m === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT usuario, nome, perfil, dupla, unidade, ativo, criado_em,
              (senha_hash IS NOT NULL) AS tem_senha, (convite IS NOT NULL AND convite_exp > ?) AS convite_ativo
       FROM usuarios ORDER BY perfil, nome`
    ).bind(Date.now()).all();
    return json(results);
  }

  let d = {};
  if (m !== "DELETE") { try { d = await request.json(); } catch { return json({ erro: "Dados inválidos." }, 400); } }

  if (m === "POST") {
    const usuario = String(d.usuario || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{2,40}$/.test(usuario)) return json({ erro: "Usuário: use 2 a 40 letras minúsculas, números, ponto, hífen ou _." }, 400);
    if (!PERFIS.includes(d.perfil)) return json({ erro: "Perfil inválido." }, 400);
    if (d.perfil === "vendedor" && !limpa(d.dupla)) return json({ erro: "Vendedor precisa de uma dupla." }, 400);
    const existe = await env.DB.prepare("SELECT 1 FROM usuarios WHERE usuario = ?").bind(usuario).first();
    if (existe) return json({ erro: "Esse usuário já existe." }, 409);
    await env.DB.prepare("INSERT INTO usuarios (usuario, nome, perfil, dupla, unidade, criado_em) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(usuario, limpa(d.nome) || usuario, d.perfil, limpa(d.dupla, 60), limpa(d.unidade, 60), Date.now()).run();
    return json({ ok: true, link: link(request, await novoConvite(env, usuario)) }, 201);
  }

  if (m === "PATCH") {
    const usuario = String(d.usuario || "").toLowerCase();
    const alvo = await env.DB.prepare("SELECT usuario, perfil FROM usuarios WHERE usuario = ?").bind(usuario).first();
    if (!alvo) return json({ erro: "Usuário não encontrado." }, 404);
    if (d.redefinir) {
      await env.DB.prepare("DELETE FROM sessoes WHERE usuario = ?").bind(usuario).run();
      return json({ ok: true, link: link(request, await novoConvite(env, usuario)) });
    }
    if (d.perfil !== undefined && !PERFIS.includes(d.perfil)) return json({ erro: "Perfil inválido." }, 400);
    if (usuario === admin.usuario && ((d.perfil && d.perfil !== "admin") || d.ativo === false)) {
      return json({ erro: "Você não pode remover o seu próprio acesso de administrador." }, 400);
    }
    await env.DB.prepare(
      `UPDATE usuarios SET nome = COALESCE(?, nome), perfil = COALESCE(?, perfil), dupla = ?, unidade = ?, ativo = COALESCE(?, ativo) WHERE usuario = ?`
    ).bind(limpa(d.nome), d.perfil ?? null, limpa(d.dupla, 60), limpa(d.unidade, 60), d.ativo === undefined ? null : (d.ativo ? 1 : 0), usuario).run();
    if (d.ativo === false) await env.DB.prepare("DELETE FROM sessoes WHERE usuario = ?").bind(usuario).run();
    return json({ ok: true });
  }

  if (m === "DELETE") {
    const usuario = String(new URL(request.url).searchParams.get("usuario") || "").toLowerCase();
    if (usuario === admin.usuario) return json({ erro: "Você não pode excluir a si mesmo." }, 400);
    await env.DB.prepare("DELETE FROM sessoes WHERE usuario = ?").bind(usuario).run();
    await env.DB.prepare("DELETE FROM usuarios WHERE usuario = ?").bind(usuario).run();
    return json({ ok: true });
  }

  return json({ erro: "Método não suportado" }, 405);
}
