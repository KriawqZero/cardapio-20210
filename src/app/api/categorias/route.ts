import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Buscar categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirInativas = searchParams.get('incluirInativas') === 'true';
    const comItens = searchParams.get('comItens') === 'true';

    const where: any = {};
    
    if (!incluirInativas) {
      where.ativa = true;
    }

    const include: any = {};
    if (comItens) {
      include.itens = {
        where: {
          ativo: true,
          disponivel: true,
        },
        include: {
          categoria: true,
        },
        orderBy: [
          { destaque: 'desc' },
          { sugestaoChef: 'desc' },
          { nome: 'asc' },
        ],
      };
    }

    const categorias = await prisma.categoria.findMany({
      where,
      include,
      orderBy: { ordem: 'asc' },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova categoria (admin)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { nome, descricao, ordem } = data;
    
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma categoria com esse nome
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { nome },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 400 }
      );
    }

    const novaCategoria = await prisma.categoria.create({
      data: {
        nome,
        descricao,
        ordem: ordem || 0,
        ativa: true,
        visivel: true,
      },
    });

    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar categoria (admin)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Se estiver tentando atualizar o nome, verificar se não existe outro com o mesmo nome
    if (updateData.nome) {
      const categoriaExistente = await prisma.categoria.findFirst({
        where: {
          nome: updateData.nome,
          id: { not: id },
        },
      });

      if (categoriaExistente) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com esse nome' },
          { status: 400 }
        );
      }
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(categoriaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar categoria (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a categoria tem itens
    const itensNaCategoria = await prisma.itemCardapio.findFirst({
      where: { categoriaId: id },
    });

    if (itensNaCategoria) {
      return NextResponse.json(
        { error: 'Não é possível deletar categoria que possui itens' },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
