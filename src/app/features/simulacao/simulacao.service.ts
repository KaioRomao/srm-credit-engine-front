import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PrecificacaoRS, SimulacaoPrecificacaoRQ } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class SimulacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/precificacoes/simular`;

  readonly resultado = signal<PrecificacaoRS | null>(null);
  readonly carregando = signal(false);

  simular(rq: SimulacaoPrecificacaoRQ): Observable<PrecificacaoRS> {
    this.carregando.set(true);
    return this.http.post<PrecificacaoRS>(this.url, rq).pipe(
      tap({
        next: (rs) => {
          this.resultado.set(rs);
          this.carregando.set(false);
        },
        error: () => {
          this.resultado.set(null);
          this.carregando.set(false);
        },
      }),
    );
  }

  limpar(): void {
    this.resultado.set(null);
    this.carregando.set(false);
  }
}
