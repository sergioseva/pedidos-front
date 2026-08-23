import { TestBed } from '@angular/core/testing';
import { ComercioService } from './comercio.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';
import { ComercioModel } from '../models/comercio.model';

describe('ComercioService', () => {
  let service: ComercioService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      providers: [
        ComercioService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(ComercioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET the comercios list', () => {
    chttp.get.and.returnValue(of([]));

    service.getComercios().subscribe();

    expect(chttp.get).toHaveBeenCalledWith('http://test-api/comercios');
  });

  it('should GET one comercio by id', () => {
    chttp.get.and.returnValue(of({}));

    service.getComercio(3);

    expect(chttp.get).toHaveBeenCalledWith('http://test-api/comercios/3');
  });

  it('should search with the findByAny endpoint', () => {
    chttp.get.and.returnValue(of([]));

    service.buscarComercios('hotel').subscribe();

    expect(chttp.get).toHaveBeenCalledWith('http://test-api/comercios/search/findByAny?parametro=hotel');
  });

  it('should POST a new comercio', () => {
    const comercio = new ComercioModel(null, 'Hotel Costa Azul');

    service.insertComercio(comercio);

    expect(chttp.post).toHaveBeenCalledWith('http://test-api/comercios', comercio);
  });

  it('should PUT an existing comercio', () => {
    const comercio = new ComercioModel(3, 'Hotel Costa Azul');

    service.updateComercio(3, comercio);

    expect(chttp.put).toHaveBeenCalledWith('http://test-api/comercios/3', comercio);
  });

  it('should DELETE by id', () => {
    service.deleteComercio(3);

    expect(chttp.delete).toHaveBeenCalledWith('http://test-api/comercios/3');
  });
});
