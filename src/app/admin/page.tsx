'use client';

import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen admin-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Painel Administrativo
          </h1>
          <h2 className="text-lg md:text-xl text-white/90 mb-2">
            Drinks da 20210 - Arraiá IFMS 2025
          </h2>
          <p className="text-white/80">
            Gerenciamento de Pedidos e Drinks
          </p>
        </div>
        
        <AdminDashboard />
        
        {/* Botão de Logout */}
        <div className="fixed top-4 right-4">
          <button 
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
} 