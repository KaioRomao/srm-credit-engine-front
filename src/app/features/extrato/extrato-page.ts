import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import {
  EXTRATO_SORT_WHITELIST,
  ExtratoSortCampo,
  MOEDAS,
} from '../../core/models';
import { paraDataIso } from '../../core/utils/data.util';
import { CONSULTA_INICIAL, ExtratoConsulta, ExtratoService } from './extrato.service';

@Component({
  selector: 'app-extrato-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './extrato-page.html',
  styleUrl: './extrato-page.scss',
})
export class ExtratoPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private consulta: ExtratoConsulta = { ...CONSULTA_INICIAL };

  protected readonly service = inject(ExtratoService);
  protected readonly moedas = MOEDAS;
  protected readonly colunas = [
    'dtLiquidacao',
    'cedenteNome',
    'nrTitulo',
    'tipoRecebivel',
    'dtVencimento',
    'vlFace',
    'vlLiquido',
    'vlSpread',
    'vlLiquidado',
    'sgMoedaLiquidacao',
  ];

  protected readonly itens = computed(() => this.service.pagina()?.content ?? []);
  protected readonly totalElementos = computed(() => this.service.pagina()?.totalElements ?? 0);

  protected readonly formFiltros = this.fb.group({
    dataInicio: this.fb.control<Date | null>(null),
    dataFim: this.fb.control<Date | null>(null),
    cedenteId: this.fb.control<number | null>(null),
    sgMoeda: this.fb.control<string | null>(null),
  });

  constructor() {
    this.service.buscar(this.consulta);
  }

  protected aplicarFiltros(): void {
    const v = this.formFiltros.getRawValue();
    this.consulta = {
      ...this.consulta,
      page: 0,
      dataInicio: v.dataInicio !== null ? paraDataIso(v.dataInicio) : null,
      dataFim: v.dataFim !== null ? paraDataIso(v.dataFim) : null,
      cedenteId: v.cedenteId,
      sgMoeda: v.sgMoeda,
    };
    this.service.buscar(this.consulta);
  }

  protected limparFiltros(): void {
    this.formFiltros.reset();
    this.aplicarFiltros();
  }

  protected mudarPagina(evento: PageEvent): void {
    this.consulta = { ...this.consulta, page: evento.pageIndex, size: evento.pageSize };
    this.service.buscar(this.consulta);
  }

  protected mudarOrdenacao(sort: Sort): void {
    const campo = EXTRATO_SORT_WHITELIST.find((c) => c === sort.active) ?? null;
    this.consulta = {
      ...this.consulta,
      page: 0,
      sort: sort.direction === '' ? null : (campo as ExtratoSortCampo | null),
      direcao: sort.direction === 'desc' ? 'desc' : 'asc',
    };
    this.service.buscar(this.consulta);
  }
}
