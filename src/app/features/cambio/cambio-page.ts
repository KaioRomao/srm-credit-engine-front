import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { MOEDAS } from '../../core/models';
import { paraDataIso } from '../../core/utils/data.util';
import { CambioService } from './cambio.service';

@Component({
  selector: 'app-cambio-page',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cambio-page.html',
  styleUrl: './cambio-page.scss',
})
export class CambioPage {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly service = inject(CambioService);
  protected readonly moedas = MOEDAS;
  protected readonly hoje = new Date();

  protected readonly formSincronizar = this.fb.group({
    data: this.fb.control<Date>(new Date(), Validators.required),
    origem: this.fb.control('BRL', Validators.required),
    destino: this.fb.control('USD', Validators.required),
  });

  protected readonly formConsultar = this.fb.group({
    origem: this.fb.control('BRL', Validators.required),
    destino: this.fb.control('USD', Validators.required),
  });

  protected sincronizar(): void {
    if (this.formSincronizar.invalid) {
      this.formSincronizar.markAllAsTouched();
      return;
    }
    const v = this.formSincronizar.getRawValue();
    this.service.sincronizar(paraDataIso(v.data), v.origem, v.destino);
  }

  protected consultar(): void {
    if (this.formConsultar.invalid) {
      this.formConsultar.markAllAsTouched();
      return;
    }
    const v = this.formConsultar.getRawValue();
    this.service.consultar(v.origem, v.destino);
  }
}
