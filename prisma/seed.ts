import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados...');

  // Drinks típicos de Arraiá
  const drinks = [
    {
      nome: 'Morango',
      descricao: 'Energético, Leite Condensado, Essência de Baunilha, Morango',
    },
    {
      nome: 'Maracuja',
      descricao: 'Energético, Leite Condensado, Essência de Baunilha, Maracujá',
    },
    {
      nome: 'Limão',
      descricao: 'Energético, Leite Condensado, Essência de Baunilha, Limão',
    },
    {
      nome: 'Cupuaçu + Açaí',
      descricao: 'Energético de Açaí, Leite Condensado, Essência de Baunilha, Cupuaçu',
    }
  ];

  // Verificar se já existem drinks
  const existingDrinks = await prisma.drink.findMany();
  
  if (existingDrinks.length === 0) {
    for (const drink of drinks) {
      await prisma.drink.create({
        data: drink,
      });
    }
  } else {
    console.log('⚠️  Drinks já existem no banco, pulando seed...');
  }

  console.log('✅ Banco de dados populado com sucesso!');
  console.log(`📊 ${drinks.length} drinks adicionados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 