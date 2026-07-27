import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatusLiquidacao } from '../../core/models';

@Component({
  selector: 'app-status-badge',
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="'badge status-' + status().toLowerCase()">
      @if (status() === 'PROCESSANDO') {
        <mat-spinner diameter="12" />
      }
      {{ status() }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-processando { background: #dbeafe; color: #1d4ed8; }
    .status-liquidada { background: #d1fae5; color: #065f46; }
    .status-falha { background: #fee2e2; color: #991b1b; }
    .status-cancelada { background: #e5e7eb; color: #4b5563; }

    mat-spinner {
      --mdc-circular-progress-active-indicator-color: #1d4ed8;
    }
  `,
})
export class StatusBadge {
  readonly status = input.required<StatusLiquidacao>();
}
