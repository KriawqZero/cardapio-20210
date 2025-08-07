import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Buscar itens do cardápio (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const incluirInativos = searchParams.get('incluirInativos') === 'true';

    const where: any = {};
    
    if (categoriaId) {
      where.categoriaId = categoriaId;
    }
    
    if (!incluirInativos) {
      where.ativo = true;
      where.disponivel = true;
      where.categoria = {
        ativa: true,
        visivel: true,
      };
    }

    const itens = await prisma.itemCardapio.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: [
        { categoria: { ordem: 'asc' } },
        { destaque: 'desc' },
        { sugestaoChef: 'desc' },
        { nome: 'asc' },
      ],
    });

    return NextResponse.json(itens);
  } catch (error) {
    console.error('Erro ao buscar cardápio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo item do cardápio (admin)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { nome, descricao, preco, categoriaId, imagem, destaque, sugestaoChef } = data;
    
    if (!nome || !preco || !categoriaId) {
      return NextResponse.json(
        { error: 'Nome, preço e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    const novoItem = await prisma.itemCardapio.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoriaId,
        imagem,
        destaque: destaque || false,
        sugestaoChef: sugestaoChef || false,
        ativo: true,
        disponivel: true,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(novoItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar item do cardápio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar item do cardápio (admin)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do item é obrigatório' },
        { status: 400 }
      );
    }

    // Converter preço para float se fornecido
    if (updateData.preco) {
      updateData.preco = parseFloat(updateData.preco);
    }

    const itemAtualizado = await prisma.itemCardapio.update({
      where: { id },
      data: updateData,
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(itemAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar item do cardápio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar item do cardápio (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do item é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o item está sendo usado em algum pedido
    const pedidosComItem = await prisma.itemPedido.findFirst({
      where: { itemCardapioId: id },
    });

    if (pedidosComItem) {
      // Se estiver sendo usado, apenas desativar
      const itemDesativado = await prisma.itemCardapio.update({
        where: { id },
        data: { ativo: false },
      });
      
      return NextResponse.json({
        message: 'Item desativado pois está sendo usado em pedidos',
        item: itemDesativado,
      });
    } else {
      // Se não estiver sendo usado, deletar
      await prisma.itemCardapio.delete({
        where: { id },
      });
      
      return NextResponse.json({
        message: 'Item deletado com sucesso',
      });
    }
  } catch (error) {
    console.error('Erro ao deletar item do cardápio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
