import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

import { LoteRQ, MOEDAS, TIPOS_RECEBIVEL, TipoRecebivel } from '../../core/models';
import { paraDataIso } from '../../core/utils/data.util';
import { cnpjValidator } from '../../core/validators/cnpj.validator';
import { LotesService } from './lotes.service';

interface RecebivelForm {
  nrTitulo: FormControl<string>;
  vlFace: FormControl<number | null>;
  dtVencimento: FormControl<Date | null>;
  tipoRecebivel: FormControl<TipoRecebivel>;
  sgMoeda: FormControl<string>;
  sgMoedaPagamento: FormControl<string>;
}

@Component({
  selector: 'app-lotes-page',
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
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lotes-page.html',
  styleUrl: './lotes-page.scss',
})
export class LotesPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  protected readonly service = inject(LotesService);
  protected readonly moedas = MOEDAS;
  protected readonly tiposRecebivel = TIPOS_RECEBIVEL;
  protected readonly amanha = new Date(new Date().setDate(new Date().getDate() + 1));
  protected readonly colunasItens = [
    'nrTitulo',
    'precificacaoId',
    'vlFace',
    'vlLiquido',
    'vlConvertido',
    'qtPrazoDia',
    'acoes',
  ];

  protected readonly form = this.fb.group({
    dsReferencia: this.fb.control('', Validators.required),
    cedenteNome: this.fb.control('', Validators.required),
    cedenteDocumento: this.fb.control('', [Validators.required, cnpjValidator]),
    vlTaxaBase: this.fb.control<number | null>(0.01, [Validators.required, Validators.min(0)]),
    recebiveis: this.fb.array<FormGroup<RecebivelForm>>([]),
  });

  constructor() {
    this.adicionarRecebivel();
  }

  protected get recebiveis(): FormArray<FormGroup<RecebivelForm>> {
    return this.form.controls.recebiveis;
  }

  protected adicionarRecebivel(): void {
    this.recebiveis.push(
      this.fb.group<RecebivelForm>({
        nrTitulo: this.fb.control('', Validators.required),
        vlFace: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
        dtVencimento: this.fb.control<Date | null>(null, Validators.required),
        tipoRecebivel: this.fb.control<TipoRecebivel>('DUPLICATA_MERCANTIL', Validators.required),
        sgMoeda: this.fb.control('BRL', Validators.required),
        sgMoedaPagamento: this.fb.control('BRL', Validators.required),
      }),
    );
  }

  protected removerRecebivel(indice: number): void {
    this.recebiveis.removeAt(indice);
  }

  protected criarLote(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.service.criar(this.montarPayload()).subscribe({
      next: () => this.form.markAsPristine(),
      error: () => undefined,
    });
  }

  protected liquidar(precificacaoId: number): void {
    void this.router.navigate(['/liquidacao'], { queryParams: { precificacaoId } });
  }

  protected novoLote(): void {
    this.service.limpar();
    this.form.reset({ vlTaxaBase: 0.01 });
    this.recebiveis.clear();
    this.adicionarRecebivel();
  }

  private montarPayload(): LoteRQ {
    const v = this.form.getRawValue();
    return {
      dsReferencia: v.dsReferencia,
      cedenteNome: v.cedenteNome,
      // A coluna do backend guarda só os 14 dígitos — a máscara é aceita na digitação
      cedenteDocumento: v.cedenteDocumento.replace(/\D/g, ''),
      vlTaxaBase: v.vlTaxaBase as number,
      recebiveis: v.recebiveis.map((r) => ({
        nrTitulo: r.nrTitulo,
        vlFace: r.vlFace as number,
        dtVencimento: paraDataIso(r.dtVencimento as Date),
        tipoRecebivel: r.tipoRecebivel,
        sgMoeda: r.sgMoeda,
        sgMoedaPagamento: r.sgMoedaPagamento,
      })),
    };
  }
}
