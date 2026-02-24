import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomHttpClientService } from './custom-http-client.service';
import { AuthService } from './auth.service';

describe('CustomHttpClientService', () => {
  let service: CustomHttpClientService;
  let httpMock: HttpTestingController;
  let authServiceSpy: any;

  beforeEach(() => {
    authServiceSpy = {
      leerToken: jasmine.createSpy('leerToken').and.returnValue('test-jwt-token'),
      estaAutenticado: jasmine.createSpy('estaAutenticado').and.returnValue(true),
      userToken: 'test-jwt-token'
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CustomHttpClientService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.get(CustomHttpClientService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeaders', () => {
    it('should return HttpHeaders with Authorization Bearer token', () => {
      const headers = service.getHeaders();

      expect(headers.get('Authorization')).toBe('Bearer test-jwt-token');
    });

    it('should use the token from AuthService.leerToken', () => {
      authServiceSpy.leerToken.and.returnValue('another-token');

      const headers = service.getHeaders();

      expect(headers.get('Authorization')).toBe('Bearer another-token');
      expect(authServiceSpy.leerToken).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should send GET request with auth headers', () => {
      service.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });
  });

  describe('post', () => {
    it('should send POST request with auth headers and data', () => {
      const data = { name: 'test' };
      service.post('/api/test', data).subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      expect(req.request.body).toEqual(data);
      req.flush({});
    });
  });

  describe('put', () => {
    it('should send PUT request with auth headers and data', () => {
      const data = { name: 'updated' };
      service.put('/api/test/1', data).subscribe();

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      expect(req.request.body).toEqual(data);
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should send DELETE request with auth headers', () => {
      service.delete('/api/test/1').subscribe();

      const req = httpMock.expectOne('/api/test/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });
  });
});
