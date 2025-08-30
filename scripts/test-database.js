#!/usr/bin/env node

/**
 * Script para testar a conexão com o banco de dados
 * Identifica problemas com DATABASE_URL
 */

import { Pool } from 'pg';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' });

console.log('🔍 Testando conexão com banco de dados...\n');

// Verificar se DATABASE_URL está definido
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não está definido');
  console.log('💡 Verifique se o arquivo .env.local existe e contém DATABASE_URL');
  process.exit(1);
}

// Mostrar formato da URL (sem senha)
const maskedUrl = databaseUrl.replace(/:[^:]*@/, ':***@');
console.log('📍 DATABASE_URL:', maskedUrl);

// Verificar se é Neon Database
if (databaseUrl.includes('neon.tech')) {
  console.log('✅ Usando Neon Database (recomendado)');
} else if (databaseUrl.includes('localhost')) {
  console.log('⚠️  Usando banco local');
} else {
  console.log('ℹ️  Usando banco PostgreSQL externo');
}

// Configuração da conexão
const poolConfig = {
  connectionString: databaseUrl,
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Adicionar SSL apenas se não for localhost
if (!databaseUrl.includes('localhost')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

try {
  console.log('\n🔌 Testando conexão...');
  
  // Testar conexão básica
  const client = await pool.connect();
  console.log('✅ Conexão estabelecida com sucesso!');
  
  // Testar query simples
  const result = await client.query('SELECT version(), now() as current_time');
  console.log('✅ Query executada com sucesso');
  console.log('📊 Versão PostgreSQL:', result.rows[0].version.substring(0, 50) + '...');
  console.log('🕐 Hora do servidor:', result.rows[0].current_time);
  
  // Verificar tabelas existentes
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  console.log('\n📋 Tabelas no banco:', tables.rows.length);
  if (tables.rows.length > 0) {
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
  } else {
    console.log('  (Nenhuma tabela encontrada - banco novo)');
  }
  
  client.release();
  
  console.log('\n🎉 Banco de dados está funcionando perfeitamente!');
  console.log('✨ Você pode iniciar o servidor com: npm start');
  
} catch (error) {
  console.error('\n❌ Erro ao conectar com banco:', error.message);
  
  // Diagnóstico detalhado do erro
  if (error.code === 'ECONNREFUSED') {
    console.log('🔧 Causa: Conexão recusada - servidor de banco não está rodando');
    console.log('💡 Solução: Verificar se o banco Neon está ativo');
  } else if (error.code === 'ENOTFOUND') {
    console.log('🔧 Causa: Host não encontrado - URL do banco incorreta');
    console.log('💡 Solução: Verificar DATABASE_URL no .env.local');
  } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
    console.log('🔧 Causa: Timeout de conexão - rede lenta ou firewall');
    console.log('💡 Solução: Verificar internet ou tentar novamente');
  } else if (error.message.includes('authentication') || error.message.includes('password')) {
    console.log('🔧 Causa: Credenciais incorretas');
    console.log('💡 Solução: Obter nova string de conexão do Neon console');
  } else if (error.message.includes('database') && error.message.includes('does not exist')) {
    console.log('🔧 Causa: Nome do banco incorreto');
    console.log('💡 Solução: Verificar nome do banco na URL');
  } else {
    console.log('🔧 Erro não identificado. Detalhes:', error);
  }
  
  console.log('\n📞 Para obter nova string de conexão:');
  console.log('   1. Acesse: https://console.neon.tech');
  console.log('   2. Selecione seu projeto');
  console.log('   3. Vá em "Connection Details"');
  console.log('   4. Copie a "Connection string"');
  console.log('   5. Cole no .env.local como DATABASE_URL=...');
  
  process.exit(1);
  
} finally {
  await pool.end();
}