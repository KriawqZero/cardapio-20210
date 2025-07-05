'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Coffee, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

type Drink = {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  ativo: boolean;
  esgotado?: boolean;
  esgotando?: boolean;
  novidade?: boolean;
  createdAt: string;
  updatedAt: string;
};

type ItemPedido = {
  id: string;
  volume: number;
  quantidade: number;
  preco: number;
  drink: Drink;
};

type Pedido = {
  id: string;
  nomeCliente: string;
  observacao?: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  itens: ItemPedido[];
};

export default function BarmanDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  // Buscar pedidos do barman
  const fetchPedidos = async () => {
    try {
      const response = await fetch('/api/barman/pedidos');
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling a cada 2 segundos
  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 2000);
    return () => clearInterval(interval);
  }, []);

  // Marcar pedido como pronto
  const marcarComoPronto = async (pedidoId: string) => {
    setProcessando(true);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'pronto' }),
      });

      if (response.ok) {
        toast.success('Pedido marcado como pronto!', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "text-lg",
        });
        await fetchPedidos();
      } else {
        toast.error('Erro ao marcar pedido como pronto', {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Erro ao marcar como pronto:', error);
      toast.error('Erro ao marcar pedido como pronto', {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setProcessando(false);
    }
  };

  // Formatar itens do pedido
  const formatarItens = (itens: ItemPedido[]) => {
    return itens.map(item => 
      `${item.quantidade}x ${item.drink.nome} (${item.volume}ml)`
    ).join(', ');
  };

  // Obter primeiro pedido (atual)
  const pedidoAtual = pedidos.length > 0 ? pedidos[0] : null;
  // Obter segundo pedido (próximo)
  const proximoPedido = pedidos.length > 1 ? pedidos[1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-2xl">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white p-4 flex flex-col overflow-hidden">
      {/* Header - Altura fixa */}
      <div className="flex-shrink-0 text-center mb-4">
        <h1 className="text-4xl font-bold mb-2 text-blue-400">
          <Coffee className="inline w-10 h-10 mr-3" />
          Barman Dashboard
        </h1>
        <p className="text-lg text-gray-300">
          Fila de Preparo - {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} aguardando
        </p>
      </div>

      {/* Conteúdo Principal - Flex crescente */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Pedido Atual - Seção Principal */}
        <div className="lg:col-span-2 min-h-0">
          {pedidoAtual ? (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 h-full shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-3xl font-bold text-white">PEDIDO ATUAL</h2>
                <div className="text-right">
                  <div className="text-base text-blue-100">
                    Pedido #{pedidoAtual.id.slice(-6)}
                  </div>
                  <div className="text-sm text-blue-200">
                    {format(new Date(pedidoAtual.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="mb-4 flex-shrink-0">
                <h3 className="text-4xl font-bold text-white mb-2">
                  {pedidoAtual.nomeCliente}
                </h3>
                {pedidoAtual.observacao && (
                  <p className="text-lg text-blue-100 italic">
                    Obs: {pedidoAtual.observacao}
                  </p>
                )}
              </div>

              {/* Itens do Pedido - Flex crescente com scroll */}
              <div className="flex-1 overflow-y-auto mb-4">
                <h4 className="text-2xl font-semibold mb-3 text-blue-100">Drinks:</h4>
                <div className="space-y-3">
                  {pedidoAtual.itens.map((item) => (
                    <div key={item.id} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-2xl font-bold text-white">
                            {item.quantidade}x {item.drink.nome}
                          </h5>
                          <p className="text-lg text-blue-100">
                            Volume: {item.volume}ml
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">
                            R$ {item.preco.toFixed(2)}
                          </p>
                          <p className="text-sm text-blue-100">
                            Unit: R$ {(item.preco / item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mb-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">TOTAL:</span>
                  <span className="text-3xl font-bold text-white">
                    R$ {pedidoAtual.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botão PRONTO */}
              <button
                onClick={() => marcarComoPronto(pedidoAtual.id)}
                disabled={processando}
                className={`w-full py-4 rounded-2xl text-3xl font-bold transition-all duration-200 flex-shrink-0 ${
                  processando
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:scale-95 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {processando ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                    PROCESSANDO...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 mr-3" />
                    PRONTO
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-3xl p-6 h-full flex flex-col justify-center items-center shadow-2xl">
              <Coffee className="w-20 h-20 text-gray-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-400 mb-3">Nenhum Pedido na Fila</h2>
              <p className="text-lg text-gray-500">Aguardando novos pedidos...</p>
            </div>
          )}
        </div>

        {/* Próximo da Fila */}
        <div className="lg:col-span-1 min-h-0">
          {proximoPedido ? (
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl p-4 h-full shadow-2xl flex flex-col">
              <div className="flex items-center mb-4 flex-shrink-0">
                <Clock className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-xl font-bold text-white">PRÓXIMO NA FILA</h3>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {proximoPedido.nomeCliente}
                  </h4>
                  <p className="text-sm text-gray-300">
                    Pedido #{proximoPedido.id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-300">
                    {format(new Date(proximoPedido.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-gray-300 mb-3">Drinks:</h5>
                  <div className="space-y-2">
                    {proximoPedido.itens.map((item) => (
                      <div key={item.id} className="bg-white/5 rounded-xl p-3">
                        <p className="text-base font-medium text-white">
                          {item.quantidade}x {item.drink.nome}
                        </p>
                        <p className="text-sm text-gray-400">
                          {item.volume}ml - R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-300">Total:</span>
                    <span className="text-lg font-bold text-white">
                      R$ {proximoPedido.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-3xl p-4 h-full flex flex-col justify-center items-center shadow-2xl">
              <Clock className="w-12 h-12 text-gray-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Sem Próximo Pedido</h3>
              <p className="text-base text-gray-500 text-center">
                Aguardando mais pedidos na fila...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Altura fixa */}
      <div className="flex-shrink-0 text-center mt-4">
        <p className="text-gray-400 text-sm">
          Última atualização: {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
        </p>
      </div>
    </div>
  );
} 