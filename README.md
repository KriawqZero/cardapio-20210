# Sistema de Gerenciamento de Marmitaria - Versão Profissional

Sistema profissional desenvolvido para gerenciamento completo de marmitarias, com foco na apresentação como solução comercial real. Transformado de um projeto acadêmico para uma aplicação pronta para produção.

## 🎯 Sobre o Projeto

Este sistema foi **completamente refatorado** para atender às necessidades de uma marmitaria real, saindo da aparência "infantil" do projeto original para um **design profissional e moderno**, pronto para ser apresentado a clientes reais.

### 🔄 Principais Mudanças da Refatoração

- ✅ **Interface profissional**: Design moderno e limpo, removendo aparência infantil
- ✅ **Sistema de categorias**: Almoço, Lanches, Bebidas e "Do dia" com toggle de visibilidade
- ✅ **Dashboard funcional**: Visão geral completa com estatísticas do dia
- ✅ **Cardápio público moderno**: Layout responsivo com agrupamento por categorias
- ✅ **Sistema Kanban**: Organização de pedidos por status (Novo → Em Preparo → Pronto → Entregue)
- ✅ **Campos profissionais**: Destaque, Sugestão do Chef, preços flexíveis
- ✅ **Customização fácil**: Sistema preparado para adaptação rápida a outras empresas

## 🚀 Funcionalidades

### Para Clientes (Cardápio Público)
- ✅ Visualização moderna do cardápio por categorias
- ✅ Design responsivo profissional (mobile, tablet, desktop)
- ✅ Carrinho de compras com interface intuitiva
- ✅ Sistema de destaques e sugestões do chef
- ✅ Finalização de pedidos simplificada
- ✅ Link compartilhável para WhatsApp

### Para Administradores
- ✅ **Dashboard profissional** com métricas em tempo real
- ✅ **Sistema Kanban** para gestão visual de pedidos
- ✅ **Gestão completa de categorias** com toggle de visibilidade
- ✅ **CRUD avançado** para itens do cardápio
- ✅ **Controle de disponibilidade** por item
- ✅ **Sistema de notificações** para novos pedidos
- ✅ **Relatórios e estatísticas** detalhados
- ✅ **Interface responsiva** para gestão mobile

### Recursos Avançados
- ✅ **Categoria "Do dia"** com controle de visibilidade
- ✅ **Sistema de destaques** e sugestões do chef
- ✅ **Preços flexíveis** por item (não mais volumes fixos)
- ✅ **Upload de imagens** para itens do cardápio
- ✅ **Customização rápida** de marca e cores
- ✅ **Sistema profissional** pronto para vendas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Estilização**: Tailwind CSS (customizado profissionalmente)
- **Ícones**: Lucide React
- **Notificações**: React Toastify
- **Deployment**: PM2 + Docker

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- Yarn (recomendado)

## ⚡ Instalação e Configuração

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd cardapio-20210
```

2. **Instale as dependências:**
```bash
yarn install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Configure no arquivo `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/marmitaria_db"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **Configure o banco de dados:**
```bash
# Gerar cliente Prisma
yarn prisma generate

# Executar migrações
yarn prisma migrate dev

# Popular com dados da marmitaria
yarn prisma db seed
```

5. **Execute o projeto:**
```bash
yarn dev
```

Acesse: `http://localhost:3123`

## 🔐 Acesso Administrativo

- **URL**: `/admin/login`
- **Usuário**: `admin`
- **Senha**: `admin123`

## 🏗️ Estrutura do Sistema

```
src/
├── app/
│   ├── admin/                    # Painel administrativo
│   ├── api/
│   │   ├── cardapio/            # CRUD do cardápio
│   │   ├── categorias/          # Gestão de categorias
│   │   ├── pedidos/             # Sistema de pedidos
│   │   └── admin/               # Autenticação
│   └── page.tsx                 # Cardápio público
├── components/
│   ├── CardapioPublico.tsx      # Interface pública moderna
│   ├── MarmitariaAdminDashboard.tsx  # Dashboard profissional
│   └── ...
├── config/
│   └── empresa.ts               # Configurações customizáveis
├── lib/
│   └── prisma.ts
└── prisma/
    ├── schema.prisma            # Modelo de dados profissional
    └── seed.ts                  # Dados iniciais da marmitaria
```

## 🎯 Sistema de Categorias

### Categorias Padrão:
1. **Almoço** - Pratos principais e refeições completas
2. **Lanches** - Hambúrgueres, porções e salgados  
3. **Bebidas** - Sucos, refrigerantes e bebidas diversas
4. **Do dia** - Pratos especiais com controle de visibilidade

### Recursos por Categoria:
- ✅ Toggle de visibilidade (especial para "Do dia")
- ✅ Ordenação customizável
- ✅ Descrições personalizadas
- ✅ Status ativo/inativo

## 📊 Sistema Kanban de Pedidos

```
[Novo] → [Em Preparo] → [Pronto] → [Entregue]
```

- **Novo**: Pedidos recém-chegados
- **Em Preparo**: Sendo preparados na cozinha
- **Pronto**: Aguardando retirada/entrega
- **Entregue**: Processo finalizado

## 🎨 Customização para Clientes

### Configuração Rápida (`src/config/empresa.ts`):

```typescript
export const empresaConfig = {
  nome: "Sua Marmitaria",
  slogan: "Seu slogan aqui",
  cores: {
    primary: "#ea580c",    // Cor principal
    secondary: "#0f172a",  // Cor secundária
    // ... outras cores
  },
  contato: {
    telefone: "(67) 99999-9999",
    endereco: "Seu endereço",
    // ... outros dados
  }
  // ... outras configurações
};
```

### Personalização Incluída:
- ✅ **Logo da empresa** (inicial ou imagem)
- ✅ **Cores da marca** (paleta completa)
- ✅ **Informações de contato**
- ✅ **Horários de funcionamento**
- ✅ **Configurações do sistema**

## 🚀 Deploy em Produção

### Usando PM2 (Recomendado):
```bash
yarn build
yarn pm2:start
```

### Usando Docker:
```bash
docker-compose up -d
```

### Deploy Completo:
```bash
yarn deploy  # Build + Migrate + Restart
```

## 📈 Funcionalidades para Vendas

✅ **Visual profissional** pronto para demonstração  
✅ **Sistema completo** de gestão de marmitaria  
✅ **Fácil customização** para diferentes clientes  
✅ **Interface responsiva** para todos os dispositivos  
✅ **Dashboard analítico** com métricas importantes  
✅ **Sistema de notificações** em tempo real  
✅ **Relatórios gerenciais** para tomada de decisão  

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev                 # Servidor de desenvolvimento
yarn build              # Build para produção
yarn start              # Executar build de produção

# Banco de Dados
yarn db:reset           # Limpar e recriar banco
yarn db:generate        # Gerar cliente Prisma  
yarn db:migrate         # Executar migrações
yarn db:seed            # Popular dados iniciais

# Produção (PM2)
yarn pm2:start          # Iniciar aplicação
yarn pm2:restart        # Reiniciar aplicação
yarn pm2:status         # Status da aplicação
yarn pm2:logs           # Visualizar logs

# Deploy Completo
yarn deploy             # Build + DB + Restart
```

## 💼 Potencial Comercial

Este sistema está **pronto para venda** e pode ser rapidamente adaptado para:

- 🍴 **Marmitarias e restaurantes**
- 🍕 **Pizzarias e lanchonetes** 
- 🥘 **Delivery de comida caseira**
- 🍜 **Restaurantes de bairro**
- 🥗 **Comida saudável e fitness**

### Diferenciais Competitivos:
- ✅ **Interface moderna** (não genérica)
- ✅ **Sistema completo** (não apenas cardápio)
- ✅ **Fácil customização** (economia de tempo)
- ✅ **Tecnologia atual** (Next.js, TypeScript)
- ✅ **Mobile-first** (essencial hoje)

## 📞 Suporte e Contato

Para implementação comercial ou suporte técnico, entre em contato através dos issues do repositório.

## 📄 Licença

Sistema desenvolvido para fins comerciais. Todos os direitos reservados.

---

**Sistema Profissional para Marmitarias - Versão 2.0** 🚀

*Pronto para produção e vendas* ✨