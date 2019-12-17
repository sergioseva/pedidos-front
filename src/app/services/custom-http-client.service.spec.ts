import { TestBed } from '@angular/core/testing';

import { CustomHttpClientService } from './custom-http-client.service';

describe('CustomHttpClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomHttpClientService = TestBed.get(CustomHttpClientService);
    expect(service).toBeTruthy();
  });
});
