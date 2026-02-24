import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DistribuidoraService } from './distribuidora.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService, createDistribuidora } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('DistribuidoraService', () => {
  let service: DistribuidoraService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DistribuidoraService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(DistribuidoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDistribuidoras', () => {
    it('should call correct URL', () => {
      chttp.get.and.returnValue(of([]));

      service.getDistribuidoras().subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/distribuidoras');
    });
  });

  describe('getDistribuidora', () => {
    it('should call correct URL with id', () => {
      chttp.get.and.returnValue(of({}));

      service.getDistribuidora(3);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/distribuidoras/3');
    });
  });

  describe('buscarDistribuidoras', () => {
    it('should call correct search URL', () => {
      chttp.get.and.returnValue(of([]));

      service.buscarDistribuidoras('casassa').subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/distribuidoras/search/findByAny?parametro=casassa');
    });
  });

  describe('insertDistribuidora', () => {
    it('should POST to distribuidoras URL', () => {
      const dist = createDistribuidora();
      chttp.post.and.returnValue(of(dist));

      service.insertDistribuidora(dist);

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/distribuidoras', dist);
    });
  });

  describe('updateDistribuidora', () => {
    it('should PUT to distribuidoras URL with id', () => {
      const dist = createDistribuidora();
      chttp.put.and.returnValue(of(dist));

      service.updateDistribuidora(5, dist);

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/distribuidoras/5', dist);
    });
  });

  describe('deleteDistribuidora', () => {
    it('should DELETE with id', () => {
      chttp.delete.and.returnValue(of({}));

      service.deleteDistribuidora(5).subscribe();

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/distribuidoras/5');
    });
  });
});
