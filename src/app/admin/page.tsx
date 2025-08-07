'use client';

import MarmitariaAdminDashboard from '@/components/MarmitariaAdminDashboard';
import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegação superior */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        <Link 
          href="/"
          className="bg-white shadow-md text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Ver Cardápio</span>
        </Link>
        
        <button 
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            window.location.href = '/admin/login';
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
      
      {/* Espaçamento para a barra fixa */}
      <div className="pt-20">
        <MarmitariaAdminDashboard />
      </div>
    </div>
  );
} 