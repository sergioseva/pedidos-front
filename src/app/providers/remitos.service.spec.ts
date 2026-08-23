import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RemitosService } from './remitos.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService, createRemitoItem, createDistribuidora } from '../testing/test-helpers';
import { of } from 'rxjs';
import { RemitoModel, TIPO_CONSIGNACION } from '../models/remito.model';
import { RemitoItemModel } from '../models/remito-item.model';
import { DistribuidoraModel } from '../models/distribuidora.model';
import { ComercioModel } from '../models/comercio.model';

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
        'http://test-api/remitos/search/findByAny?parametro=test&fechaDesde=2024-01-01&fechaHasta=2024-01-31&tipo='
      );
    });

    it('should pass tipo when given', () => {
      chttp.get.and.returnValue(of([]));

      service.buscarRemitos('test', '2024-01-01', '2024-01-31', TIPO_CONSIGNACION);

      expect(chttp.get).toHaveBeenCalledWith(
        'http://test-api/remitos/search/findByAny?parametro=test&fechaDesde=2024-01-01&fechaHasta=2024-01-31&tipo=CONSIGNACION'
      );
    });
  });

  describe('estadoCuentaConsignacion', () => {
    it('should omit the query string when no filter is given', () => {
      chttp.get.and.returnValue(of([]));

      service.estadoCuentaConsignacion(null, '', '');

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/remitos/consignacion/estadocuenta');
    });

    it('should only send the filters that are set', () => {
      chttp.get.and.returnValue(of([]));

      service.estadoCuentaConsignacion(7, '2024-01-01', '');

      expect(chttp.get).toHaveBeenCalledWith(
        'http://test-api/remitos/consignacion/estadocuenta?comercioId=7&fechaDesde=2024-01-01'
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

    it('should add as new when the titles differ and there is no ISBN', () => {
      const item1 = createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'A' });
      const item2 = createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'B' });

      service.addRemitoItem(item1);
      service.addRemitoItem(item2);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(2);
    });

    /**
     * Lo que se reporto: un libro sin ISBN se repetia una linea por clic en vez de sumar. En este
     * catalogo son muchos los que no tienen ISBN.
     */
    it('should increment a book that has no ISBN instead of repeating it', () => {
      service.addRemitoItem(createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'Sin ISBN', ri_cantidad: 1 }));
      service.addRemitoItem(createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'Sin ISBN', ri_cantidad: 1 }));
      service.addRemitoItem(createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'Sin ISBN', ri_cantidad: 1 }));

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(1);
      expect(remito.items[0].ri_cantidad).toBe(3);
    });

    /** Los titulos del catalogo suelen traer espacios adelante. */
    it('should ignore surrounding whitespace and case when matching', () => {
      service.addRemitoItem(createRemitoItem({ ri_isbn: '', ri_nombre_libro: '  El Principito', ri_cantidad: 1 }));
      service.addRemitoItem(createRemitoItem({ ri_isbn: '', ri_nombre_libro: 'EL PRINCIPITO', ri_cantidad: 1 }));

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items.length).toBe(1);
      expect(remito.items[0].ri_cantidad).toBe(2);
    });

    /**
     * Medio catalogo tiene el ISBN en notacion cientifica, asi que libros distintos comparten la
     * cadena: agrupar solo por ISBN los fusionaria en uno.
     */
    it('should keep different titles apart even when they share an ISBN', () => {
      service.addRemitoItem(createRemitoItem({ ri_isbn: '9.78987E+12', ri_nombre_libro: 'Uno' }));
      service.addRemitoItem(createRemitoItem({ ri_isbn: '9.78987E+12', ri_nombre_libro: 'Otro' }));

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

  describe('actualizarCantidad', () => {
    it('should set the quantity and re-emit', () => {
      const item = createRemitoItem({ ri_cantidad: 1 });
      service.addRemitoItem(item);

      service.actualizarCantidad(item, 7);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.items[0].ri_cantidad).toBe(7);
    });

    /** Para sacar el libro esta el boton de borrar; la cantidad nunca baja de 1. */
    it('should never drop below one', () => {
      const item = createRemitoItem({ ri_cantidad: 3 });
      service.addRemitoItem(item);

      service.actualizarCantidad(item, 0);
      expect(item.ri_cantidad).toBe(1);

      service.actualizarCantidad(item, -5);
      expect(item.ri_cantidad).toBe(1);
    });

    it('should truncate a fractional quantity', () => {
      const item = createRemitoItem({ ri_cantidad: 1 });
      service.addRemitoItem(item);

      service.actualizarCantidad(item, 2.9);

      expect(item.ri_cantidad).toBe(2);
    });

    it('should not touch a finalized remito', () => {
      const item = createRemitoItem({ ri_cantidad: 2 });
      service.addRemitoItem(item);
      service.finalizarRemito();

      service.actualizarCantidad(item, 9);

      expect(item.ri_cantidad).toBe(2);
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

    it('should carry the tipo it is given', () => {
      service.generarNuevoRemito(TIPO_CONSIGNACION);

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.re_tipo).toBe(TIPO_CONSIGNACION);
      expect(remito.esConsignacion).toBe(true);
    });
  });

  describe('asignarDatos', () => {
    it('should set distribuidora, observaciones, and fecha', () => {
      const dist = createDistribuidora();

      service.asignarDatos(dist, 'test notes');

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.re_distribuidora_ed).toBe(dist);
      expect(remito.re_comercio_cm).toBeNull();
      expect(remito.re_observaciones).toBe('test notes');
      expect(remito.re_fecha).toBeTruthy();
    });

    it('should set comercio instead of distribuidora on a consignacion', () => {
      service.generarNuevoRemito(TIPO_CONSIGNACION);
      const comercio = new ComercioModel(3, 'Hotel Costa Azul');

      service.asignarDatos(comercio, 'entrega');

      let remito: RemitoModel;
      service.currentRemito.subscribe(r => remito = r);
      expect(remito.re_comercio_cm).toBe(comercio);
      expect(remito.re_distribuidora_ed).toBeNull();
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
