import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados da Marmitaria...')

  // Limpar dados existentes (manter a ordem correta para evitar problemas de FK)
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.itemCardapio.deleteMany()
  await prisma.categoria.deleteMany()

  // Criar categorias
  const categorias = await Promise.all([
    prisma.categoria.create({
      data: {
        nome: 'Almoço',
        descricao: 'Pratos principais e refeições completas',
        ordem: 1,
        ativa: true,
        visivel: true,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Lanches',
        descricao: 'Hambúrgueres, porções e salgados',
        ordem: 2,
        ativa: true,
        visivel: true,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Bebidas',
        descricao: 'Sucos, refrigerantes e bebidas diversas',
        ordem: 3,
        ativa: true,
        visivel: true,
      },
    }),
    prisma.categoria.create({
      data: {
        nome: 'Do dia',
        descricao: 'Pratos especiais e sugestões do chef',
        ordem: 4,
        ativa: true,
        visivel: true, // Toggle controlável
      },
    }),
  ])

  console.log('✅ Categorias criadas:', categorias.length)

  // Buscar categorias por nome para usar nas relações
  const almoco = await prisma.categoria.findUnique({ where: { nome: 'Almoço' } })
  const lanches = await prisma.categoria.findUnique({ where: { nome: 'Lanches' } })
  const bebidas = await prisma.categoria.findUnique({ where: { nome: 'Bebidas' } })
  const doDia = await prisma.categoria.findUnique({ where: { nome: 'Do dia' } })

  // Criar itens do cardápio
  const itensCardapio = await Promise.all([
    // Almoço
    prisma.itemCardapio.create({
      data: {
        nome: 'Marmitex Tradicional',
        descricao: 'Arroz, feijão, bife acebolado, farofa e salada',
        preco: 18.00,
        imagem: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: almoco!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Frango Grelhado',
        descricao: 'Peito de frango grelhado com arroz, feijão e legumes',
        preco: 16.00,
        imagem: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        destaque: true,
        categoriaId: almoco!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Peixe Assado',
        descricao: 'Filé de peixe assado com arroz, pirão e salada',
        preco: 22.00,
        imagem: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: almoco!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Feijoada Completa',
        descricao: 'Feijoada tradicional com acompanhamentos',
        preco: 25.00,
        imagem: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        sugestaoChef: true,
        categoriaId: almoco!.id,
      },
    }),

    // Lanches
    prisma.itemCardapio.create({
      data: {
        nome: 'X-Burguer',
        descricao: 'Hambúrguer com queijo, alface, tomate e batata',
        preco: 15.00,
        imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: lanches!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'X-Bacon',
        descricao: 'Hambúrguer com bacon, queijo e acompanhamentos',
        preco: 18.00,
        imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        destaque: true,
        categoriaId: lanches!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Porção de Batata Frita',
        descricao: 'Batata frita crocante (serve 2 pessoas)',
        preco: 12.00,
        imagem: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: lanches!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Coxinha de Frango',
        descricao: 'Coxinha tradicional de frango (unidade)',
        preco: 6.00,
        imagem: 'https://images.unsplash.com/photo-1612958219406-3b3c3c045ee9?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: lanches!.id,
      },
    }),

    // Bebidas
    prisma.itemCardapio.create({
      data: {
        nome: 'Suco de Laranja Natural',
        descricao: 'Suco de laranja espremido na hora',
        preco: 8.00,
        imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: bebidas!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Água de Coco',
        descricao: 'Água de coco natural gelada',
        preco: 6.00,
        imagem: 'https://images.unsplash.com/photo-1587131128442-0677c7cdcd8d?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: bebidas!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Refrigerante Lata',
        descricao: 'Coca-Cola, Guaraná ou Fanta (350ml)',
        preco: 5.00,
        imagem: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: bebidas!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Vitamina de Banana',
        descricao: 'Vitamina natural de banana com leite',
        preco: 7.00,
        imagem: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        categoriaId: bebidas!.id,
      },
    }),

    // Do dia
    prisma.itemCardapio.create({
      data: {
        nome: 'Lasanha da Casa',
        descricao: 'Lasanha especial com molho da casa',
        preco: 20.00,
        imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        sugestaoChef: true,
        categoriaId: doDia!.id,
      },
    }),
    prisma.itemCardapio.create({
      data: {
        nome: 'Risotto de Camarão',
        descricao: 'Risotto cremoso com camarões frescos',
        preco: 28.00,
        imagem: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
        ativo: true,
        disponivel: true,
        destaque: true,
        sugestaoChef: true,
        categoriaId: doDia!.id,
      },
    }),
  ])

  console.log('✅ Itens do cardápio criados:', itensCardapio.length)
  
  // Criar alguns pedidos de exemplo
  const pedidosExemplo = await Promise.all([
    prisma.pedido.create({
      data: {
        nomeCliente: 'João Silva',
        observacao: 'Sem cebola no bife, por favor',
        total: 34.00,
        status: 'em_preparo',
        itens: {
          create: [
            {
              itemCardapioId: itensCardapio[0].id, // Marmitex Tradicional
              quantidade: 1,
              preco: 18.00,
            },
            {
              itemCardapioId: itensCardapio[8].id, // Suco de Laranja
              quantidade: 2,
              preco: 8.00,
            },
          ],
        },
      },
    }),
    prisma.pedido.create({
      data: {
        nomeCliente: 'Maria Santos',
        observacao: null,
        total: 22.00,
        status: 'pronto',
        itens: {
          create: [
            {
              itemCardapioId: itensCardapio[1].id, // Frango Grelhado
              quantidade: 1,
              preco: 16.00,
            },
            {
              itemCardapioId: itensCardapio[9].id, // Água de Coco
              quantidade: 1,
              preco: 6.00,
            },
          ],
        },
      },
    }),
    prisma.pedido.create({
      data: {
        nomeCliente: 'Carlos Oliveira',
        observacao: 'Adicionar mais molho',
        total: 27.00,
        status: 'novo',
        itens: {
          create: [
            {
              itemCardapioId: itensCardapio[5].id, // X-Bacon
              quantidade: 1,
              preco: 18.00,
            },
            {
              itemCardapioId: itensCardapio[8].id, // Suco de Laranja
              quantidade: 1,
              preco: 8.00,
            },
          ],
        },
      },
    }),
  ])

  console.log('✅ Pedidos de exemplo criados:', pedidosExemplo.length)
  console.log('🎉 Seed da Marmitaria concluído com sucesso!')
  console.log(`📊 ${categorias.length} categorias, ${itensCardapio.length} itens e ${pedidosExemplo.length} pedidos adicionados`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro ao popular banco:', e)
    await prisma.$disconnect()
    process.exit(1)
  })