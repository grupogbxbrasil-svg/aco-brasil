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
   off:1 = INDISPONÍVEL (em preparação). link = página do relatório. */
const RELATORIOS = [
  {t:"Consulta de Estoque", d:"Saldo, trânsito, cobertura por buffer e alerta de ruptura por SKU.", ic:"chart", off:1},
  {t:"Pré-rotas · Ordens", d:"Fechamento de carga por rota: veículo indicado, ocupação e mínimo de 70%.", ic:"chart", off:1},
  {t:"Carteira — Outros Centros", d:"Ordens que outros centros faturam para a nossa região, com saldo na origem.", ic:"chart", off:1},
  {t:"Busca de Estoque", d:"Pesquise por código ou descrição — estoque DBA e outros centros, em um só lugar.", ic:"chart", off:1},
  {t:"Indicadores de Performance", d:"Meta, faturado, % realizado e detalhamento por setor.", ic:"chart", c:"#ec5a24"},
  {t:"Radar Metodologia", d:"Cobertura, contatos, cotações e conversão da dupla.", ic:"target", c:"#2e7d57"},
  {t:"Radar de Crédito", d:"Limite, risco e atraso da carteira {U}.", ic:"shield", c:"#1f57a3"},
  {t:"Churn de Clientes", d:"Clientes em risco de perda e sem compra no mês.", ic:"userx", c:"#c23a2e"},
  {t:"Funil de Vendas", d:"Funil reverso: etapas, volumes e conversão.", ic:"funnel", c:"#7a47aa"},
  {t:"Pedidos - {A}", d:"Carteira de pedidos do vendedor.", ic:"doc", c:"#147a80"},
  {t:"Pedidos - {B}", d:"Carteira de pedidos do vendedor.", ic:"chart", c:"#147a80"},
  {t:"Carteira - {A}", d:"Ordens em aberto na usina por status.", ic:"chart", c:"#8a5628"},
  {t:"Carteira - {B}", d:"Ordens em aberto na usina por status.", ic:"chart", c:"#8a5628"},
  {t:"Pedido de Abastecimento Esporádico — Acompanhamento", d:"Propostas de abastecimento dos vendedores: material, descrição, quantidade e vendedor. Situação automática pelo cruzamento com a base de transferência.", ic:"chart", off:1},
  {t:"Faturamento", d:"Últimos 12 meses de faturamento com filtros por vendedor, grupo, rota, cidade, cliente, usina, mês e ano.", ic:"chart", off:1},
  {t:"Comissão", d:"Apuração da comissão do mês.", ic:"coin", c:"#b8860b"}
];
