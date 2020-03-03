import { TestBed } from '@angular/core/testing';

import { DistribuidoraService } from './distribuidora.service';

describe('DistribuidoraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DistribuidoraService = TestBed.get(DistribuidoraService);
    expect(service).toBeTruthy();
  });
});
