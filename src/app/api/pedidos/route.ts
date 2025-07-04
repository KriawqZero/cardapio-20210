import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nomeCliente, itens } = await request.json();
    
    if (!nomeCliente?.trim()) {
      return NextResponse.json(
        { error: 'Nome do cliente é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: 'Itens do pedido são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Calcular total
    const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    // Criar pedido com itens
    const pedido = await prisma.pedido.create({
      data: {
        nomeCliente: nomeCliente.trim(),
        total,
        status: 'aguardando_pagamento',
        itens: {
          create: itens.map(item => ({
            drinkId: item.drinkId,
            volume: item.volume,
            quantidade: item.quantidade,
            preco: item.preco
          }))
        }
      },
      include: {
        itens: {
          include: {
            drink: true
          }
        }
      }
    });
    
    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 