import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar pedidos "ficha_entregue" primeiro (fila de espera)
    const pedidosFila = await prisma.pedido.findMany({
      where: {
        status: 'ficha_entregue'
      },
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      },
      orderBy: {
        updatedAt: 'asc' // Ordem por quando ficou "ficha_entregue" (FIFO)
      }
    });

    // Buscar pedidos "em_preparo" (o que está sendo feito agora)
    const pedidosEmPreparo = await prisma.pedido.findMany({
      where: {
        status: 'em_preparo'
      },
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      },
      orderBy: {
        updatedAt: 'asc' // Ordem por quando começou a ser preparado
      }
    });

    // Prioridade: primeiro os "em_preparo" (atual), depois "ficha_entregue" (fila)
    const pedidos = [...pedidosEmPreparo, ...pedidosFila];
    
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos do barman:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 