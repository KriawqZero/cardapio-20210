import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderStatus from '@/components/OrderStatus';
import Watermark from '@/components/Watermark';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          drink: true
        }
      }
    }
  });

  if (!pedido) {
    notFound();
  }

  // Converter datas para strings para compatibilidade com o componente
  const pedidoFormatted = {
    ...pedido,
    createdAt: pedido.createdAt.toISOString(),
    updatedAt: pedido.updatedAt.toISOString(),
    itens: pedido.itens.map(item => ({
      ...item,
      drink: {
        ...item.drink,
        createdAt: item.drink.createdAt.toISOString(),
        updatedAt: item.drink.updatedAt.toISOString()
      }
    }))
  };

  return (
    <div className="min-h-screen modern-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Drinks da 20210
          </h1>
          <h2 className="text-lg md:text-xl text-white/90 mb-2">
            Arraiá IFMS 2025
          </h2>
          <p className="text-white/80">
            Acompanhe seu pedido
          </p>
        </div>
        
        <OrderStatus pedido={pedidoFormatted} />
      </div>
      <Watermark variant="dark" />
    </div>
  );
} 