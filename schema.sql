-- Banco D1 do portal Aço Brasil (login).
-- Aplicar: wrangler d1 execute aco-brasil-portal --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
  usuario      TEXT PRIMARY KEY,          -- login em minúsculas (ex.: israel)
  nome         TEXT NOT NULL,
  perfil       TEXT NOT NULL CHECK (perfil IN ('admin','diretoria','supervisao','logistica','vendedor')),
  dupla        TEXT,                      -- id da dupla em portal/duplas.js (só vendedor)
  unidade      TEXT,
  senha_hash   TEXT,                      -- PBKDF2-SHA256, nulo até o primeiro acesso
  senha_salt   TEXT,
  convite      TEXT,                      -- hash do token de primeiro acesso / redefinição
  convite_exp  INTEGER,
  ativo        INTEGER NOT NULL DEFAULT 1,
  criado_em    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessoes (
  token_hash TEXT PRIMARY KEY,
  usuario    TEXT NOT NULL REFERENCES usuarios(usuario) ON DELETE CASCADE,
  expira     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessoes_usuario ON sessoes(usuario);

CREATE TABLE IF NOT EXISTS tentativas (
  chave TEXT NOT NULL,                    -- ip ou usuario
  em    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tentativas_chave ON tentativas(chave, em);
