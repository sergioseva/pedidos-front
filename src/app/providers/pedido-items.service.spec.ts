import { TestBed } from '@angular/core/testing';

import { PedidoItemsService } from './pedido-items.service';

describe('PedidoItemsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PedidoItemsService = TestBed.get(PedidoItemsService);
    expect(service).toBeTruthy();
  });
});
