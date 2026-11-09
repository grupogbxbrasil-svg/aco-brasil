import { json, usuarioDaSessao } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const u = await usuarioDaSessao(request, env);
  return u ? json(u) : json({ erro: "Não autenticado" }, 401);
}
