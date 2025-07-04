'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  Coffee, 
  Package, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Drink = {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  ativo: boolean;
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
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  itens: ItemPedido[];
};

const STATUS_COLORS = {
  aguardando_pagamento: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ficha_entregue: 'bg-blue-100 text-blue-800 border-blue-300',
  em_preparo: 'bg-purple-100 text-purple-800 border-purple-300',
  pronto: 'bg-green-100 text-green-800 border-green-300',
  entregue: 'bg-gray-100 text-gray-800 border-gray-300'
};

const STATUS_LABELS = {
  aguardando_pagamento: 'Aguardando Pagamento',
  ficha_entregue: 'Ficha Entregue',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue'
};

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pedidos' | 'drinks' | 'relatorios'>('pedidos');
  const [newDrink, setNewDrink] = useState({ nome: '', descricao: '' });
  const [showAddDrink, setShowAddDrink] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [pedidosRes, drinksRes] = await Promise.all([
        fetch('/api/pedidos'),
        fetch('/api/drinks')
      ]);
      
      const pedidosData = await pedidosRes.json();
      const drinksData = await drinksRes.json();
      
      setPedidos(pedidosData);
      setDrinks(drinksData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (pedidoId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const addDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrink.nome.trim()) return;

    try {
      const response = await fetch('/api/drinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDrink),
      });

      if (response.ok) {
        setNewDrink({ nome: '', descricao: '' });
        setShowAddDrink(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Erro ao adicionar drink:', error);
    }
  };

  const filteredPedidos = pedidos.filter(pedido =>
    pedido.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStats = () => {
    const stats = pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const getTotalRevenue = () => {
    return pedidos
      .filter(p => p.status === 'entregue')
      .reduce((sum, pedido) => sum + pedido.total, 0);
  };

  const getDrinkStats = () => {
    const drinkCount = {} as Record<string, number>;
    const volumeCount = {} as Record<number, number>;
    
    pedidos.forEach(pedido => {
      pedido.itens.forEach(item => {
        drinkCount[item.drink.nome] = (drinkCount[item.drink.nome] || 0) + item.quantidade;
        volumeCount[item.volume] = (volumeCount[item.volume] || 0) + item.quantidade;
      });
    });
    
    return { drinkCount, volumeCount };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="card-modern">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pedidos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('drinks')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'drinks' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Drinks
          </button>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'relatorios' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Relatórios
          </button>
        </div>
      </div>

      {/* Conteúdo dos Tabs */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {/* Busca */}
          <div className="card-modern p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {filteredPedidos.length === 0 ? (
              <div className="card-modern p-8 text-center">
                <Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'Nenhum pedido encontrado' : 'Nenhum pedido ainda'}
                </p>
              </div>
            ) : (
              filteredPedidos.map((pedido) => (
                <div key={pedido.id} className="card-modern p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {pedido.nomeCliente}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {format(new Date(pedido.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        R$ {pedido.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[pedido.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Itens:</h4>
                    <div className="space-y-2">
                      {pedido.itens.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{item.drink.nome}</span>
                          <span className="text-sm text-gray-600">{item.volume}ml</span>
                          <span className="text-sm text-gray-600">x{item.quantidade}</span>
                          <span className="font-bold text-blue-600">
                            R$ {(item.preco * item.quantidade).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Status */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(pedido.id, status)}
                        disabled={pedido.status === status}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pedido.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'drinks' && (
        <div className="space-y-6">
          {/* Adicionar Drink */}
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Gerenciar Drinks</h3>
              <button
                onClick={() => setShowAddDrink(!showAddDrink)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Drink
              </button>
            </div>

            {showAddDrink && (
              <form onSubmit={addDrink} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Drink
                  </label>
                  <input
                    type="text"
                    value={newDrink.nome}
                    onChange={(e) => setNewDrink({...newDrink, nome: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newDrink.descricao}
                    onChange={(e) => setNewDrink({...newDrink, descricao: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDrink(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Drinks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {drinks.map((drink) => (
                <div key={drink.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{drink.nome}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      drink.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {drink.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {drink.descricao && (
                    <p className="text-sm text-gray-600 mb-2">{drink.descricao}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    Criado em {format(new Date(drink.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-modern p-6 text-center">
              <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{pedidos.length}</p>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
            </div>
            <div className="card-modern p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">R$ {getTotalRevenue().toFixed(2)}</p>
              <p className="text-sm text-gray-600">Receita Total</p>
            </div>
            <div className="card-modern p-6 text-center">
              <Coffee className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{drinks.length}</p>
              <p className="text-sm text-gray-600">Drinks Cadastrados</p>
            </div>
            <div className="card-modern p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {pedidos.filter(p => p.status === 'entregue').length}
              </p>
              <p className="text-sm text-gray-600">Pedidos Entregues</p>
            </div>
          </div>

          {/* Status dos Pedidos */}
          <div className="card-modern p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Status dos Pedidos</h3>
            <div className="space-y-3">
              {Object.entries(getStatusStats()).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                  </span>
                  <span className="font-bold text-lg text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drinks Mais Pedidos */}
          <div className="card-modern p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Drinks Mais Pedidos</h3>
            <div className="space-y-3">
              {Object.entries(getDrinkStats().drinkCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([drink, count]) => (
                  <div key={drink} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{drink}</span>
                    <span className="font-bold text-lg text-orange-600">{count} unidades</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Volumes Mais Pedidos */}
          <div className="card-modern p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Volumes Mais Pedidos</h3>
            <div className="space-y-3">
              {Object.entries(getDrinkStats().volumeCount)
                .sort(([,a], [,b]) => b - a)
                .map(([volume, count]) => (
                  <div key={volume} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{volume}ml</span>
                    <span className="font-bold text-lg text-purple-600">{count} unidades</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 