import CardapioPublico from '@/components/CardapioPublico';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { empresaConfig } from '@/config/empresa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header da Empresa */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo customizável */}
              <div 
                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center"
                style={{
                  background: empresaConfig.logo.imagem 
                    ? `url(${empresaConfig.logo.imagem})` 
                    : `linear-gradient(135deg, ${empresaConfig.cores.primary}, ${empresaConfig.cores.primaryDark})`
                }}
              >
                {!empresaConfig.logo.imagem && (
                  <span className="text-white font-bold text-xl">
                    {empresaConfig.logo.inicial}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {empresaConfig.nome}
                </h1>
                <p className="text-sm text-gray-600">
                  {empresaConfig.slogan}
                </p>
              </div>
            </div>
            
            {/* Link para admin */}
            <Link 
              href="/admin"
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title="Área administrativa"
            >
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nosso Cardápio
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {empresaConfig.descricao}
          </p>
        </div>
        
        <CardapioPublico />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 {empresaConfig.nome}. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sistema de pedidos profissional v{empresaConfig.sistema.versao}
          </p>
        </div>
      </footer>
    </div>
  );
}
