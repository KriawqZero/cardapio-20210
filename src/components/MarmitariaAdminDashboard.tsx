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
  X,
  ChefHat,
  Star,
  Award,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  Settings,
  Utensils
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

type Categoria = {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativa: boolean;
  visivel: boolean;
  createdAt: string;
  updatedAt: string;
  itens?: ItemCardapio[];
};

type ItemCardapio = {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  ativo: boolean;
  disponivel: boolean;
  destaque: boolean;
  sugestaoChef: boolean;
  categoriaId: string;
  categoria: Categoria;
  createdAt: string;
  updatedAt: string;
};

type ItemPedido = {
  id: string;
  quantidade: number;
  preco: number;
  observacao?: string;
  itemCardapio: ItemCardapio;
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

type SortField = 'createdAt' | 'nomeCliente' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

const STATUS_COLORS = {
  novo: 'bg-blue-100 text-blue-800 border-blue-300',
  em_preparo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pronto: 'bg-green-100 text-green-800 border-green-300',
  entregue: 'bg-gray-100 text-gray-800 border-gray-300'
};

const STATUS_LABELS = {
  novo: 'Novo',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue'
};

const SORT_LABELS = {
  createdAt: 'Data',
  nomeCliente: 'Nome do Cliente',
  total: 'Valor Total',
  status: 'Status'
};

function MarmitariaAdminDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [itensCardapio, setItensCardapio] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pedidos' | 'cardapio' | 'categorias' | 'relatorios'>('dashboard');
  
  // Estados para ordenação
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para modais
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemCardapio | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  
  // Estados para formulários
  const [novoItem, setNovoItem] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoriaId: '',
    imagem: '',
    destaque: false,
    sugestaoChef: false,
  });
  const [loadingItem, setLoadingItem] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Estados para notificações
  const [lastOrderIds, setLastOrderIds] = useState<string[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Detectar novos pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      const currentIds = pedidos.map(p => p.id);
      
      if (lastOrderIds.length === 0) {
        setLastOrderIds(currentIds);
        return;
      }
      
      const newIds = currentIds.filter(id => !lastOrderIds.includes(id));
      if (newIds.length > 0) {
        setNewOrderIds(newIds);
        
        const novosPedidos = pedidos.filter(p => newIds.includes(p.id));
        const nomesClientes = novosPedidos.map(p => p.nomeCliente).join(', ');
        
        toast.success(`🆕 Novo${newIds.length > 1 ? 's' : ''} pedido${newIds.length > 1 ? 's' : ''}: ${nomesClientes}`, {
          position: "top-right",
          autoClose: 8000,
        });
        
        setTimeout(() => setNewOrderIds([]), 10000);
        setLastOrderIds(currentIds);
      }
    }
  }, [pedidos]);

  const fetchData = async () => {
    try {
      const [pedidosRes, categoriasRes, itensRes] = await Promise.all([
        fetch('/api/pedidos'),
        fetch('/api/categorias?incluirInativas=true'),
        fetch('/api/cardapio?incluirInativos=true')
      ]);
      
      const pedidosData = await pedidosRes.json();
      const categoriasData = await categoriasRes.json();
      const itensData = await itensRes.json();
      
      setPedidos(pedidosData);
      setCategorias(categoriasData);
      setItensCardapio(itensData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (pedidoId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchData();
        toast.success('Status atualizado!');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteOrder = async (pedidoId: string, nomeCliente: string) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar o pedido de ${nomeCliente}?`
    );
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/pedidos?id=${pedidoId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Pedido deletado!');
        await fetchData();
      }
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      toast.error('Erro ao deletar pedido');
    }
  };

  const toggleCategoriaVisibilidade = async (categoriaId: string, visivel: boolean) => {
    try {
      const response = await fetch('/api/categorias', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: categoriaId,
          visivel: !visivel,
        }),
      });

      if (response.ok) {
        await fetchData();
        toast.success(`Categoria ${!visivel ? 'ativada' : 'desativada'}!`);
      }
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast.error('Erro ao alterar visibilidade');
    }
  };

  // Funções para gerenciar itens do cardápio
  const handleAddItem = () => {
    setNovoItem({
      nome: '',
      descricao: '',
      preco: '',
      categoriaId: '',
      imagem: '',
      destaque: false,
      sugestaoChef: false,
    });
    setEditingItem(null);
    setPreviewImage(null);
    setShowAddItem(true);
  };

  const handleEditItem = (item: ItemCardapio) => {
    setNovoItem({
      nome: item.nome,
      descricao: item.descricao || '',
      preco: item.preco.toString(),
      categoriaId: item.categoriaId,
      imagem: item.imagem || '',
      destaque: item.destaque,
      sugestaoChef: item.sugestaoChef,
    });
    setEditingItem(item);
    setPreviewImage(item.imagem || null);
    setShowAddItem(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setNovoItem({...novoItem, imagem: data.url});
        setPreviewImage(data.url);
        toast.success('Imagem enviada com sucesso!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async () => {
    if (!novoItem.nome.trim() || !novoItem.preco || !novoItem.categoriaId) {
      toast.error('Nome, preço e categoria são obrigatórios');
      return;
    }

    setLoadingItem(true);
    try {
      const itemData = {
        nome: novoItem.nome.trim(),
        descricao: novoItem.descricao.trim() || null,
        preco: parseFloat(novoItem.preco),
        categoriaId: novoItem.categoriaId,
        imagem: novoItem.imagem || null,
        destaque: novoItem.destaque,
        sugestaoChef: novoItem.sugestaoChef,
      };

      const url = editingItem ? '/api/cardapio' : '/api/cardapio';
      const method = editingItem ? 'PATCH' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...itemData } : itemData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`Item ${editingItem ? 'atualizado' : 'criado'} com sucesso!`);
        setShowAddItem(false);
        await fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao salvar item');
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.error('Erro ao salvar item');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleDeleteItem = async (item: ItemCardapio) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja deletar "${item.nome}"?`
    );
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/cardapio?id=${item.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Item removido com sucesso!');
        await fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao deletar item');
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast.error('Erro ao deletar item');
    }
  };

  const toggleItemStatus = async (itemId: string, field: 'ativo' | 'disponivel' | 'destaque' | 'sugestaoChef', value: boolean) => {
    try {
      const response = await fetch('/api/cardapio', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          [field]: value,
        }),
      });

      if (response.ok) {
        await fetchData();
        toast.success('Status atualizado!');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredPedidos = pedidos
    .filter(pedido => {
      const matchesSearch = pedido.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && pedido.status !== 'entregue') || 
                           pedido.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
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

  const getTodayOrders = () => {
    const today = new Date().toDateString();
    return pedidos.filter(pedido => 
      new Date(pedido.createdAt).toDateString() === today
    ).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-container space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Utensils className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Painel da Marmitaria
                </h1>
                <p className="text-gray-600">
                  Sistema de gestão profissional
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4">
        <div className="card-modern">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
              { id: 'cardapio', label: 'Cardápio', icon: ChefHat },
              { id: 'categorias', label: 'Categorias', icon: Package },
              { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="container mx-auto px-4 space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-modern p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{getTodayOrders()}</p>
              <p className="text-sm text-gray-600">Pedidos Hoje</p>
            </div>
            
            <div className="card-modern p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">R$ {getTotalRevenue().toFixed(2)}</p>
              <p className="text-sm text-gray-600">Receita Total</p>
            </div>
            
            <div className="card-modern p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{itensCardapio.length}</p>
              <p className="text-sm text-gray-600">Itens no Cardápio</p>
            </div>
            
            <div className="card-modern p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{categorias.length}</p>
              <p className="text-sm text-gray-600">Categorias</p>
            </div>
          </div>

          {/* Kanban de Pedidos */}
          <div className="card-modern p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Pedidos por Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const pedidosStatus = pedidos.filter(p => p.status === status);
                return (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700">{label}</h4>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {pedidosStatus.length}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pedidosStatus.slice(0, 5).map((pedido) => (
                        <div key={pedido.id} className="bg-white p-3 rounded-lg shadow-sm border">
                          <h5 className="font-medium text-gray-800 text-sm">{pedido.nomeCliente}</h5>
                          <p className="text-xs text-gray-600 mb-2">
                            {format(new Date(pedido.createdAt), 'HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-sm font-bold text-orange-600">
                            R$ {pedido.total.toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {pedidosStatus.length > 5 && (
                        <div className="text-center">
                          <button 
                            onClick={() => setActiveTab('pedidos')}
                            className="text-orange-600 text-xs hover:underline"
                          >
                            Ver todos ({pedidosStatus.length})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pedidos Tab */}
      {activeTab === 'pedidos' && (
        <div className="container mx-auto px-4 space-y-6">
          {/* Filtros */}
          <div className="card-modern p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ativos ({pedidos.filter(p => p.status !== 'entregue').length})
                </button>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-orange-600 text-white'
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
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {currentPedidos.length === 0 ? (
              <div className="card-modern p-8 text-center">
                <Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchTerm || statusFilter !== 'active' 
                    ? 'Nenhum pedido encontrado' 
                    : 'Nenhum pedido ativo'
                  }
                </p>
              </div>
            ) : (
              currentPedidos.map((pedido) => {
                const isNewOrder = newOrderIds.includes(pedido.id);
                
                return (
                  <div 
                    key={pedido.id} 
                    className={`card-modern p-6 transition-all duration-1000 ${
                      isNewOrder ? 'new-order-glow pulse-glow' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {pedido.nomeCliente}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {format(new Date(pedido.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          R$ {pedido.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[pedido.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS[pedido.status as keyof typeof STATUS_LABELS]}
                        </span>
                        <button
                          onClick={() => deleteOrder(pedido.id, pedido.nomeCliente)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {pedido.observacao && (
                      <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-1">Observação:</h4>
                        <p className="text-yellow-700">{pedido.observacao}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Itens:</h4>
                      <div className="space-y-2">
                        {pedido.itens.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{item.itemCardapio?.nome || 'Item removido'}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({item.itemCardapio?.categoria?.nome || 'Categoria não informada'})
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">x{item.quantidade}</span>
                            <span className="font-bold text-orange-600">
                              R$ {(item.preco * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(pedido.id, status)}
                          disabled={pedido.status === status}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            pedido.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50'
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
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                ← Anterior
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Categorias Tab */}
      {activeTab === 'categorias' && (
        <div className="container mx-auto px-4 space-y-6">
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Gerenciar Categorias</h3>
              <button
                onClick={() => setShowAddCategoria(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{categoria.nome}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCategoriaVisibilidade(categoria.id, categoria.visivel)}
                        className={`p-2 rounded-lg transition-colors ${
                          categoria.visivel 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={categoria.visivel ? 'Visível no cardápio' : 'Oculta do cardápio'}
                      >
                        {categoria.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {categoria.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{categoria.descricao}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Ordem: {categoria.ordem}</span>
                    <span>{categoria.itens?.length || 0} itens</span>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      categoria.visivel ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {categoria.visivel ? 'Visível' : 'Oculta'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cardápio Tab */}
      {activeTab === 'cardapio' && (
        <div className="container mx-auto px-4 space-y-6">
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Gerenciar Cardápio</h3>
              <button
                onClick={handleAddItem}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novo Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itensCardapio.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Imagem do produto */}
                  <div className="h-48 bg-gray-100 relative">
                    {item.imagem ? (
                      <img 
                        src={item.imagem} 
                        alt={item.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback para ícone se a imagem não carregar
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${item.imagem ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gray-100`}>
                      <ChefHat className="w-16 h-16 text-gray-400" />
                    </div>
                    
                    {/* Badges sobre a imagem */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {item.destaque && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </span>
                      )}
                      {item.sugestaoChef && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          Chef
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800">{item.nome}</h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{item.categoria?.nome || 'Sem categoria'}</p>
                  
                  {item.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{item.descricao}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-orange-600">
                      R$ {item.preco.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.disponivel ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                    {item.destaque && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Destaque
                      </span>
                    )}
                    {item.sugestaoChef && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Chef
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      title="Deletar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Controles de Status */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Ativo:</span>
                      <button
                        onClick={() => toggleItemStatus(item.id, 'ativo', !item.ativo)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.ativo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.ativo ? 'Sim' : 'Não'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Disponível:</span>
                      <button
                        onClick={() => toggleItemStatus(item.id, 'disponivel', !item.disponivel)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.disponivel
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {item.disponivel ? 'Sim' : 'Não'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Destaque:</span>
                      <button
                        onClick={() => toggleItemStatus(item.id, 'destaque', !item.destaque)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.destaque
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.destaque ? 'Sim' : 'Não'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Sugestão Chef:</span>
                      <button
                        onClick={() => toggleItemStatus(item.id, 'sugestaoChef', !item.sugestaoChef)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.sugestaoChef
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.sugestaoChef ? 'Sim' : 'Não'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div className="container mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status dos Pedidos */}
            <div className="card-modern p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Status dos Pedidos</h3>
              <div className="space-y-3">
                {Object.entries(getStatusStats()).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span className="font-bold text-lg text-orange-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="card-modern p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo Financeiro</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Receita Total</span>
                  <span className="font-bold text-lg text-green-600">
                    R$ {getTotalRevenue().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Pedidos Hoje</span>
                  <span className="font-bold text-lg text-blue-600">
                    {getTodayOrders()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">Ticket Médio</span>
                  <span className="font-bold text-lg text-orange-600">
                    R$ {pedidos.length > 0 ? (getTotalRevenue() / pedidos.filter(p => p.status === 'entregue').length || 0).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar/Editar Item */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Item *
                  </label>
                  <input
                    type="text"
                    value={novoItem.nome}
                    onChange={(e) => setNovoItem({...novoItem, nome: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Ex: Marmitex Tradicional"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={novoItem.descricao}
                    onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Descreva o item..."
                    rows={3}
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoItem.preco}
                    onChange={(e) => setNovoItem({...novoItem, preco: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="0,00"
                    required
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={novoItem.categoriaId}
                    onChange={(e) => setNovoItem({...novoItem, categoriaId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.filter(cat => cat.ativa).map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload de Imagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Produto
                  </label>
                  
                  {/* Preview da imagem */}
                  {previewImage && (
                    <div className="mb-3">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setNovoItem({...novoItem, imagem: ''});
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remover imagem
                      </button>
                    </div>
                  )}
                  
                  {/* Input de arquivo */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para enviar</span> ou arraste a imagem
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG ou JPEG (máx. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  
                  {uploadingImage && (
                    <div className="mt-2 text-sm text-blue-600">
                      Enviando imagem...
                    </div>
                  )}
                </div>

                {/* Opções especiais */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="destaque"
                      checked={novoItem.destaque}
                      onChange={(e) => setNovoItem({...novoItem, destaque: e.target.checked})}
                      className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="destaque" className="text-sm font-medium text-gray-700 flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      Item em Destaque
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sugestaoChef"
                      checked={novoItem.sugestaoChef}
                      onChange={(e) => setNovoItem({...novoItem, sugestaoChef: e.target.checked})}
                      className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sugestaoChef" className="text-sm font-medium text-gray-700 flex items-center">
                      <Award className="w-4 h-4 text-purple-500 mr-1" />
                      Sugestão do Chef
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveItem}
                    disabled={loadingItem || !novoItem.nome.trim() || !novoItem.preco || !novoItem.categoriaId}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {loadingItem ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar Item')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarmitariaAdminDashboard;
