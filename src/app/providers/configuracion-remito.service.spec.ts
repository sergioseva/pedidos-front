import { TestBed } from '@angular/core/testing';
import { ConfiguracionRemitoService } from './configuracion-remito.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';
import { ConfiguracionRemitoModel } from '../models/configuracion-remito.model';

describe('ConfiguracionRemitoService', () => {
  let service: ConfiguracionRemitoService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      providers: [
        ConfiguracionRemitoService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(ConfiguracionRemitoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfiguracion', () => {
    it('should GET via chttp', () => {
      chttp.get.and.returnValue(of(new ConfiguracionRemitoModel()));

      service.getConfiguracion().subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/configuracion-remito');
    });
  });

  describe('updateConfiguracion', () => {
    it('should PUT via chttp', () => {
      const config = new ConfiguracionRemitoModel();
      config.remitente = 'Test';
      chttp.put.and.returnValue(of(config));

      service.updateConfiguracion(config).subscribe();

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/configuracion-remito', config);
    });
  });
});
