// Arquivo simplificado para o Heroku usando ESM
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Tratamento para favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Tratamento para acesso-autorizado
app.get('/acesso-autorizado', (req, res) => {
  res.redirect('/?acesso=autorizado');
});

// API de status
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API de redirecionamento
app.get('/api/redirect', (req, res) => {
  const hasAuthParam = req.query.acesso === 'autorizado';
  const targetDomain = hasAuthParam ? 'vivo-cadastre-se.com' : 'atendimentovivo.gupy.io';
  const redirectUrl = hasAuthParam ? `https://${targetDomain}?acesso=autorizado` : `https://${targetDomain}`;
  console.log('Redirecionando para:', redirectUrl);
  return res.redirect(307, redirectUrl);
});

// Todas as outras rotas servem o index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});