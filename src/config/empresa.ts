// Configurações da empresa - Fácil personalização
export const empresaConfig = {
  // Informações da empresa
  nome: "Marmitaria da Casa",
  slogan: "Comida caseira com sabor único",
  descricao: "Pratos frescos, ingredientes selecionados e muito sabor. Faça seu pedido e desfrute da melhor comida caseira da região.",
  
  // Cores da marca (valores em CSS)
  cores: {
    primary: "#ea580c", // Laranja principal
    primaryDark: "#c2410c", // Laranja escuro
    primaryLight: "#fb923c", // Laranja claro
    secondary: "#0f172a", // Cinza escuro
    accent: "#fbbf24", // Amarelo dourado
    success: "#059669", // Verde sucesso
    warning: "#d97706", // Amarelo aviso
    danger: "#dc2626", // Vermelho perigo
  },
  
  // Logo da empresa
  logo: {
    // Usar inicial da empresa enquanto não há logo customizada
    inicial: "M",
    // Caminho para logo personalizada (quando disponível)
    imagem: null, // ex: "/images/logo.png"
    tamanho: "48px",
  },
  
  // Informações de contato
  contato: {
    telefone: "(67) 99999-9999",
    whatsapp: "5567999999999", // Formato: DDI + DDD + número
    email: "contato@marmitariadacasa.com",
    endereco: "Rua das Delícias, 123 - Centro",
    cidade: "Campo Grande - MS",
  },
  
  // Configurações de funcionamento
  funcionamento: {
    horarios: [
      { dia: "Segunda a Sexta", horario: "11:00 - 14:00 | 18:00 - 22:00" },
      { dia: "Sábado", horario: "11:00 - 15:00" },
      { dia: "Domingo", horario: "Fechado" },
    ],
    entrega: true,
    retirada: true,
    pedidoMinimo: 15.00,
  },
  
  // Configurações do sistema
  sistema: {
    // Título da página (aparece na aba do navegador)
    titulo: "Marmitaria da Casa - Cardápio",
    // Descrição para SEO
    descricaoSEO: "Cardápio online da Marmitaria da Casa. Faça seu pedido de forma rápida e prática!",
    // Favicon
    favicon: "/favicon.png",
    // Versão do sistema
    versao: "2.0.0",
  },
  
  // Configurações de pagamento (para futuras implementações)
  pagamento: {
    aceitaCartao: true,
    aceitaPix: true,
    aceitaDinheiro: true,
    taxaEntrega: 5.00,
  },
  
  // Redes sociais (para futuras implementações)
  redesSociais: {
    instagram: "@marmitariadacasa",
    facebook: "marmitariadacasa",
    whatsapp: "5567999999999",
  },
  
  // Configurações avançadas
  avancado: {
    // Intervalo de atualização dos pedidos (em ms)
    intervaloAtualizacao: 5000,
    // Número máximo de itens por categoria na página inicial
    maxItensCategoria: 10,
    // Habilitação de funcionalidades
    habilitarNotificacoes: true,
    habilitarEstatisticas: true,
    habilitarRelatorios: true,
  }
};

// Função para obter configuração de cor CSS
export function getCorCSS(cor: keyof typeof empresaConfig.cores): string {
  return empresaConfig.cores[cor];
}

// Função para obter configuração específica
export function getConfig<T extends keyof typeof empresaConfig>(chave: T): typeof empresaConfig[T] {
  return empresaConfig[chave];
}

// Função para validar se a empresa está configurada
export function validarConfiguracao(): boolean {
  const config = empresaConfig;
  
  if (!config.nome || !config.slogan) {
    console.warn("Configuração incompleta: nome e slogan são obrigatórios");
    return false;
  }
  
  if (!config.contato.telefone || !config.contato.endereco) {
    console.warn("Configuração incompleta: informações de contato são importantes");
  }
  
  return true;
}

export default empresaConfig;
