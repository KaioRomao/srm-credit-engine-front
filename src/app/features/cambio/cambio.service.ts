import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { CotacaoRS } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CambioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/cambios`;

  readonly cotacaoSincronizada = signal<CotacaoRS | null>(null);
  readonly sincronizando = signal(false);

  readonly taxaConsultada = signal<{ origem: string; destino: string; taxa: number } | null>(null);
  readonly consultando = signal(false);

  /** Sem corpo — todos os parâmetros vão na query string (idempotente por par + data). */
  sincronizar(data: string, origem: string, destino: string): void {
    this.sincronizando.set(true);
    const params = new HttpParams()
      .set('data', data)
      .set('sgMoedaCambioOrigem', origem)
      .set('sgMoedaCambioDestino', destino);

    this.http.post<CotacaoRS>(`${this.url}/sincronizar`, null, { params }).subscribe({
      next: (rs) => {
        this.cotacaoSincronizada.set(rs);
        this.sincronizando.set(false);
      },
      error: () => this.sincronizando.set(false),
    });
  }

  /** O corpo da resposta é um número puro (BigDecimal). */
  consultar(origem: string, destino: string): void {
    this.consultando.set(true);
    const params = new HttpParams().set('origem', origem).set('destino', destino);

    this.http.get<number>(this.url, { params }).subscribe({
      next: (taxa) => {
        this.taxaConsultada.set({ origem, destino, taxa });
        this.consultando.set(false);
      },
      error: () => {
        this.taxaConsultada.set(null);
        this.consultando.set(false);
      },
    });
  }
}
