// TESTE RÁPIDO DE CONEXÃO NEON
const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function testConnection() {
  console.log('🔄 Testando conexão com Neon...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ CONEXÃO COM NEON: SUCESSO!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Horário do servidor:', result.rows[0].current_time);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ ERRO na conexão:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 PERFEITO! Pode prosseguir com a migração!');
    process.exit(0);
  } else {
    console.log('\n🚨 Problemas na conexão. Verifique as credenciais.');
    process.exit(1);
  }
});