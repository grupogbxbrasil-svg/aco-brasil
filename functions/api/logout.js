import { json, encerrarSessao, cookieSair } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  await encerrarSessao(request, env);
  return json({ ok: true }, 200, { "set-cookie": cookieSair });
}
