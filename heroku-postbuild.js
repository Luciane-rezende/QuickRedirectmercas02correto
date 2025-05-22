console.log('Iniciando script de pós-build para Heroku');

// Criar um arquivo de verificação de status
const fs = require('fs');
const path = require('path');

try {
  // Garantir que o diretório dist exista
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  
  // Garantir que o diretório dist/public exista
  if (!fs.existsSync('./dist/public')) {
    fs.mkdirSync('./dist/public', { recursive: true });
  }

  // Criar um arquivo para verificar status
  fs.writeFileSync('./dist/public/status.json', JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    heroku: true
  }, null, 2));

  console.log('Script de pós-build concluído com sucesso');
} catch (err) {
  console.error('Erro no script de pós-build:', err);
  process.exit(1);
}