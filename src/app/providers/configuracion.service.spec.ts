import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfiguracionService } from './configuracion.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';
import { ConfiguracionModel } from '../models/configuracion.model';

describe('ConfiguracionService', () => {
  let service: ConfiguracionService;
  let chttp: any;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ConfiguracionService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(ConfiguracionService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfiguracion', () => {
    it('should GET via raw HttpClient', () => {
      service.getConfiguracion().subscribe();

      const req = httpMock.expectOne('http://test-api/configuracion');
      expect(req.request.method).toBe('GET');
      req.flush(new ConfiguracionModel());
    });
  });

  describe('updateConfiguracion', () => {
    it('should PUT via chttp', () => {
      const config = new ConfiguracionModel();
      chttp.put.and.returnValue(of(config));

      service.updateConfiguracion(config).subscribe();

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/configuracion', config);
    });
  });

  describe('getLogoUrl', () => {
    it('should return correct URL', () => {
      expect(service.getLogoUrl()).toBe('http://test-api/configuracion/logo');
    });
  });

  describe('deleteLogo', () => {
    it('should DELETE via chttp', () => {
      chttp.delete.and.returnValue(of({}));

      service.deleteLogo().subscribe();

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/configuracion/logo');
    });
  });
});
