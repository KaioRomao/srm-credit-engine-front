import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'simulacao' },
  {
    path: 'simulacao',
    title: 'Simulação · SRM Credit Engine',
    loadComponent: () => import('./features/simulacao/simulacao-page').then((m) => m.SimulacaoPage),
  },
  {
    path: 'lotes',
    title: 'Lotes · SRM Credit Engine',
    loadComponent: () => import('./features/lotes/lotes-page').then((m) => m.LotesPage),
  },
  {
    path: 'liquidacao',
    title: 'Liquidação · SRM Credit Engine',
    loadComponent: () =>
      import('./features/liquidacao/liquidacao-page').then((m) => m.LiquidacaoPage),
  },
  {
    path: 'cambio',
    title: 'Câmbio · SRM Credit Engine',
    loadComponent: () => import('./features/cambio/cambio-page').then((m) => m.CambioPage),
  },
  {
    path: 'extrato',
    title: 'Extrato · SRM Credit Engine',
    loadComponent: () => import('./features/extrato/extrato-page').then((m) => m.ExtratoPage),
  },
  { path: '**', redirectTo: 'simulacao' },
];
