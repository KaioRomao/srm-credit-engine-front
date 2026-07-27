import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ExtratoItemRS, ExtratoSortCampo, Page } from '../../core/models';

export interface ExtratoConsulta {
  page: number;
  size: number;
  sort: ExtratoSortCampo | null;
  direcao: 'asc' | 'desc';
  dataInicio: string | null;
  dataFim: string | null;
  cedenteId: number | null;
  sgMoeda: string | null;
}

export const CONSULTA_INICIAL: ExtratoConsulta = {
  page: 0,
  size: 20,
  sort: null,
  direcao: 'desc',
  dataInicio: null,
  dataFim: null,
  cedenteId: null,
  sgMoeda: null,
};

@Injectable({ providedIn: 'root' })
export class ExtratoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/v1/liquidacoes/extrato`;

  readonly pagina = signal<Page<ExtratoItemRS> | null>(null);
  readonly carregando = signal(false);

  buscar(consulta: ExtratoConsulta): void {
    this.carregando.set(true);

    let params = new HttpParams()
      .set('page', consulta.page)
      .set('size', consulta.size);

    if (consulta.sort !== null) {
      params = params.set('sort', `${consulta.sort},${consulta.direcao}`);
    }
    if (consulta.dataInicio !== null) {
      params = params.set('dataInicio', consulta.dataInicio);
    }
    if (consulta.dataFim !== null) {
      params = params.set('dataFim', consulta.dataFim);
    }
    if (consulta.cedenteId !== null) {
      params = params.set('cedenteId', consulta.cedenteId);
    }
    if (consulta.sgMoeda !== null) {
      params = params.set('sgMoeda', consulta.sgMoeda);
    }

    this.http.get<Page<ExtratoItemRS>>(this.url, { params }).subscribe({
      next: (pagina) => {
        this.pagina.set(pagina);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
