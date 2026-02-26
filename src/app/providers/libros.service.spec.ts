import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LibrosService } from './libros.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService, createLibro } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('LibrosService', () => {
  let service: LibrosService;
  let chttp: any;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LibrosService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(LibrosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buscarLibros', () => {
    it('should call correct URL via chttp', () => {
      chttp.get.and.returnValue(of([]));

      service.buscarLibros('quijote');

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/catalogos/search/findByAny?parametro=quijote&page=0&size=20&sort=descripcion,asc');
    });
  });

  describe('buscarImagen', () => {
    it('should call OpenLibrary API via raw HttpClient', () => {
      const libro = createLibro({ isbn: '1234567890' });

      service.buscarImagen(libro).subscribe();

      const req = httpMock.expectOne('https://openlibrary.org/api/books?bibkeys=ISBN:1234567890&jscmd=data');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('insertLibro', () => {
    it('should POST via chttp', () => {
      const libro = createLibro();
      chttp.post.and.returnValue(of(libro));

      service.insertLibro(libro);

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/catalogos', libro);
    });
  });

  describe('updateLibro', () => {
    it('should PUT via chttp with id', () => {
      const libro = createLibro({ id: 5 });
      chttp.put.and.returnValue(of(libro));

      service.updateLibro(libro);

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/catalogos/5', libro);
    });
  });

  describe('deleteLibro', () => {
    it('should DELETE via chttp with id', () => {
      const libro = createLibro({ id: 5 });
      chttp.delete.and.returnValue(of({}));

      service.deleteLibro(libro).subscribe();

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/catalogos/5');
    });
  });
});
