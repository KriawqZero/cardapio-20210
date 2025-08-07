import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }
    
    // Validar status permitidos
    const validStatuses = ['novo', 'em_preparo', 'pronto', 'entregue'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se o pedido existe
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id }
    });
    
    if (!pedidoExistente) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar o status do pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        itens: {
          include: {
            itemCardapio: {
              include: {
                categoria: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(pedidoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}