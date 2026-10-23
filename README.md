# Aço Brasil

Site da Aço Brasil – Distribuidor ArcelorMittal (Belém e Marabá).

## Estrutura

- `index.html` – site institucional (Início, Produtos, Quem Somos, Unidades, Pessoas & Cultura, Notícias, Contato).
- `assets/css/site.css` – cores, tipografia e layout responsivo.
- `assets/js/site.js` – menu móvel e lista de **NOTÍCIAS** (edite o array para publicar comunicados).
- `assets/img/` – fotos de referência recortadas do mockup. **Substituir por fotos licenciadas/originais em alta resolução** antes da divulgação.
- `portal/login.html` – tela de Acesso Restrito (desativada até haver autenticação real).
- `portal/mural-vendedores.html` – página anterior (avisos, matérias, aniversariantes), preservada.

## Publicação

GitHub Pages, branch `main`, pasta raiz. Todo envio para `main` republica o site.

## Pendências (dados da empresa)

- Textos oficiais de história, missão, visão e valores.
- Endereço, telefone, e-mail e horário de Belém e Marabá.
- Confirmação do portfólio real de produtos.
- Arquivos de marca autorizados (logo Aço Brasil em vetor).

## Portal interno – próximos passos

O GitHub Pages só hospeda arquivos estáticos e **não** oferece login seguro. Para os perfis
Vendedor, Gerência, Diretoria e Administrador será preciso um serviço de autenticação com
banco de dados e regras de acesso no servidor (ex.: Supabase ou Firebase). Nenhuma senha,
token ou chave deve ser colocada neste repositório público.
