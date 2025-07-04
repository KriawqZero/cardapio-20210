'use client';

import { useState, useEffect } from 'react';
import { Coffee, Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react';

type Volume = 300 | 500 | 700;
type Drink = {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  ativo: boolean;
};

type PedidoItem = {
  drinkId: string;
  drinkNome: string;
  volume: Volume;
  quantidade: number;
  preco: number;
};

const PRECOS: Record<Volume, number> = {
  300: 8,
  500: 10,
  700: 14,
};

const VOLUMES = [
  { value: 300 as Volume, label: '300ml', size: 'P' },
  { value: 500 as Volume, label: '500ml', size: 'M' },
  { value: 700 as Volume, label: '700ml', size: 'G' },
];

export default function ClientOrderForm() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrinks();
  }, []);

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
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCliente: nomeCliente.trim(),
          itens,
        }),
      });

      if (response.ok) {
        const pedidoData = await response.json();
        setPedidoId(pedidoData.id);
        setSuccess(true);
        setNomeCliente('');
        setItens([]);
        setTimeout(() => {
          setSuccess(false);
          setPedidoId(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
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
            {drinks.map((drink) => (
              <div key={drink.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Coffee className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-bold text-gray-800">{drink.nome}</h4>
                    {drink.descricao && (
                      <p className="text-sm text-gray-600">{drink.descricao}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {VOLUMES.map((volume) => (
                    <button
                      key={volume.value}
                      type="button"
                      onClick={() => addItem(drink, volume.value)}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border-2 border-transparent hover:border-blue-300 tablet-btn"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{volume.size}</span>
                      </div>
                      <span className="text-sm font-medium">{volume.label}</span>
                      <span className="text-xs text-blue-600 font-bold">
                        R$ {PRECOS[volume.value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

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