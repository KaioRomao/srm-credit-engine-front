import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoteRQ, LoteRS } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class LotesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/lotes`;

  readonly loteCriado = signal<LoteRS | null>(null);
  readonly criando = signal(false);

  criar(rq: LoteRQ): Observable<LoteRS> {
    this.criando.set(true);
    return this.http.post<LoteRS>(this.url, rq).pipe(
      tap({
        next: (rs) => {
          this.loteCriado.set(rs);
          this.criando.set(false);
        },
        error: () => this.criando.set(false),
      }),
    );
  }

  limpar(): void {
    this.loteCriado.set(null);
  }
}
