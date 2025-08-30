import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface ConnectionTest {
  name: string;
  url: string;
  description: string;
}

async function testConnection(test: ConnectionTest): Promise<boolean> {
  console.log(`\n🔄 Testando: ${test.name}`);
  console.log(`📝 Descrição: ${test.description}`);
  console.log(`🔗 URL: ${test.url.replace(/:[^:]*@/, ':****@')}`);
  
  const client = new Client({
    connectionString: test.url,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 seconds
    query_timeout: 5000, // 5 seconds
  });

  try {
    console.log('⏳ Conectando...');
    await client.connect();
    
    console.log('✅ Conexão estabelecida!');
    
    // Test basic query
    console.log('🔍 Testando query básica...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 Resultado:', {
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version.substring(0, 50) + '...'
    });
    
    // Test database info
    console.log('🗃️ Testando informações do banco...');
    const dbInfo = await client.query('SELECT current_database() as db_name, current_user as user_name');
    console.log('📊 Info do banco:', dbInfo.rows[0]);
    
    await client.end();
    console.log('✅ Teste concluído com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    
    if (error instanceof Error) {
      console.error('📝 Detalhes do erro:');
      console.error(`   - Mensagem: ${error.message}`);
      console.error(`   - Nome: ${error.name}`);
      
      // Specific error handling
      if (error.message.includes('ETIMEDOUT')) {
        console.error('🔥 PROBLEMA: Timeout de conexão');
        console.error('💡 SOLUÇÕES:');
        console.error('   1. Verificar se o Neon database está ativo');
        console.error('   2. Verificar firewall/proxy da rede');
        console.error('   3. Tentar conexão direta (sem pooler)');
      }
      
      if (error.message.includes('ENOTFOUND')) {
        console.error('🔥 PROBLEMA: Host não encontrado');
        console.error('💡 SOLUÇÕES:');
        console.error('   1. Verificar URL do banco no dashboard Neon');
        console.error('   2. Verificar DNS/conectividade de rede');
      }
      
      if (error.message.includes('authentication')) {
        console.error('🔥 PROBLEMA: Falha de autenticação');
        console.error('💡 SOLUÇÕES:');
        console.error('   1. Verificar credenciais no dashboard Neon');
        console.error('   2. Resetar senha do banco se necessário');
      }
    }
    
    try {
      await client.end();
    } catch (endError) {
      // Ignore cleanup errors
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 === TESTE DE CONEXÃO NEON DATABASE ===\n');
  
  // Get connection strings from environment
  const neonUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!neonUrl) {
    console.error('❌ ERRO: Variável DATABASE_URL ou NEON_DATABASE_URL não encontrada');
    console.error('📝 Configure no arquivo .env.local:');
    console.error('   DATABASE_URL=postgresql://usuario:senha@host:5432/database');
    process.exit(1);
  }
  
  // Parse URL to create different connection variants
  const url = new URL(neonUrl);
  
  const tests: ConnectionTest[] = [
    {
      name: 'Conexão Direta (Original)',
      url: neonUrl,
      description: 'Testa a URL original fornecida'
    },
    {
      name: 'Conexão via Pooler (Porta 5432)',
      url: neonUrl.replace(/:\d+\//, ':5432/'),
      description: 'Tenta usar porta padrão PostgreSQL'
    },
    {
      name: 'Conexão via Pooler (Porta 6543)',
      url: neonUrl.replace(/:\d+\//, ':6543/'),
      description: 'Tenta usar porta pooler do Neon'
    }
  ];
  
  // Add SSL variants if not already present
  if (!neonUrl.includes('sslmode=')) {
    tests.push({
      name: 'Conexão com SSL Require',
      url: neonUrl + (neonUrl.includes('?') ? '&' : '?') + 'sslmode=require',
      description: 'Força SSL obrigatório'
    });
  }
  
  let successfulTests = 0;
  
  for (const test of tests) {
    const success = await testConnection(test);
    if (success) {
      successfulTests++;
    }
    console.log('─'.repeat(60));
  }
  
  console.log(`\n🎯 === RESUMO DOS TESTES ===`);
  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${tests.length}`);
  
  if (successfulTests === 0) {
    console.log('\n❌ NENHUM TESTE FOI BEM-SUCEDIDO');
    console.log('\n🔧 PRÓXIMOS PASSOS RECOMENDADOS:');
    console.log('1. Verificar se o Neon database está ativo no dashboard');
    console.log('2. Verificar credenciais (usuário/senha)');
    console.log('3. Testar conectividade de rede');
    console.log('4. Verificar configurações de firewall');
    console.log('5. Tentar criar uma nova string de conexão no Neon');
    process.exit(1);
  } else {
    console.log('\n✅ PELO MENOS UM TESTE FOI BEM-SUCEDIDO!');
    console.log('🎉 A migração pode prosseguir.');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
main().catch((error) => {
  console.error('❌ Erro fatal no teste:', error);
  process.exit(1);
});