import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PedidosService } from './pedidos.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService, createPedidoItem } from '../testing/test-helpers';
import { of } from 'rxjs';
import { PedidoItemModel } from '../models/pedido.item';
import { PedidoModel } from '../models/pedido.model';
import { ClienteModel } from '../models/cliente.model';

describe('PedidosService', () => {
  let service: PedidosService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PedidosService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(PedidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPedidos', () => {
    it('should call chttp.get and extract _embedded.pedidoes', () => {
      const mockPedidos = [{ id: 1 }, { id: 2 }];
      chttp.get.and.returnValue(of({ _embedded: { pedidoes: mockPedidos } }));

      service.getPedidos().subscribe(result => {
        expect(result).toEqual(mockPedidos);
      });

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/pedidos');
    });
  });

  describe('buscarPedidos', () => {
    it('should build correct search URL with params', () => {
      chttp.get.and.returnValue(of([]));

      service.buscarPedidos('test', '2024-01-01', '2024-01-31');

      expect(chttp.get).toHaveBeenCalledWith(
        'http://test-api/pedidos/search/findByAny?parametro=test&fechaDesde=2024-01-01&fechaHasta=2024-01-31'
      );
    });
  });

  describe('changePedido', () => {
    it('should update BehaviorSubject and call calcularTotal', () => {
      const pedido = new PedidoModel();
      spyOn(pedido, 'calcularTotal');

      service.changePedido(pedido);

      let currentPedido: PedidoModel;
      service.currentPedido.subscribe(p => currentPedido = p);
      expect(currentPedido).toBe(pedido);
      expect(pedido.calcularTotal).toHaveBeenCalled();
    });
  });

  describe('addPedidoItem', () => {
    it('should add a new item to the pedido', () => {
      const item = createPedidoItem({ codigoLuongo: 'ABC', precio: 100, cantidad: 1 });

      service.addPedidoItem(item);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(1);
    });

    it('should increment cantidad for duplicate codigoLuongo', () => {
      const item1 = createPedidoItem({ codigoLuongo: 'DUP', precio: 100, cantidad: 1 });
      const item2 = createPedidoItem({ codigoLuongo: 'DUP', precio: 100, cantidad: 1 });

      service.addPedidoItem(item1);
      service.addPedidoItem(item2);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(1);
      expect(pedido.pedidoItems[0].cantidad).toBe(2);
    });

    it('should add as new item when codigoLuongo is falsy', () => {
      const item1 = createPedidoItem({ codigoLuongo: '', libro: 'Book A', precio: 100, cantidad: 1 });
      const item2 = createPedidoItem({ codigoLuongo: '', libro: 'Book B', precio: 200, cantidad: 1 });

      service.addPedidoItem(item1);
      service.addPedidoItem(item2);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(2);
    });

    it('should not add when finalizado is true', () => {
      service.finalizarPedido();

      const item = createPedidoItem();
      service.addPedidoItem(item);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(0);
    });
  });

  describe('removePedidoItem', () => {
    it('should remove an item', () => {
      const item = createPedidoItem();
      service.addPedidoItem(item);

      service.removePedidoItem(item);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(0);
    });

    it('should not remove when finalizado is true', () => {
      const item = createPedidoItem();
      service.addPedidoItem(item);
      service.finalizarPedido();

      service.removePedidoItem(item);

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(1);
    });
  });

  describe('finalizarPedido', () => {
    it('should set finalizado to true', () => {
      service.finalizarPedido();

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.finalizado).toBe(true);
    });
  });

  describe('generarNuevoPedido', () => {
    it('should reset to a new PedidoModel', () => {
      const item = createPedidoItem();
      service.addPedidoItem(item);

      service.generarNuevoPedido();

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.pedidoItems.length).toBe(0);
      expect(pedido.finalizado).toBe(false);
    });
  });

  describe('asignarDatos', () => {
    it('should set cliente, senia, and observaciones', () => {
      const cliente = new ClienteModel();
      cliente.nombre = 'Test';

      service.asignarDatos(cliente, 500, 'notes');

      let pedido: PedidoModel;
      service.currentPedido.subscribe(p => pedido = p);
      expect(pedido.cliente).toBe(cliente);
      expect(pedido.senia).toBe(500);
      expect(pedido.observaciones).toBe('notes');
    });
  });

  describe('grabarPedido', () => {
    it('should POST the current pedido', () => {
      chttp.post.and.returnValue(of({ id: 1 }));

      service.grabarPedido().subscribe();

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/pedidos', jasmine.any(PedidoModel));
    });
  });
});
