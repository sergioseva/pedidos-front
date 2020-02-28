import { TestBed } from '@angular/core/testing';

import { PrintPedidoService } from './print-pedido.service';

describe('PrintPedidoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrintPedidoService = TestBed.get(PrintPedidoService);
    expect(service).toBeTruthy();
  });
});
