import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface ItemMenu {
  rota: string;
  titulo: string;
  icone: string;
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly itensMenu: ItemMenu[] = [
    { rota: '/simulacao', titulo: 'Simulação', icone: 'calculate' },
    { rota: '/lotes', titulo: 'Lotes', icone: 'inventory_2' },
    { rota: '/liquidacao', titulo: 'Liquidação', icone: 'account_balance' },
    { rota: '/cambio', titulo: 'Câmbio', icone: 'currency_exchange' },
    { rota: '/extrato', titulo: 'Extrato', icone: 'receipt_long' },
  ];
}
