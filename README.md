# Aço Brasil

Site da Aço Brasil – Distribuidor ArcelorMittal (Belém e Marabá).

## Estrutura

- `index.html` – site institucional (Início, Produtos, Quem Somos, Unidades, Pessoas & Cultura, Notícias, Contato).
- `assets/css/site.css` – cores, tipografia e layout responsivo.
- `assets/js/site.js` – menu móvel e lista de **NOTÍCIAS** (edite o array para publicar comunicados).
- `assets/img/` – fotos de referência recortadas do mockup. **Substituir por fotos licenciadas/originais em alta resolução** antes da divulgação.
- `portal/login.html`, `portal/primeiro-acesso.html`, `portal/admin.html` – login, criação de senha e cadastro de usuários.
- `functions/` – backend no Cloudflare (login, sessões, administração).
- `portal/mural-vendedores.html` – página anterior (avisos, matérias, aniversariantes), preservada.

## Publicação

Cloudflare Pages (projeto `aco-brasil`, branch `main`, pasta raiz, sem comando de build),
no domínio `grupoacobrasil.com.br`. Todo envio para `main` republica o site.

## Login do portal (Cloudflare Pages Functions + D1)

- `functions/_middleware.js` protege todo o `/portal` **no servidor**: sem sessão válida, nenhuma página é entregue.
- Perfis: `admin`, `diretoria`, `supervisao`, `logistica`, `vendedor`. Vendedor só abre o painel da própria dupla;
  diretoria/financeiro/duplas só para admin, diretoria e supervisão; `portal/admin.html` só para admin.
- Senhas guardadas como PBKDF2-SHA256 com salt no banco D1 `aco-brasil-portal`. **Nenhuma senha fica neste repositório.**
- Cadastro em `portal/admin.html`: o admin cria o usuário e recebe um link de uso único (7 dias); a pessoa cria a própria senha.
- 10 tentativas erradas em 15 min bloqueiam o IP/usuário por 15 min.

### Configuração (uma vez)

1. Cloudflare → Workers & Pages → D1 → criar banco `aco-brasil-portal`; copiar o ID para `wrangler.toml`.
2. Rodar `schema.sql` no banco (Console do D1 ou `wrangler d1 execute aco-brasil-portal --remote --file=schema.sql`).
3. Workers & Pages → Criar → Pages → conectar este repositório (build vazio, saída `.`).
4. No projeto Pages: Configurações → Vínculos → D1 `DB` → `aco-brasil-portal`;
   Variáveis e segredos → segredo `SETUP_KEY` com um valor longo aleatório.
5. Criar o primeiro admin (só funciona com o banco vazio):
   `curl -X POST https://grupoacobrasil.com.br/api/setup -H 'content-type: application/json' -d '{"chave":"<SETUP_KEY>","usuario":"gilvan","nome":"Gilvan"}'`
   e abrir o link devolvido. Depois disso, pode apagar o segredo `SETUP_KEY`.
6. Domínios personalizados → `grupoacobrasil.com.br` e `www.grupoacobrasil.com.br`.

Teste local: `wrangler d1 execute aco-brasil-portal --local --file=schema.sql` e `wrangler pages dev .`
(com `SETUP_KEY=...` em `.dev.vars`).

## Pendências (dados da empresa)

- Textos oficiais de história, missão, visão e valores.
- Endereço, telefone, e-mail e horário de Belém e Marabá.
- Confirmação do portfólio real de produtos.
- Arquivos de marca autorizados (logo Aço Brasil em vetor).
