import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany({
      where: {
        ativo: true
      },
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
    const { nome, descricao, imagem } = await request.json();
    
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
        ativo: true
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