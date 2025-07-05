import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    
    return NextResponse.json(drinks);
  } catch (error) {
    console.error('Erro ao buscar drinks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nome, descricao, imagem, novidade } = await request.json();
    
    if (!nome?.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    const drink = await prisma.drink.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        imagem: imagem?.trim() || null,
        ativo: true,
        esgotado: false,
        esgotando: false,
        novidade: novidade || false
      }
    });
    
    return NextResponse.json(drink, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar drink:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ativo, esgotado, esgotando, novidade } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (typeof ativo === 'boolean') updateData.ativo = ativo;
    if (typeof esgotado === 'boolean') updateData.esgotado = esgotado;
    if (typeof esgotando === 'boolean') updateData.esgotando = esgotando;
    if (typeof novidade === 'boolean') updateData.novidade = novidade;
    
    const drink = await prisma.drink.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(drink);
  } catch (error) {
    console.error('Erro ao atualizar drink:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 