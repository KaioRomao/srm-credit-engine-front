import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ErroRS } from '../models';

/**
 * Traduz o ErroRS do backend em uma mensagem única de MatSnackBar,
 * para nenhum componente precisar repetir tratamento de erro HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      snackBar.open(mensagemPara(err), 'Fechar', {
        duration: 8000,
        panelClass: 'snack-erro',
      });
      return throwError(() => err);
    }),
  );
};

function mensagemPara(err: HttpErrorResponse): string {
  if (err.status === 0) {
    const destino = environment.apiBaseUrl || 'http://localhost:8080 (via proxy /api)';
    return `Não foi possível conectar ao backend em ${destino}. Verifique se a aplicação está no ar.`;
  }

  if (err.status >= 500) {
    return 'Erro interno no servidor. Tente novamente em instantes.';
  }

  const erro = extrairErroRS(err);

  if (err.status === 400 && erro?.erros?.length) {
    const campos = erro.erros.map((e) => `${e.campo}: ${e.mensagem}`).join('\n');
    return `Falha de validação:\n${campos}`;
  }

  if (erro?.message) {
    switch (err.status) {
      case 404:
        return `Recurso não encontrado: ${erro.message}`;
      case 409:
        return `Conflito de estado: ${erro.message}`;
      default:
        return erro.message;
    }
  }

  return `Erro ${err.status} ao chamar ${err.url ?? 'a API'}.`;
}

function extrairErroRS(err: HttpErrorResponse): ErroRS | null {
  const corpo: unknown = err.error;
  if (corpo && typeof corpo === 'object' && 'message' in corpo) {
    return corpo as ErroRS;
  }
  return null;
}
