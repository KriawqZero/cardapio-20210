import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderStatus from '@/components/OrderStatus';

interface PageProps {
  params: { id: string };
}

export default async function OrderPage({ params }: PageProps) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
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

  return (
    <div className="min-h-screen modern-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Drinks da 20210
          </h1>
          <h2 className="text-lg md:text-xl text-white/90 mb-2">
            São João IFMS 2024
          </h2>
          <p className="text-white/80">
            Acompanhe seu pedido
          </p>
        </div>
        
        <OrderStatus pedido={pedido} />
      </div>
    </div>
  );
} 