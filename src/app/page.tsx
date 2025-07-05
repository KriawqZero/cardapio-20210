import ClientOrderForm from '@/components/ClientOrderForm';
import { Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen modern-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Drinks da 20210
          </h1>
          <h2 className="text-xl md:text-2xl text-white mb-2 font-semibold">
            Arraiá IFMS 2025
          </h2>
          <p className="text-white/80 text-lg">
            Faça seu pedido aqui!
          </p>
        </div>
        
        <ClientOrderForm />
        
        {/* Link para admin */}
        <div className="fixed bottom-4 right-4">
          <a 
            href="/admin" 
            className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center"
            title="Painel Administrativo"
          >
            <Settings className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
