'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  ChefHat, 
  ShoppingCart, 
  Plus, 
  Minus,
  Clock,
  Badge,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';

type Categoria = {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativa: boolean;
  visivel: boolean;
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
  categoria: Categoria;
};

type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
};

function CardapioPublico() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    fetchCardapio();
  }, []);

  const fetchCardapio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categorias?comItens=true');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      
      if (!Array.isArray(data)) {
        console.error('Dados da API não são um array:', data);
        setCategorias([]);
        return;
      }
      
      // Filtrar apenas categorias visíveis com itens disponíveis
      const categoriasVisiveis = data
        .filter((cat: Categoria) => cat && cat.visivel && cat.ativa)
        .map((cat: Categoria) => ({
          ...cat,
          itens: cat.itens?.filter(item => item && item.ativo && item.disponivel) || []
        }))
        .filter((cat: Categoria) => cat.itens && cat.itens.length > 0);
      
      console.log('Categorias visíveis processadas:', categoriasVisiveis);
      setCategorias(categoriasVisiveis);
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      toast.error('Erro ao carregar cardápio');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (item: ItemCardapio) => {
    const itemExistente = carrinho.find(c => c.id === item.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(c => 
        c.id === item.id 
          ? { ...c, quantidade: c.quantidade + 1 }
          : c
      ));
    } else {
      setCarrinho([...carrinho, {
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: 1,
        categoria: item.categoria?.nome || 'Sem categoria',
      }]);
    }

    toast.success(`${item.nome} adicionado ao pedido!`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  const removerDoCarrinho = (itemId: string) => {
    const itemExistente = carrinho.find(c => c.id === itemId);
    
    if (itemExistente && itemExistente.quantidade > 1) {
      setCarrinho(carrinho.map(c => 
        c.id === itemId 
          ? { ...c, quantidade: c.quantidade - 1 }
          : c
      ));
    } else {
      setCarrinho(carrinho.filter(c => c.id !== itemId));
    }
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const finalizarPedido = async () => {
    if (!nomeCliente.trim()) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    if (carrinho.length === 0) {
      toast.error('Adicione itens ao seu pedido');
      return;
    }

    setEnviandoPedido(true);
    
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCliente,
          observacao: observacao.trim() || null,
          itens: carrinho.map(item => ({
            itemCardapioId: item.id,
            quantidade: item.quantidade,
            preco: item.preco,
          })),
        }),
      });

      if (response.ok) {
        toast.success('Pedido realizado com sucesso!', {
          position: "top-center",
          autoClose: 5000,
        });
        
        // Limpar formulário
        setCarrinho([]);
        setNomeCliente('');
        setObservacao('');
        setMostrarCarrinho(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao fazer pedido');
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao enviar pedido');
    } finally {
      setEnviandoPedido(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Carrinho Flutuante */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setMostrarCarrinho(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {carrinho.reduce((total, item) => total + item.quantidade, 0)}
            </span>
          </button>
        </div>
      )}

      {/* Modal do Carrinho */}
      {mostrarCarrinho && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Seu Pedido</h3>
                <button
                  onClick={() => setMostrarCarrinho(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Itens do Carrinho */}
              <div className="space-y-4 mb-6">
                {carrinho.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.nome}</h4>
                      <p className="text-sm text-gray-600">{item.categoria}</p>
                      <p className="text-sm font-bold text-orange-600">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removerDoCarrinho(item.id)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-red-600" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantidade}</span>
                      <button
                        onClick={() => {
                          const itemCompleto = categorias
                            .flatMap(cat => cat.itens || [])
                            .find(i => i.id === item.id);
                          if (itemCompleto && itemCompleto.categoria) {
                            adicionarAoCarrinho(itemCompleto);
                          }
                        }}
                        className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    R$ {calcularTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu nome *
                  </label>
                  <input
                    type="text"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    rows={3}
                    placeholder="Alguma observação especial?"
                  />
                </div>

                <button
                  onClick={finalizarPedido}
                  disabled={enviandoPedido || !nomeCliente.trim() || carrinho.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  {enviandoPedido ? 'Enviando...' : `Finalizar Pedido - R$ ${calcularTotal().toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorias e Itens */}
      <div className="space-y-12">
        {categorias.map((categoria) => (
          <section key={categoria.id} className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {categoria.nome}
              </h3>
              {categoria.descricao && (
                <p className="text-gray-600 text-lg">
                  {categoria.descricao}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.itens?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border"
                >
                  {/* Imagem do produto */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
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
                    <div className={`${item.imagem ? 'hidden' : 'flex'} text-orange-400 w-full h-full items-center justify-center`}>
                      <ChefHat className="w-16 h-16" />
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
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

                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        {item.nome}
                      </h4>
                      {item.descricao && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        R$ {item.preco.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => adicionarAoCarrinho(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Cardápio em atualização
          </h3>
          <p className="text-gray-500">
            Estamos preparando nosso cardápio. Volte em breve!
          </p>
        </div>
      )}
    </div>
  );
}

export default CardapioPublico;
