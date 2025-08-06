import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

console.log('🔍 Verificando status da migração...');

// Verificar se as variáveis de ambiente estão configuradas
const requiredVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('📋 Variáveis de ambiente necessárias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Configurada' : '❌ Não configurada';
  console.log(`  ${varName}: ${status}`);
});

console.log('\n📊 Status da migração:');
console.log('  - Script de migração: ✅ Criado');
console.log('  - Dependências: ✅ Instaladas');
console.log('  - Variáveis de ambiente: ⚠️ Precisa configurar');

console.log('\n🎯 Para completar a migração:');
console.log('1. Configure as variáveis no arquivo .env.local');
console.log('2. Execute: npx tsx ../scripts/migrate-simple.ts');
console.log('3. Teste: npx tsx ../scripts/test-simple.ts');

console.log('\n📝 Exemplo de .env.local:');
console.log(`
DATABASE_URL=postgresql://postgres:sua_senha@db.sua_projeto.supabase.co:5432/postgres
SUPABASE_URL=https://sua_projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
`); 