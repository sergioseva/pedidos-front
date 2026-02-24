import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';
import { UsuarioModel } from '../models/usuario.model';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let chttp: any;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UsuariosService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validarEmail', () => {
    it('should call correct URL via raw HttpClient', () => {
      service.validarEmail('test@test.com').subscribe();

      const req = httpMock.expectOne('http://test-api/user/checkEmailAvailability?email=test@test.com');
      expect(req.request.method).toBe('GET');
      req.flush({ available: true });
    });
  });

  describe('validarUser', () => {
    it('should call correct URL via raw HttpClient', () => {
      service.validarUser('testuser').subscribe();

      const req = httpMock.expectOne('http://test-api/user/checkUsernameAvailability?username=testuser');
      expect(req.request.method).toBe('GET');
      req.flush({ available: true });
    });
  });

  describe('registrarUser', () => {
    it('should POST via chttp', () => {
      const usuario = new UsuarioModel({ username: 'test', email: 'test@test.com' });
      chttp.post.and.returnValue(of({}));

      service.registrarUser(usuario);

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/auth/signup', usuario);
    });
  });

  describe('getUsuarios', () => {
    it('should GET via chttp', () => {
      chttp.get.and.returnValue(of([]));

      service.getUsuarios();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/admin/users');
    });
  });

  describe('getUsuario', () => {
    it('should GET via chttp with id', () => {
      chttp.get.and.returnValue(of({}));

      service.getUsuario(5);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/admin/users/5');
    });
  });

  describe('updateUsuario', () => {
    it('should PUT via chttp with id', () => {
      const data = { name: 'Updated' };
      chttp.put.and.returnValue(of({}));

      service.updateUsuario(5, data);

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/admin/users/5', data);
    });
  });

  describe('deleteUsuario', () => {
    it('should DELETE via chttp with id', () => {
      chttp.delete.and.returnValue(of({}));

      service.deleteUsuario(5);

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/admin/users/5');
    });
  });
});
