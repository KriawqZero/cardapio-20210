import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      }
    });
    
    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Erro ao buscar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 