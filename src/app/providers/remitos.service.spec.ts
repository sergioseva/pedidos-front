import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RemitosService } from './remitos.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService, createRemitoItem, createDistribuidora } from '../testing/test-helpers';
import { of } from 'rxjs';
import { RemitoModel } from '../models/remito.model';
import { RemitoItemModel } from '../models/remito-item.model';
import { DistribuidoraModel } from '../models/distribuidora.model';

describe('RemitosService', () => {
  let service: RemitosService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RemitosService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(RemitosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buscarRemitos', () => {
    it('should call correct search URL with params', () => {
      chttp.get.and.returnValue(of([]));

      service.buscarRemitos('test', '2024-01-01', '2024-01-31');

      expect(chttp.get).toHaveBeenCalledWith(
        'http://test-api/remitos/search/findByAny?parametro=test&fechaDesde=2024-01-01&fechaHasta=2024-01-31'
      );
    });
  });

  describe('getRemito', () => {
    it('should call correct URL with id', () => {
      chttp.get.and.returnValue(of({}));

      service.getRemito(5);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/remitos/5');
    });
  });

  describe('changeRemito', () => {
    it('should update BehaviorSubject', () => {
      const remito = new RemitoModel();

      service.changeRemito(remito);

      let currentRemito: RemitoModel;
      service.currentRemito.subscribe(r => currentRemito = r);
      expect(currentRemito).toBe(remito);
    });
  });

  describe('addRemitoItem', () => {
    it('should add a new item', () => {
      const item = createRemitoItem({ ri_isbn: 'ISBN1', ri_precio: 100, ri_cantidad: 1 });

      service.addRemitoItem(item);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(1);
    });

    it('should increment ri_cantidad for duplicate ri_isbn', () => {
      const item1 = createRemitoItem({ ri_isbn: 'DUP', ri_precio: 100, ri_cantidad: 1 });
      const item2 = createRemitoItem({ ri_isbn: 'DUP', ri_precio: 100, ri_cantidad: 1 });

      service.addRemitoItem(item1);
      service.addRemitoItem(item2);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(1);
      expect(remito.items[0].ri_cantidad).toBe(2);
    });

    it('should add as new when ri_isbn is falsy', () => {
      const item1 = createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'A' });
      const item2 = createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'B' });

      service.addRemitoItem(item1);
      service.addRemitoItem(item2);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(2);
    });

    it('should not add when finalizado is true', () => {
      service.finalizarRemito();

      service.addRemitoItem(createRemitoItem());

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(0);
    });
  });

  describe('removeRemitoItem', () => {
    it('should remove an item', () => {
      const item = createRemitoItem();
      service.addRemitoItem(item);

      service.removeRemitoItem(item);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(0);
    });

    it('should not remove when finalizado is true', () => {
      const item = createRemitoItem();
      service.addRemitoItem(item);
      service.finalizarRemito();

      service.removeRemitoItem(item);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(1);
    });
  });

  describe('finalizarRemito', () => {
    it('should set finalizado to true', () => {
      service.finalizarRemito();

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.finalizado).toBe(true);
    });
  });

  describe('generarNuevoRemito', () => {
    it('should reset to a new RemitoModel', () => {
      service.addRemitoItem(createRemitoItem());

      service.generarNuevoRemito();

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(0);
      expect(remito.finalizado).toBe(false);
    });
  });

  describe('asignarDatos', () => {
    it('should set distribuidora, observaciones, and fecha', () => {
      const dist = createDistribuidora();

      service.asignarDatos(dist, 'test notes');

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.re_distribuidora_ed).toBe(dist);
      expect(remito.re_observaciones).toBe('test notes');
      expect(remito.re_fecha).toBeTruthy();
    });
  });

  describe('grabarRemito', () => {
    it('should POST the current remito', () => {
      chttp.post.and.returnValue(of({ re_remito_k: 1 }));

      service.grabarRemito().subscribe();

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/remitos', jasmine.any(RemitoModel));
    });
  });

  describe('deleteRemito', () => {
    it('should DELETE with id', () => {
      chttp.delete.and.returnValue(of({}));

      service.deleteRemito(5);

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/remitos/5');
    });
  });
});
