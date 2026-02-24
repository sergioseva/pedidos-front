import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PedidoDistribuidoraService } from './pedido-distribuidora.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('PedidoDistribuidoraService', () => {
  let service: PedidoDistribuidoraService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PedidoDistribuidoraService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(PedidoDistribuidoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmarPedido', () => {
    it('should POST pedido to the correct URL', () => {
      const pedido = { distribuidora: { id: 1 }, items: [{ id: 1 }] };
      chttp.post.and.returnValue(of({}));

      service.confirmarPedido(pedido).subscribe();

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/pedidodistribuidora', pedido);
    });
  });
});
