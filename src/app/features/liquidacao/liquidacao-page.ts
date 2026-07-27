import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

import {
  LIQUIDACAO_SORT_WHITELIST,
  LiquidacaoSortCampo,
  MOEDAS,
  StatusLiquidacao,
} from '../../core/models';
import { StatusBadge } from '../../shared/components/status-badge';
import { LISTA_INICIAL, LiquidacaoListaConsulta, LiquidacaoService } from './liquidacao.service';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-liquidacao-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    StatusBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './liquidacao-page.html',
  styleUrl: './liquidacao-page.scss',
})
export class LiquidacaoPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly rota = inject(ActivatedRoute);

  protected readonly service = inject(LiquidacaoService);
  protected readonly moedas = MOEDAS;

  /** UUID gerado no cliente — o operador não digita a chave de idempotência. */
  protected readonly trackId = signal(crypto.randomUUID());

  protected readonly form = this.fb.group({
    precificacaoId: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    sgMoedaLiquidacao: this.fb.control('BRL', Validators.required),
  });

  protected readonly formConsulta = this.fb.group({
    liquidacaoId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  protected readonly statusDisponiveis: StatusLiquidacao[] = [
    'PENDENTE',
    'PROCESSANDO',
    'LIQUIDADA',
    'FALHA',
    'CANCELADA',
  ];
  protected readonly colunasLista = [
    'id',
    'trackId',
    'status',
    'vlLiquidado',
    'dtLiquidacao',
    'acoes',
  ];
  private consultaLista: LiquidacaoListaConsulta = { ...LISTA_INICIAL };

  protected readonly formFiltrosLista = this.fb.group({
    id: this.fb.control<number | null>(null),
    trackId: this.fb.control<string | null>(null, Validators.pattern(UUID_PATTERN)),
    status: this.fb.control<StatusLiquidacao | null>(null),
  });

  protected readonly itensLista = computed(() => this.service.paginaLista()?.content ?? []);
  protected readonly totalLista = computed(() => this.service.paginaLista()?.totalElements ?? 0);

  constructor() {
    const precificacaoId = this.rota.snapshot.queryParamMap.get('precificacaoId');
    if (precificacaoId !== null) {
      this.form.controls.precificacaoId.setValue(Number(precificacaoId));
    }
    this.service.listar(this.consultaLista);
  }

  protected solicitar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.service.solicitar(
      { precificacaoId: v.precificacaoId as number, sgMoedaLiquidacao: v.sgMoedaLiquidacao },
      this.trackId(),
    );
  }

  protected consultar(): void {
    if (this.formConsulta.invalid) {
      this.formConsulta.markAllAsTouched();
      return;
    }
    this.service.consultar(this.formConsulta.getRawValue().liquidacaoId as number);
  }

  protected novaSolicitacao(): void {
    this.trackId.set(crypto.randomUUID());
    this.service.pararPolling();
    this.service.liquidacao.set(null);
    this.form.reset({ sgMoedaLiquidacao: 'BRL' });
  }

  protected verDetalhe(liquidacaoId: number): void {
    this.formConsulta.controls.liquidacaoId.setValue(liquidacaoId);
    this.service.consultar(liquidacaoId);
  }

  protected filtrarLista(): void {
    if (this.formFiltrosLista.invalid) {
      this.formFiltrosLista.markAllAsTouched();
      return;
    }
    const v = this.formFiltrosLista.getRawValue();
    this.consultaLista = {
      ...this.consultaLista,
      page: 0,
      id: v.id,
      trackId: v.trackId,
      status: v.status,
    };
    this.service.listar(this.consultaLista);
  }

  protected limparFiltrosLista(): void {
    this.formFiltrosLista.reset();
    this.filtrarLista();
  }

  protected atualizarLista(): void {
    this.service.listar(this.consultaLista);
  }

  protected mudarPaginaLista(evento: PageEvent): void {
    this.consultaLista = { ...this.consultaLista, page: evento.pageIndex, size: evento.pageSize };
    this.service.listar(this.consultaLista);
  }

  protected mudarOrdenacaoLista(sort: Sort): void {
    const campo = LIQUIDACAO_SORT_WHITELIST.find((c) => c === sort.active) ?? null;
    this.consultaLista = {
      ...this.consultaLista,
      page: 0,
      sort: sort.direction === '' ? null : (campo as LiquidacaoSortCampo | null),
      direcao: sort.direction === 'desc' ? 'desc' : 'asc',
    };
    this.service.listar(this.consultaLista);
  }
}
