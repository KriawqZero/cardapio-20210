import BarmanDashboard from '@/components/BarmanDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Barman Dashboard - Barraca 20.210',
  description: 'Painel exclusivo para o barman - Fila de preparo de drinks',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function BarmanPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <BarmanDashboard />
    </div>
  );
} 