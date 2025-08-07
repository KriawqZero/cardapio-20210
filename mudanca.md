

## Prompt: Refatoração de sistema de gerenciamento de pedidos para marmitaria local

---

### Contexto:

Este sistema foi desenvolvido inicialmente como um projeto de turma, focado no gerenciamento de pedidos de drinks e lanches. A versão atual funciona bem em termos de CRUDs, estrutura e essência, mas tem **interface genérica e visual amador**, com aparência infantil, o que **não é adequado para apresentar a um cliente real**.

Agora o sistema será adaptado para ser apresentado como **demo real para uma marmitaria da cidade**, com potencial de venda do sistema como produto pronto e personalizável.

---

### Objetivo desta refatoração:

**Apresentar o sistema como uma solução profissional e funcional para o dia a dia de uma marmitaria real**, com base no funcionamento de uma empresa local. O sistema deve resolver de forma clara e prática o problema de:

* **Organizar os pedidos**
* **Exibir o cardápio atualizado por categoria**
* **Permitir que o cliente gerencie isso por conta própria**
* **Ter uma aparência moderna, limpa e alinhada à identidade visual do cliente**

---

### O que deve ser feito:

#### 1. **Interface visual**

* Refatorar todo o visual do sistema para sair da aparência “infantil”.
* Utilizar uma paleta de cores alinhada com a identidade visual da empresa (logo e cardápio serão enviados como referência).
* Incluir **a logo da empresa na navbar ou canto superior esquerdo**, como marca d’água ou cabeçalho.
* Layout responsivo, funcional para celular, tablet e PC.
* Tipografia mais profissional (sem fontes arredondadas ou estilo infantil).

#### 2. **Dashboard funcional**

* Adicionar um dashboard inicial após login com visão geral de:

  * Pedidos do dia
  * Itens mais vendidos
  * Acesso rápido aos CRUDs
  * Destaques como o cardápio "do dia"

#### 3. **Sistema de cardápio por categoria**

Adaptar o sistema atual de CRUDs de drinks para o seguinte modelo de categorias:

* **Almoço** (pratos principais)
* **Lanches** (hambúrguer, porções, salgados)
* **Bebidas**
* **Do dia** (categoria especial com visibilidade controlada)

> A categoria "Do dia" deve ter **um toggle de visibilidade**. Ao ativar, os itens nela aparecem no cardápio público. Quando desativada, a seção inteira some (ideal para uso rotineiro da marmitaria).

* Permitir adicionar novos itens com:

  * Nome
  * Descrição
  * Preço
  * Foto (upload)
  * Categoria
  * Toggle de exibição pública
  * Indicação se é "Destaque" ou "Sugestão do chef"

#### 4. **Página pública do cardápio**

* Refatorar a visualização pública do cardápio:

  * Agrupar por categorias, respeitando a ordem: Almoço > Lanches > Bebidas > Do dia
  * Visual moderno e limpo
  * Mostrar imagem, nome, descrição e preço dos itens
  * O cardápio deve ser acessível via link (pode ser compartilhado no WhatsApp)

#### 5. **Administração simples e funcional**

* Manter os CRUDs internos já existentes, mas com visual mais profissional
* Melhorar usabilidade:

  * Interface para adicionar/remover categorias
  * Facilidade para editar itens do cardápio rapidamente
  * Upload de imagem simplificado

#### 6. **Customização para a empresa (cliente)**

* Todas as alterações de nome, logo, categorias e cores devem ser **gerenciáveis ou fáceis de alterar para o cliente final**.
* O sistema deve estar pronto para funcionar com qualquer marmitaria apenas mudando os dados do cardápio e a identidade visual.

---

### Outras melhorias desejadas:

* Organização dos pedidos com **colunas de status** (Kanban): "Novo", "Em preparo", "Pronto", "Entregue"
* Possibilidade de integrar com WhatsApp futuramente (ex: envio de pedido ou cardápio)

---

### Resultado esperado:

Um sistema com:

* **Visual moderno e pronto para produção**
* **Cardápio totalmente gerenciável e visualmente atrativo**
* **Pronto para ser apresentado e usado por uma marmitaria real**
* **Capacidade de adaptação fácil para vender a outras empresas com pouca alteração no código**
