import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PedidoItemsService } from './pedido-items.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('PedidoItemsService', () => {
  let service: PedidoItemsService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PedidoItemsService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(PedidoItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPedidosPendientes', () => {
    it('should call correct URL and extract _embedded.pedidoItems', () => {
      const mockItems = [{ id: 1, libro: 'Book' }];
      chttp.get.and.returnValue(of({ _embedded: { pedidoItems: mockItems } }));

      service.getPedidosPendientes().subscribe(result => {
        expect(result).toEqual(mockItems);
      });

      expect(chttp.get).toHaveBeenCalledWith(
        'http://test-api/librospedidos/search/findByPendienteTrueOrderByLibro'
      );
    });
  });
});
