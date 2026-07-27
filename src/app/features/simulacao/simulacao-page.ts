import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { EMPTY, catchError, debounceTime, switchMap } from 'rxjs';

import {
  MOEDAS,
  SimulacaoPrecificacaoRQ,
  TIPOS_RECEBIVEL,
  TipoRecebivel,
} from '../../core/models';
import { paraDataIso } from '../../core/utils/data.util';
import { SimulacaoService } from './simulacao.service';

@Component({
  selector: 'app-simulacao-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simulacao-page.html',
  styleUrl: './simulacao-page.scss',
})
export class SimulacaoPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly service = inject(SimulacaoService);
  protected readonly moedas = MOEDAS;
  protected readonly tiposRecebivel = TIPOS_RECEBIVEL;
  protected readonly amanha = new Date(new Date().setDate(new Date().getDate() + 1));

  protected readonly form = this.fb.group({
    vlFace: this.fb.control<number | null>(10000, [Validators.required, Validators.min(0.01)]),
    dtVencimento: this.fb.control<Date | null>(null, Validators.required),
    tipoRecebivel: this.fb.control<TipoRecebivel>('DUPLICATA_MERCANTIL', Validators.required),
    sgMoeda: this.fb.control('BRL', Validators.required),
    sgMoedaPagamento: this.fb.control('BRL', Validators.required),
    vlTaxaBase: this.fb.control<number | null>(0.01, [Validators.required, Validators.min(0)]),
  });

  protected readonly resultado = this.service.resultado;
  protected readonly carregando = this.service.carregando;

  protected readonly crossCurrency = computed(() => {
    const rs = this.resultado();
    return rs !== null && rs.sgMoeda !== rs.sgMoedaPagamento;
  });

  protected readonly spread = computed(() => {
    const rs = this.resultado();
    return rs === null ? null : rs.vlFace - rs.vlLiquido;
  });

  constructor() {
    this.form.valueChanges
      .pipe(
        debounceTime(400),
        switchMap(() => {
          if (this.form.invalid) {
            this.service.limpar();
            return EMPTY;
          }
          return this.service.simular(this.montarPayload()).pipe(catchError(() => EMPTY));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private montarPayload(): SimulacaoPrecificacaoRQ {
    const v = this.form.getRawValue();
    return {
      vlFace: v.vlFace!,
      dtVencimento: paraDataIso(v.dtVencimento!),
      tipoRecebivel: v.tipoRecebivel,
      sgMoeda: v.sgMoeda,
      sgMoedaPagamento: v.sgMoedaPagamento,
      vlTaxaBase: v.vlTaxaBase!,
    };
  }
}
