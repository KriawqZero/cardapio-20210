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
    const { nomeCliente, observacao, itens } = await request.json();
    
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
    
    // Verificar se todos os drinks estão disponíveis
    const drinkIds = [...new Set(itens.map(item => item.drinkId))];
    const drinks = await prisma.drink.findMany({
      where: {
        id: {
          in: drinkIds
        }
      }
    });
    
    // Verificar se algum drink está esgotado ou inativo
    const unavailableDrinks = drinks.filter(drink => !drink.ativo || drink.esgotado);
    if (unavailableDrinks.length > 0) {
      return NextResponse.json(
        { 
          error: 'Alguns drinks não estão disponíveis',
          unavailableDrinks: unavailableDrinks.map(drink => ({
            id: drink.id,
            nome: drink.nome,
            reason: !drink.ativo ? 'inativo' : 'esgotado'
          }))
        },
        { status: 400 }
      );
    }
    
    // Calcular total
    const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    // Criar pedido com itens
    const pedido = await prisma.pedido.create({
      data: {
        nomeCliente: nomeCliente.trim(),
        observacao: observacao?.trim() || null,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id }
    });
    
    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }
    
    // Deletar o pedido (os itens serão deletados automaticamente devido ao onDelete: Cascade)
    await prisma.pedido.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 