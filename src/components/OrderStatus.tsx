'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Coffee, 
  Package, 
  Truck,
  RefreshCw
} from 'lucide-react';

type ItemPedido = {
  id: string;
  volume: number;
  quantidade: number;
  preco: number;
  drink: {
    id: string;
    nome: string;
    descricao?: string;
  };
};

type Pedido = {
  id: string;
  nomeCliente: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  itens: ItemPedido[];
};

interface OrderStatusProps {
  pedido: Pedido;
}

const STATUS_INFO = {
  aguardando_pagamento: {
    label: 'Aguardando Pagamento',
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Entregue a ficha correspondente ao atendente'
  },
  ficha_entregue: {
    label: 'Ficha Entregue',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Pagamento confirmado, pedido será preparado'
  },
  em_preparo: {
    label: 'Em Preparo',
    icon: Coffee,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Seu drink está sendo preparado'
  },
  pronto: {
    label: 'Pronto',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Seu pedido está pronto para retirada'
  },
  entregue: {
    label: 'Entregue',
    icon: Truck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Pedido finalizado com sucesso'
  }
};

export default function OrderStatus({ pedido: initialPedido }: OrderStatusProps) {
  const [pedido, setPedido] = useState(initialPedido);
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/status`);
      if (response.ok) {
        const updatedPedido = await response.json();
        setPedido(updatedPedido);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Atualizar status a cada 30 segundos
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [pedido.id]);

  const statusInfo = STATUS_INFO[pedido.status as keyof typeof STATUS_INFO];
  const Icon = statusInfo.icon;

  const getStatusSteps = () => {
    const steps = [
      'aguardando_pagamento',
      'ficha_entregue',
      'em_preparo',
      'pronto',
      'entregue'
    ];
    
    const currentIndex = steps.indexOf(pedido.status);
    return steps.map((step, index) => ({
      ...STATUS_INFO[step as keyof typeof STATUS_INFO],
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Informações do Pedido */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Pedido #{pedido.id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-gray-600">{pedido.nomeCliente}</p>
          </div>
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status Atual */}
        <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <p className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
              <p className="text-sm text-gray-600">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Linha do Tempo */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progresso do Pedido
          </h3>
          <div className="space-y-3">
            {getStatusSteps().map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className={`font-medium ${
                    step.isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {step.isCurrent && (
                    <span className="text-sm text-blue-600 font-medium">
                      (atual)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Itens do Pedido
        </h3>
        <div className="space-y-3">
          {pedido.itens.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="font-medium text-gray-900">{item.drink.nome}</span>
                <span className="text-sm text-gray-600 ml-2">({item.volume}ml)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">x{item.quantidade}</span>
                <span className="font-semibold text-gray-900">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                R$ {pedido.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações do Pedido
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Data do Pedido:</span>
            <span>{format(new Date(pedido.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between">
            <span>Última Atualização:</span>
            <span>{format(new Date(pedido.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between">
            <span>ID do Pedido:</span>
            <span className="font-mono">{pedido.id}</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="text-center space-y-4">
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Atualizando...' : 'Atualizar Status'}
        </button>
        
        <div>
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Fazer novo pedido
          </a>
        </div>
      </div>
    </div>
  );
} 