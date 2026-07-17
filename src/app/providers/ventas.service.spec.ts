import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { VentasService } from './ventas.service';
import { ConfigService } from './config.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { mockConfigService, mockCustomHttpClient } from '../testing/test-helpers';
import { VentaModel } from '../models/venta.model';

describe('VentasService', () => {
  let service: VentasService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();
    TestBed.configureTestingModule({
      providers: [
        VentasService,
        { provide: ConfigService, useValue: mockConfigService() },
        { provide: CustomHttpClientService, useValue: chttp }
      ]
    });
    service = TestBed.inject(VentasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('looks an ISBN up on the exact-match endpoint', () => {
    service.buscarPorIsbn('9789871051014');
    expect(chttp.get).toHaveBeenCalledWith('http://test-api/catalogos/isbn/9789871051014');
  });

  it('url-encodes the scanned value', () => {
    service.buscarPorIsbn('978/123');
    expect(chttp.get).toHaveBeenCalledWith('http://test-api/catalogos/isbn/978%2F123');
  });

  it('posts a sale to /ventas', () => {
    const venta = new VentaModel();
    service.crearVenta(venta);
    expect(chttp.post).toHaveBeenCalledWith('http://test-api/ventas', venta);
  });

  it('requests the per-day report for a range', () => {
    service.ventasPorDia('2026-07-01', '2026-07-16');
    expect(chttp.get).toHaveBeenCalledWith(
      'http://test-api/ventas/estadisticas/porDia?fechaDesde=2026-07-01&fechaHasta=2026-07-16');
  });

  it('requests the summary for a range', () => {
    service.resumen('2026-07-01', '2026-07-16');
    expect(chttp.get).toHaveBeenCalledWith(
      'http://test-api/ventas/estadisticas/resumen?fechaDesde=2026-07-01&fechaHasta=2026-07-16');
  });

  it('searches sales', () => {
    service.buscarVentas('sara', '2026-07-01', '2026-07-16');
    expect(chttp.get).toHaveBeenCalledWith(
      'http://test-api/ventas/search/findByAny?parametro=sara&fechaDesde=2026-07-01&fechaHasta=2026-07-16');
  });
});
