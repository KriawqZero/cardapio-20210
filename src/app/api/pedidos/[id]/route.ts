import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }
    
    const validStatuses = [
      'aguardando_pagamento',
      'ficha_entregue',
      'em_preparo',
      'pronto',
      'entregue'
    ];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }
    
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      }
    });
    
    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.pedido.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Pedido removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 