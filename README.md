# Sistema de Pedidos - Drinks da 20210

Sistema web moderno para gerenciamento de pedidos de drinks da barraca da turma 20210 no Arraiá do IFMS.

## 🚀 Funcionalidades

### Para Clientes
- **Interface simples e intuitiva** para fazer pedidos
- **Seleção de drinks** com diferentes volumes (300ml, 500ml, 700ml)
- **Valores fixos** por volume (R$ 8, R$ 10, R$ 14)
- **Confirmação de pedido** com instruções de pagamento
- **Acompanhamento em tempo real** do status do pedido via ID único
- **Design responsivo** otimizado para tablets Samsung
- **Visual moderno** com cores sólidas e ícones SVG

### Para Atendentes
- **Painel administrativo protegido** com autenticação por senha
- **Visualização em tempo real** dos pedidos
- **Controle de status** dos pedidos (aguardando pagamento, ficha entregue, em preparo, pronto, entregue)
- **Busca por nome** do cliente
- **Gerenciamento de drinks** (adicionar, editar, ativar/desativar)
- **Relatórios** com estatísticas de vendas
- **Interface moderna** sem emojis, com ícones SVG profissionais

## 🛠️ Tecnologias

- **Next.js 15** (App Router)
- **Prisma ORM** com MariaDB
- **TailwindCSS** para estilização
- **TypeScript** para tipagem
- **Lucide React** para ícones

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MariaDB ou MySQL
- Yarn ou npm

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd cardapio-20210
   ```

2. **Instale as dependências**
   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configure o banco de dados**
   - Crie um banco de dados MariaDB/MySQL
   - Copie o arquivo `.env.example` para `.env`
   - Configure a URL do banco no arquivo `.env`:
   ```env
   DATABASE_URL="mysql://usuario:senha@localhost:3306/cardapio_20210"
   ```

4. **Execute as migrações do banco**
   ```bash
   yarn db:push
   # ou
   npm run db:push
   ```

5. **Gere o cliente Prisma**
   ```bash
   yarn db:generate
   # ou
   npm run db:generate
   ```

6. **Popule o banco com dados iniciais**
   ```bash
   yarn db:seed
   # ou
   npm run db:seed
   ```

## 🚦 Executando o Sistema

### Desenvolvimento
```bash
yarn dev
# ou
npm run dev
```

O sistema estará disponível em:
- **Interface do Cliente**: [http://localhost:3000](http://localhost:3000)
- **Painel Administrativo**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Produção
```bash
yarn build
yarn start
# ou
npm run build
npm start
```

## 📱 Como Usar

### Para Clientes
1. Acesse a página principal via QR Code na barraca
2. Digite seu nome completo
3. Selecione os drinks desejados e os volumes
4. Confirme o pedido
5. **Copie o link** para acompanhar seu pedido ou clique em "Acompanhar Pedido"
6. Entregue a ficha correspondente ao valor total para o atendente
7. **Acompanhe o status** do seu pedido em tempo real via `/pedido/[ID]`

### Para Atendentes
1. Acesse `/admin` no navegador
2. **Digite a senha de acesso** quando solicitado
3. Use a aba **Pedidos** para gerenciar os pedidos:
   - Veja novos pedidos chegando em tempo real
   - Marque quando o cliente entregar a ficha
   - Atualize o status conforme o preparo
   - Use a busca para encontrar pedidos específicos

3. Use a aba **Drinks** para gerenciar o cardápio:
   - Adicione novos drinks
   - Edite informações existentes
   - Ative/desative drinks

4. Use a aba **Relatórios** para ver estatísticas:
   - Total de pedidos e receita
   - Drinks mais vendidos
   - Volumes mais pedidos

## 🎨 Tema Visual

O sistema usa um design moderno e profissional:
- **Cores primárias**: Azul (#2563eb), Roxo (#7c3aed)
- **Cores de acento**: Âmbar (#f59e0b), Verde (#059669), Vermelho (#dc2626)
- **Design limpo** com cards arredondados e sombras sutis
- **Ícones SVG** da biblioteca Lucide React para interface profissional
- **Gradientes modernos** para backgrounds
- **Transições suaves** e hover effects

## 📊 Status dos Pedidos

1. **Aguardando Pagamento**: Pedido criado, cliente deve entregar a ficha
2. **Ficha Entregue**: Cliente entregou a ficha, pode começar preparo
3. **Em Preparo**: Drink está sendo preparado
4. **Pronto**: Drink pronto para entrega
5. **Entregue**: Pedido finalizado

## 🔒 Segurança

- **Autenticação obrigatória** para área administrativa
- **Cookies HTTP-only** para sessões seguras
- Todas as entradas são validadas
- Dados sensíveis protegidos via variáveis de ambiente
- Sanitização de dados de entrada
- Prevenção contra SQL injection via Prisma
- **Senha administrativa configurável** via código fonte

## 📝 Scripts Disponíveis

- `yarn dev` - Executa em modo desenvolvimento
- `yarn build` - Gera build de produção
- `yarn start` - Executa build de produção
- `yarn db:generate` - Gera cliente Prisma
- `yarn db:push` - Aplica mudanças no banco
- `yarn db:seed` - Popula banco com dados iniciais

## 🎯 Otimizações para Tablets

O sistema foi otimizado especificamente para tablets Samsung:
- **Botões grandes** para facilitar o toque
- **Texto legível** em telas de 10-12 polegadas
- **Grid responsivo** que se adapta à orientação
- **Navegação intuitiva** com abas claras

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco de dados está rodando
3. Verifique os logs no console do navegador
4. Consulte a documentação do Prisma para problemas de banco

## 🎊 Sobre o Projeto

Este sistema foi desenvolvido especificamente para a barraca de drinks da turma 20210 do IFMS durante o Arraiá 2025. Foi projetado para ser:
- **Simples de usar** durante a festa
- **Rápido de configurar** no evento
- **Fácil de manter** durante o uso
- **Eficiente** para organizar o atendimento
- **Moderno e profissional** com design limpo

**Objetivo**: Eliminar a desorganização dos anos anteriores e proporcionar um atendimento mais ágil e profissional com tecnologia moderna.

### Principais Melhorias da Versão Atual
- ✅ **Interface moderna** sem emojis, com ícones SVG profissionais
- ✅ **Autenticação administrativa** para segurança
- ✅ **Acompanhamento de pedidos** em tempo real via ID único
- ✅ **Design responsivo** otimizado para tablets
- ✅ **Cores modernas** e design profissional
- ✅ **Cursor pointer** em todos os elementos interativos

---

**Bom Arraiá e muito sucesso na barraca da 20210!**
