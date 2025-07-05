'use client';

import { useState, useEffect } from 'react';
import { Coffee, Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Volume = 300 | 500 | 700;
type Drink = {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  ativo: boolean;
  esgotado?: boolean;
  esgotando?: boolean;
  novidade?: boolean;
};

type PedidoItem = {
  drinkId: string;
  drinkNome: string;
  volume: Volume;
  quantidade: number;
  preco: number;
};

type PedidoHistorico = {
  id: string;
  nomeCliente: string;
  observacao?: string;
  total: number;
  status: string;
  createdAt: string;
  itens: {
    drinkNome: string;
    volume: number;
    quantidade: number;
    preco: number;
  }[];
};

const PRECOS: Record<Volume, number> = {
  300: 8,
  500: 12,
  700: 14,
};

const VOLUMES = [
  { value: 300 as Volume, label: '300ml', size: 'P' },
  { value: 500 as Volume, label: '500ml', size: 'M' },
  { value: 700 as Volume, label: '700ml', size: 'G' },
];

const STATUS_COLORS = {
  aguardando_pagamento: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ficha_entregue: 'bg-blue-100 text-blue-800 border-blue-300',
  em_preparo: 'bg-purple-100 text-purple-800 border-purple-300',
  pronto: 'bg-green-100 text-green-800 border-green-300',
  entregue: 'bg-gray-100 text-gray-800 border-gray-300'
} as Record<string, string>;

const STATUS_LABELS = {
  aguardando_pagamento: 'Aguardando Pagamento',
  ficha_entregue: 'Ficha Entregue',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue'
} as Record<string, string>;

export default function ClientOrderForm() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [pedidosHistorico, setPedidosHistorico] = useState<PedidoHistorico[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDrinks();
    loadHistorico();
  }, []);

  const loadHistorico = () => {
    try {
      const storedHistorico = localStorage.getItem('pedidos-historico');
      if (storedHistorico) {
        setPedidosHistorico(JSON.parse(storedHistorico));
      }
      
      const storedName = localStorage.getItem('ultimo-nome-cliente');
      if (storedName) {
        setNomeCliente(storedName);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveToHistorico = (pedidoData: any) => {
    try {
      const pedidoHistorico: PedidoHistorico = {
        id: pedidoData.id,
        nomeCliente: pedidoData.nomeCliente,
        observacao: pedidoData.observacao,
        total: pedidoData.total,
        status: pedidoData.status,
        createdAt: pedidoData.createdAt,
        itens: pedidoData.itens.map((item: any) => ({
          drinkNome: item.drink.nome,
          volume: item.volume,
          quantidade: item.quantidade,
          preco: item.preco
        }))
      };
      
      const newHistorico = [pedidoHistorico, ...pedidosHistorico.filter(p => p.id !== pedidoData.id)];
      
      // Manter apenas os últimos 10 pedidos
      const limitedHistorico = newHistorico.slice(0, 10);
      
      localStorage.setItem('pedidos-historico', JSON.stringify(limitedHistorico));
      localStorage.setItem('ultimo-nome-cliente', pedidoData.nomeCliente);
      
      setPedidosHistorico(limitedHistorico);
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const fetchDrinks = async () => {
    try {
      const response = await fetch('/api/drinks');
      const data = await response.json();
      setDrinks(data);
    } catch (error) {
      console.error('Erro ao buscar drinks:', error);
    }
  };

  const addItem = (drink: Drink, volume: Volume) => {
    const existingItem = itens.find(item => item.drinkId === drink.id && item.volume === volume);
    
    if (existingItem) {
      setItens(itens.map(item => 
        item.drinkId === drink.id && item.volume === volume
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setItens([...itens, {
        drinkId: drink.id,
        drinkNome: drink.nome,
        volume,
        quantidade: 1,
        preco: PRECOS[volume],
      }]);
    }
  };

  const removeItem = (drinkId: string, volume: Volume) => {
    const existingItem = itens.find(item => item.drinkId === drinkId && item.volume === volume);
    
    if (existingItem && existingItem.quantidade > 1) {
      setItens(itens.map(item => 
        item.drinkId === drinkId && item.volume === volume
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ));
    } else {
      setItens(itens.filter(item => !(item.drinkId === drinkId && item.volume === volume)));
    }
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCliente.trim() || itens.length === 0) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCliente: nomeCliente.trim(),
          observacao: observacao.trim() || null,
          itens,
        }),
      });

      if (response.ok) {
        const pedidoData = await response.json();
        saveToHistorico(pedidoData);
        setPedidoId(pedidoData.id);
        setSuccess(true);
        setObservacao('');
        setItens([]);
        setTimeout(() => {
          setSuccess(false);
          setPedidoId(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        if (errorData.unavailableDrinks) {
          const drinkNames = errorData.unavailableDrinks.map((drink: any) => drink.nome).join(', ');
          setErrorMessage(`Ops! Os seguintes drinks não estão mais disponíveis: ${drinkNames}. Por favor, remova-os do seu pedido.`);
          // Remover itens indisponíveis do carrinho
          const availableItems = itens.filter(item => 
            !errorData.unavailableDrinks.some((unavailable: any) => unavailable.id === item.drinkId)
          );
          setItens(availableItems);
        } else {
          setErrorMessage(errorData.error || 'Erro ao enviar pedido');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      setErrorMessage('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-modern p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Pedido Enviado com Sucesso!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Obrigado, <strong>{nomeCliente}</strong>! Seu pedido foi registrado.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800 font-semibold">
              Próximo passo: Entregue a ficha correspondente ao valor de <strong>R$ {calcularTotal().toFixed(2)}</strong> para o atendente!
            </p>
          </div>
          <div className="space-y-4">
            {pedidoId && (
              <a 
                href={`/pedido/${pedidoId}`}
                className="btn-secondary block"
              >
                Acompanhar Pedido
              </a>
            )}
            <button 
              className="btn-primary"
              onClick={() => setSuccess(false)}
            >
              Fazer Novo Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Histórico de Pedidos */}
      {pedidosHistorico.length > 0 && (
        <div className="card-modern p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Seus Últimos Pedidos</h3>
            <button
              type="button"
              onClick={() => setShowHistorico(!showHistorico)}
              className="btn-secondary text-sm"
            >
              {showHistorico ? 'Ocultar' : 'Mostrar'} Histórico
            </button>
          </div>
          
          {showHistorico && (
            <div className="space-y-3">
              {pedidosHistorico.map((pedido) => (
                <div key={pedido.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{pedido.nomeCliente}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(pedido.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[pedido.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[pedido.status] || pedido.status}
                      </span>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        R$ {pedido.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {pedido.itens.map((item, index) => (
                      <span key={index}>
                        {item.quantidade}x {item.drinkNome} ({item.volume}ml)
                        {index < pedido.itens.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  
                  {pedido.observacao && (
                    <p className="text-sm text-gray-600 italic">
                      Obs: {pedido.observacao}
                    </p>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/pedido/${pedido.id}`}
                      className="btn-secondary text-sm"
                    >
                      Acompanhar Pedido
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setNomeCliente(pedido.nomeCliente);
                        setObservacao(pedido.observacao || '');
                      }}
                      className="btn-primary text-sm"
                    >
                      Usar Dados
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Cliente */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Seu Nome</h3>
          </div>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Drinks Disponíveis */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Escolha seus Drinks</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drinks.filter(drink => drink.ativo).map((drink) => {
              const isEsgotado = drink.esgotado;
              const isEsgotando = drink.esgotando;
              const isNovidade = drink.novidade;
              
              return (
                <div key={drink.id} className={`border-2 rounded-lg p-4 transition-colors relative ${
                  isEsgotado 
                    ? 'border-red-200 bg-red-50' 
                    : isEsgotando
                      ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                      : isNovidade 
                        ? 'border-blue-300 bg-blue-50 hover:border-blue-400' 
                        : 'border-gray-200 hover:border-blue-300'
                }`}>
                  {/* Badge de Status */}
                  {isEsgotado && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-bold">
                      ESGOTADO
                    </div>
                  )}
                  {isEsgotando && !isEsgotado && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs rounded-full font-bold">
                      ESGOTANDO
                    </div>
                  )}
                  {isNovidade && !isEsgotado && !isEsgotando && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full font-bold animate-pulse">
                      NOVIDADE
                    </div>
                  )}
                  
                <div className="flex items-center gap-3 mb-3">
                    <Coffee className={`w-8 h-8 ${
                      isEsgotado ? 'text-red-400' : isEsgotando ? 'text-yellow-500' : isNovidade ? 'text-blue-500' : 'text-blue-500'
                    }`} />
                  <div>
                      <h4 className={`font-bold ${
                        isEsgotado ? 'text-red-600' : isEsgotando ? 'text-yellow-700' : isNovidade ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {drink.nome}
                        {isNovidade && !isEsgotado && !isEsgotando && (
                          <span className="ml-2 text-blue-500 text-sm">✨</span>
                        )}
                        {isEsgotando && !isEsgotado && (
                          <span className="ml-2 text-yellow-500 text-sm">⚠️</span>
                        )}
                      </h4>
                    {drink.descricao && (
                        <p className={`text-sm ${
                          isEsgotado ? 'text-red-500' : isEsgotando ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {drink.descricao}
                        </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {VOLUMES.map((volume) => (
                    <button
                      key={volume.value}
                      type="button"
                        onClick={() => !isEsgotado && addItem(drink, volume.value)}
                        disabled={isEsgotado}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors border-2 tablet-btn ${
                          isEsgotado
                            ? 'bg-red-100 border-red-200 text-red-400 cursor-not-allowed opacity-50'
                            : isEsgotando
                              ? 'bg-yellow-100 hover:bg-yellow-200 border-transparent hover:border-yellow-300 text-yellow-700'
                              : isNovidade
                                ? 'bg-blue-100 hover:bg-blue-200 border-transparent hover:border-blue-300 text-blue-700'
                                : 'bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-300'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isEsgotado
                            ? 'bg-red-200'
                            : isEsgotando
                              ? 'bg-yellow-200'
                              : isNovidade
                                ? 'bg-blue-200'
                                : 'bg-blue-100'
                        }`}>
                          <span className={`font-bold ${
                            isEsgotado
                              ? 'text-red-500'
                              : isEsgotando
                                ? 'text-yellow-700'
                                : isNovidade
                                  ? 'text-blue-700'
                                  : 'text-blue-600'
                          }`}>
                            {volume.size}
                          </span>
                      </div>
                      <span className="text-sm font-medium">{volume.label}</span>
                        <span className={`text-xs font-bold ${
                          isEsgotado
                            ? 'text-red-500'
                            : isEsgotando
                              ? 'text-yellow-700'
                              : isNovidade
                                ? 'text-blue-700'
                                : 'text-blue-600'
                        }`}>
                          {isEsgotado ? 'Esgotado' : `R$ ${PRECOS[volume.value]}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Observação */}
        {itens.length > 0 && (
          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Observação (opcional)</h3>
            </div>
            <div>
              <textarea
                placeholder="Ex: Sem essência de baunilha, menos açúcar, com gelo extra, etc."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {observacao.length}/200 caracteres
              </p>
            </div>
          </div>
        )}

        {/* Resumo do Pedido */}
        {itens.length > 0 && (
          <div className="card-modern p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Seu Pedido</h3>
            </div>
            
            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.drinkNome}</span>
                    <span className="text-sm text-gray-600 ml-2">({item.volume}ml)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.drinkId, item.volume)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantidade}</span>
                    <button
                      type="button"
                      onClick={() => addItem(drinks.find(d => d.id === item.drinkId)!, item.volume)}
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                  <div className="ml-4 font-bold text-blue-600">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="card-modern p-6 bg-red-50 border-2 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">Erro ao fazer pedido</h3>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Envio */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !nomeCliente.trim() || itens.length === 0}
            className="btn-primary text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Enviando...' : `Fazer Pedido - R$ ${calcularTotal().toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
} 