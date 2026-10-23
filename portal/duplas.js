/* ============================================================
   CADASTRO DAS DUPLAS — para criar uma dupla nova, copie um
   bloco, troque os dados e salve. O painel fica em:
   portal/painel.html?d=<id>
   ATENÇÃO: senhas aqui são SÓ DE TESTE (repositório público).
   ============================================================ */
const DUPLAS = {
  "israel-stefanny": {
    unidade: "DBA Marabá",
    nomes: ["Israel", "Stefanny"],
    iniciais: "IS",
    usuarios: { israel: "teste123", stefanny: "teste123" }
  }
  /* Exemplo de nova dupla:
  ,"fulano-ciclano": {
    unidade: "DBA Marabá",
    nomes: ["Fulano", "Ciclano"],
    iniciais: "FC",
    usuarios: { fulano: "teste123", ciclano: "teste123" }
  }
  */
};

/* Relatórios do painel. {A} e {B} = nomes dos vendedores, {U} = unidade.
   g = grupo (ind = Indicadores e Gestão, ped = Pedidos e Carteira, prep = Relatórios em preparação)
   off:1 = Em preparação. link = página do relatório (sem link, o card não abre nada). */
const RELATORIOS = [
  {g:"ind", t:"Indicadores de Performance", d:"Meta, faturado, % realizado e detalhamento por setor.", ic:"chart", c:"#ec5a24"},
  {g:"ind", t:"Radar Metodologia", d:"Cobertura, contatos, cotações e conversão da dupla.", ic:"target", c:"#2e7d57"},
  {g:"ind", t:"Radar de Crédito", d:"Limite, risco e atraso da carteira {U}.", ic:"shield", c:"#1f57a3"},
  {g:"ind", t:"Churn de Clientes", d:"Clientes em risco de perda e sem compra no mês.", ic:"users", c:"#e2483d"},
  {g:"ind", t:"Funil de Vendas", d:"Funil reverso: etapas, volumes e conversão.", ic:"funnel", c:"#7a47aa"},
  {g:"ped", t:"Pedidos - {A}", d:"Carteira de pedidos do vendedor.", ic:"box", c:"#127c80"},
  {g:"ped", t:"Pedidos - {B}", d:"Carteira de pedidos do vendedor.", ic:"box", c:"#127c80"},
  {g:"ped", t:"Carteira - {A}", d:"Ordens em aberto na usina por status.", ic:"user", c:"#173f7a"},
  {g:"ped", t:"Carteira - {B}", d:"Ordens em aberto na usina por status.", ic:"user", c:"#9a6a44"},
  {g:"prep", t:"Consulta de Estoque — Belém", d:"Saldo, trânsito, cobertura por buffer e alerta de ruptura por SKU.", ic:"store", off:1},
  {g:"prep", t:"Pré-rotas — Ordem de Carga", d:"Fechamento de carga por rota: veículo indicado, ocupação e mínimo de 70%.", ic:"truck", off:1},
  {g:"prep", t:"Carteira — Outros Centros", d:"Ordens que outros centros faturam para a nossa região, com saldo na origem.", ic:"building", off:1},
  {g:"prep", t:"Busca de Estoque", d:"Pesquise por código ou descrição — estoque DBA e outros centros, em um só lugar.", ic:"search", off:1},
  {g:"prep", t:"Pedido de Abastecimento Esporádico", d:"Propostas de abastecimento dos vendedores: material, descrição, quantidade e vendedor.", ic:"cal", off:1},
  {g:"prep", t:"Faturamento", d:"Últimos 12 meses de faturamento com filtros por vendedor, grupo, rota, cidade, cliente, usina, mês e ano.", ic:"doc", off:1},
  {g:"prep", t:"Comissão", d:"Apuração da comissão do mês.", ic:"coin", c:"#c8930d"}
];
