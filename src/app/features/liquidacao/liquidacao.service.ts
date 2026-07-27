import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subscription, switchMap, takeWhile, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LiquidacaoRQ,
  LiquidacaoRS,
  LiquidacaoSortCampo,
  Page,
  STATUS_TERMINAIS,
  StatusLiquidacao,
} from '../../core/models';

const INTERVALO_POLLING_MS = 3000;

export interface LiquidacaoListaConsulta {
  page: number;
  size: number;
  sort: LiquidacaoSortCampo | null;
  direcao: 'asc' | 'desc';
  id: number | null;
  trackId: string | null;
  status: StatusLiquidacao | null;
}

export const LISTA_INICIAL: LiquidacaoListaConsulta = {
  page: 0,
  size: 20,
  sort: null, // o backend ordena por dtCriacao,desc por padrão
  direcao: 'desc',
  id: null,
  trackId: null,
  status: null,
};

@Injectable({ providedIn: 'root' })
export class LiquidacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/liquidacoes`;
  private pollingSub?: Subscription;

  readonly liquidacao = signal<LiquidacaoRS | null>(null);
  readonly solicitando = signal(false);
  readonly consultando = signal(false);
  readonly acompanhando = signal(false);

  readonly paginaLista = signal<Page<LiquidacaoRS> | null>(null);
  readonly listando = signal(false);

  /** Envia a solicitação com o TrackId (chave de idempotência) no header e inicia o polling. */
  solicitar(rq: LiquidacaoRQ, trackId: string): void {
    this.pararPolling();
    this.solicitando.set(true);
    this.liquidacao.set(null);

    this.http
      .post<LiquidacaoRS>(this.url, rq, { headers: new HttpHeaders({ TrackId: trackId }) })
      .subscribe({
        next: (rs) => {
          this.solicitando.set(false);
          this.liquidacao.set(rs);
          if (!this.statusTerminal(rs)) {
            this.iniciarPolling(rs.id);
          }
        },
        error: () => this.solicitando.set(false),
      });
  }

  /** Lista liquidações de qualquer status, com filtros e paginação server-side. */
  listar(consulta: LiquidacaoListaConsulta): void {
    this.listando.set(true);

    let params = new HttpParams().set('page', consulta.page).set('size', consulta.size);
    if (consulta.sort !== null) {
      params = params.set('sort', `${consulta.sort},${consulta.direcao}`);
    }
    if (consulta.id !== null) {
      params = params.set('id', consulta.id);
    }
    if (consulta.trackId !== null && consulta.trackId !== '') {
      params = params.set('trackId', consulta.trackId);
    }
    if (consulta.status !== null) {
      params = params.set('status', consulta.status);
    }

    this.http.get<Page<LiquidacaoRS>>(this.url, { params }).subscribe({
      next: (pagina) => {
        this.paginaLista.set(pagina);
        this.listando.set(false);
      },
      error: () => this.listando.set(false),
    });
  }

  /** Busca uma liquidação existente pelo ID; se ainda não for terminal, retoma o polling. */
  consultar(liquidacaoId: number): void {
    this.pararPolling();
    this.consultando.set(true);
    this.liquidacao.set(null);

    this.http.get<LiquidacaoRS>(`${this.url}/${liquidacaoId}`).subscribe({
      next: (rs) => {
        this.consultando.set(false);
        this.liquidacao.set(rs);
        if (!this.statusTerminal(rs)) {
          this.iniciarPolling(rs.id);
        }
      },
      error: () => this.consultando.set(false),
    });
  }

  private iniciarPolling(liquidacaoId: number): void {
    this.acompanhando.set(true);
    this.pollingSub = timer(INTERVALO_POLLING_MS, INTERVALO_POLLING_MS)
      .pipe(
        switchMap(() => this.http.get<LiquidacaoRS>(`${this.url}/${liquidacaoId}`)),
        takeWhile((rs) => !this.statusTerminal(rs), true),
      )
      .subscribe({
        next: (rs) => {
          this.liquidacao.set(rs);
          if (this.statusTerminal(rs)) {
            this.acompanhando.set(false);
          }
        },
        error: () => this.acompanhando.set(false),
      });
  }

  pararPolling(): void {
    this.pollingSub?.unsubscribe();
    this.acompanhando.set(false);
  }

  private statusTerminal(rs: LiquidacaoRS): boolean {
    return STATUS_TERMINAIS.includes(rs.status);
  }
}
