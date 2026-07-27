import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PrecificacaoRS, SimulacaoPrecificacaoRQ } from '../../core/models';
import { SimulacaoService } from './simulacao.service';

describe('SimulacaoService', () => {
  let service: SimulacaoService;
  let httpMock: HttpTestingController;

  const rq: SimulacaoPrecificacaoRQ = {
    vlFace: 10000,
    dtVencimento: '2026-12-01',
    tipoRecebivel: 'DUPLICATA_MERCANTIL',
    sgMoeda: 'BRL',
    sgMoedaPagamento: 'BRL',
    vlTaxaBase: 0.01,
  };

  const rs: PrecificacaoRS = {
    vlFace: 10000,
    vlLiquido: 9500,
    vlConvertido: null,
    qtPrazoDia: 128,
    tipoRecebivel: 'DUPLICATA_MERCANTIL',
    sgMoeda: 'BRL',
    sgMoedaPagamento: 'BRL',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SimulacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('envia o payload por POST e publica o resultado no signal', () => {
    service.simular(rq).subscribe();

    const chamada = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/precificacoes/simular`);
    expect(chamada.request.method).toBe('POST');
    expect(chamada.request.body).toEqual(rq);
    expect(service.carregando()).toBe(true);

    chamada.flush(rs);

    expect(service.resultado()).toEqual(rs);
    expect(service.carregando()).toBe(false);
  });

  it('limpa o resultado quando a simulação falha', () => {
    service.simular(rq).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${environment.apiBaseUrl}/api/v1/precificacoes/simular`)
      .flush({ message: 'Prazo inválido' }, { status: 422, statusText: 'Unprocessable Entity' });

    expect(service.resultado()).toBeNull();
    expect(service.carregando()).toBe(false);
  });
});
