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
  DollarSign,
  Filter,
  Bell,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Minus,
  X
} from 'lucide-react';
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
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  itens: ItemPedido[];
};

type Volume = 300 | 500 | 700;

type PedidoItem = {
  drinkId: string;
  drinkNome: string;
  volume: Volume;
  quantidade: number;
  preco: number;
};

type SortField = 'createdAt' | 'nomeCliente' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

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

const SORT_LABELS = {
  createdAt: 'Data',
  nomeCliente: 'Nome do Cliente',
  total: 'Valor Total',
  status: 'Status'
};

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pedidos' | 'drinks' | 'relatorios' | 'criar-pedido'>('pedidos');
  const [newDrink, setNewDrink] = useState({ nome: '', descricao: '' });
  const [showAddDrink, setShowAddDrink] = useState(false);
  
  // Estados para notificações
  const [lastOrderIds, setLastOrderIds] = useState<string[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  
  // Estados para ordenação
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para criar pedido (admin)
  const [nomeCliente, setNomeCliente] = useState('');
  const [itensNovoPedido, setItensNovoPedido] = useState<PedidoItem[]>([]);
  const [loadingNovoPedido, setLoadingNovoPedido] = useState(false);
  const [successNovoPedido, setSuccessNovoPedido] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Inicializar IDs na primeira busca e detectar novos pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      const currentIds = pedidos.map(p => p.id);
      
      // Se é a primeira vez carregando os dados
      if (lastOrderIds.length === 0) {
        setLastOrderIds(currentIds);
      } else {
        // Verificar se há novos pedidos
        const newIds = currentIds.filter(id => !lastOrderIds.includes(id));
        if (newIds.length > 0) {
          // Definir os IDs dos novos pedidos para o efeito de brilho
          setNewOrderIds(newIds);
          
          // Mostrar toast de notificação personalizado
          const newOrdersCount = newIds.length;
          
          // Buscar detalhes dos novos pedidos
          const novosPedidos = pedidos.filter(p => newIds.includes(p.id));
          const nomesClientes = novosPedidos.map(p => p.nomeCliente).join(', ');
          
          // Toast customizado
          const CustomToast = ({ closeToast }: { closeToast?: () => void }) => (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-bold text-lg text-green-800">
                  Novo{newOrdersCount > 1 ? 's' : ''} Pedido{newOrdersCount > 1 ? 's' : ''}!
                </div>
                <div className="text-sm text-green-700">
                  {newOrdersCount === 1 
                    ? `Pedido de ${nomesClientes}` 
                    : `${newOrdersCount} pedidos: ${nomesClientes.length > 50 ? nomesClientes.substring(0, 50) + '...' : nomesClientes}`
                  }
                </div>
              </div>
            </div>
          );
          
          toast.success(<CustomToast />, {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "bg-green-50 border-green-200 border-2",
            progressClassName: "bg-green-500"
          });
          
          // Remover o brilho após 10 segundos
          setTimeout(() => {
            setNewOrderIds([]);
          }, 10000);
        }
        setLastOrderIds(currentIds);
      }
    }
  }, [pedidos]);

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
        body: JSON.stringify({
          ...newDrink,
          novidade: true, // Drinks novos são marcados como novidade
        }),
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

  const updateDrinkStatus = async (drinkId: string, field: 'ativo' | 'esgotado' | 'esgotando' | 'novidade', value: boolean) => {
    try {
      const response = await fetch('/api/drinks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: drinkId,
          [field]: value,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do drink:', error);
    }
  };

  // Funções para ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Funções para criar pedido (admin)
  const addItemNovoPedido = (drink: Drink, volume: Volume) => {
    const existingItem = itensNovoPedido.find(item => item.drinkId === drink.id && item.volume === volume);
    
    if (existingItem) {
      setItensNovoPedido(itensNovoPedido.map(item => 
        item.drinkId === drink.id && item.volume === volume
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setItensNovoPedido([...itensNovoPedido, {
        drinkId: drink.id,
        drinkNome: drink.nome,
        volume,
        quantidade: 1,
        preco: PRECOS[volume],
      }]);
    }
  };

  const removeItemNovoPedido = (drinkId: string, volume: Volume) => {
    const existingItem = itensNovoPedido.find(item => item.drinkId === drinkId && item.volume === volume);
    
    if (existingItem && existingItem.quantidade > 1) {
      setItensNovoPedido(itensNovoPedido.map(item => 
        item.drinkId === drinkId && item.volume === volume
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ));
    } else {
      setItensNovoPedido(itensNovoPedido.filter(item => !(item.drinkId === drinkId && item.volume === volume)));
    }
  };

  const calcularTotalNovoPedido = () => {
    return itensNovoPedido.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const handleSubmitNovoPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCliente.trim() || itensNovoPedido.length === 0) return;

    setLoadingNovoPedido(true);
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCliente: nomeCliente.trim(),
          itens: itensNovoPedido,
        }),
      });

      if (response.ok) {
        setSuccessNovoPedido(true);
        setNomeCliente('');
        setItensNovoPedido([]);
        await fetchData();
        setTimeout(() => {
          setSuccessNovoPedido(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    } finally {
      setLoadingNovoPedido(false);
    }
  };

  const filteredPedidos = pedidos
    .filter(pedido => {
      const matchesSearch = pedido.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || pedido.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Converter datas para timestamp para comparação
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Comparação
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Lógica de paginação
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = filteredPedidos.slice(startIndex, endIndex);

  // Resetar página atual quando filtros mudam
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Resetar para primeira página
  };

  // Resetar página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortField, sortDirection]);

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
          <button
            onClick={() => setActiveTab('criar-pedido')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'criar-pedido' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Criar Pedido
          </button>
          
          
        </div>
      </div>

      {/* Conteúdo dos Tabs */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="card-modern p-4 space-y-4">
            {/* Busca */}
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

            {/* Filtro por Status */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos ({pedidos.length})
                </button>
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  const count = pedidos.filter(p => p.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SORT_LABELS).map(([field, label]) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field as SortField)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      sortField === field
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {sortField === field && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-3 h-3" /> : 
                        <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controles de Paginação */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPedidos.length)} de {filteredPedidos.length} pedidos
                  {filteredPedidos.length < pedidos.length && ` (${pedidos.length} total)`}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Limpar filtros
                  </button>
                )}
                
                {/* Navegação de páginas */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Próxima →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {              currentPedidos.length === 0 ? (
                <div className="card-modern p-8 text-center">
                  <Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Nenhum pedido encontrado com os filtros aplicados' 
                      : 'Nenhum pedido ainda'
                    }
                  </p>
                </div>
              ) : (
              currentPedidos.map((pedido) => {
                // Verificar se é um pedido novo baseado no ID
                const isNewOrder = newOrderIds.includes(pedido.id);
                
                return (
                <div key={pedido.id} className={`card-modern p-6 transition-all duration-1000 ${
                  isNewOrder ? 'new-order-glow pulse-glow' : ''
                }`}>
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
                );
              })
            )}
            
            {/* Controles de Paginação Inferior */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima →
                </button>
              </div>
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
                <div key={drink.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{drink.nome}</h4>
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        drink.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {drink.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      {drink.esgotado && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Esgotado
                        </span>
                      )}
                      {drink.esgotando && !drink.esgotado && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Esgotando
                        </span>
                      )}
                      {drink.novidade && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Novidade
                        </span>
                      )}
                    </div>
                  </div>
                  {drink.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{drink.descricao}</p>
                  )}
                  
                  {/* Controles de Status */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Ativo:</span>
                      <button
                        onClick={() => updateDrinkStatus(drink.id, 'ativo', !drink.ativo)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          drink.ativo
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {drink.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Esgotado:</span>
                      <button
                        onClick={() => updateDrinkStatus(drink.id, 'esgotado', !drink.esgotado)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          drink.esgotado
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {drink.esgotado ? 'Esgotado' : 'Disponível'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Esgotando:</span>
                      <button
                        onClick={() => updateDrinkStatus(drink.id, 'esgotando', !drink.esgotando)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          drink.esgotando
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {drink.esgotando ? 'Esgotando' : 'Normal'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Novidade:</span>
                      <button
                        onClick={() => updateDrinkStatus(drink.id, 'novidade', !drink.novidade)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          drink.novidade
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {drink.novidade ? 'Novidade' : 'Normal'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-2">
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

      {activeTab === 'criar-pedido' && (
        <div className="space-y-6">
          {successNovoPedido && (
            <div className="card-modern p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-800">Pedido criado com sucesso!</h3>
                  <p className="text-green-700">O pedido foi registrado no sistema.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitNovoPedido} className="space-y-6">
            {/* Nome do Cliente */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Nome do Cliente</h3>
              </div>
              <input
                type="text"
                placeholder="Digite o nome completo do cliente"
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
                <h3 className="text-xl font-bold text-gray-800">Escolha os Drinks</h3>
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
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full font-bold">
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
                            onClick={() => !isEsgotado && addItemNovoPedido(drink, volume.value)}
                            disabled={isEsgotado}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors border-2 ${
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

            {/* Resumo do Pedido */}
            {itensNovoPedido.length > 0 && (
              <div className="card-modern p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Itens do Pedido</h3>
                </div>
                
                <div className="space-y-3">
                  {itensNovoPedido.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{item.drinkNome}</span>
                        <span className="text-sm text-gray-600 ml-2">({item.volume}ml)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeItemNovoPedido(item.drinkId, item.volume)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-red-600" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => addItemNovoPedido(drinks.find(d => d.id === item.drinkId)!, item.volume)}
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
                        R$ {calcularTotalNovoPedido().toFixed(2)}
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
                disabled={loadingNovoPedido || !nomeCliente.trim() || itensNovoPedido.length === 0}
                className="btn-primary text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loadingNovoPedido ? 'Criando...' : `Criar Pedido - R$ ${calcularTotalNovoPedido().toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}