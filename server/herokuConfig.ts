// Configurações adicionais para Heroku

export function configureHeroku(app: any) {
  console.log('Configurando aplicação para o ambiente Heroku');

  // Adicionar middleware para lidar com rotas não encontradas no Heroku
  app.use((req: any, res: any, next: any) => {
    // Verificar se é uma solicitação para /favicon.ico
    if (req.path === '/favicon.ico') {
      // Retornar 204 (No Content) para evitar erros de favicon
      return res.status(204).end();
    }
    
    // Verificar se é um parâmetro de acesso
    if (req.path === '/acesso-autorizado') {
      // Redirecionar para a página principal com o parâmetro de acesso
      return res.redirect('/?acesso=autorizado');
    }
    
    next();
  });

  return app;
}