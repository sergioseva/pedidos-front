import { TestBed } from '@angular/core/testing';

import { PedidoDistribuidoraService } from './pedido-distribuidora.service';

describe('PedidoDistribuidoraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PedidoDistribuidoraService = TestBed.get(PedidoDistribuidoraService);
    expect(service).toBeTruthy();
  });
});
