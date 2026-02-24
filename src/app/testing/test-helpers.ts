import { of, BehaviorSubject } from 'rxjs';
import { PedidoModel } from '../models/pedido.model';
import { PedidoItemModel } from '../models/pedido.item';
import { ClienteModel } from '../models/cliente.model';
import { LibroModel } from '../models/libro.model';
import { DistribuidoraModel } from '../models/distribuidora.model';
import { RemitoItemModel } from '../models/remito-item.model';
import { RemitoModel } from '../models/remito.model';
import { ConfiguracionModel } from '../models/configuracion.model';

export function mockConfigService() {
  return {
    baseUrl: 'http://test-api',
    nombre: 'Test Store',
    direccion: 'Test Address',
    telefono: '123456'
  };
}

export function mockAuthService(overrides: any = {}) {
  const loggedIn = new BehaviorSubject<boolean>(false);
  const adminSubject = new BehaviorSubject<boolean>(false);
  const userNameSubject = new BehaviorSubject<string>('');

  return {
    estaAutenticado: jasmine.createSpy('estaAutenticado').and.returnValue(true),
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
    leerToken: jasmine.createSpy('leerToken').and.returnValue('test-token'),
    login: jasmine.createSpy('login').and.returnValue(of({ accessToken: 'token123' })),
    logout: jasmine.createSpy('logout'),
    extractUserFromToken: jasmine.createSpy('extractUserFromToken'),
    nuevoUsuario: jasmine.createSpy('nuevoUsuario').and.returnValue(of({})),
    isLoggedIn: loggedIn.asObservable(),
    isAdmin$: adminSubject.asObservable(),
    userName$: userNameSubject.asObservable(),
    loggedIn,
    adminSubject,
    userNameSubject,
    ...overrides
  };
}

export function mockCustomHttpClient() {
  return {
    get: jasmine.createSpy('get').and.returnValue(of({})),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    put: jasmine.createSpy('put').and.returnValue(of({})),
    delete: jasmine.createSpy('delete').and.returnValue(of({}))
  };
}

export function mockRouter() {
  return {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    url: '/home'
  };
}

export function mockActivatedRoute(params: any = {}, queryParams: any = {}) {
  return {
    params: of(params),
    queryParams: of(queryParams),
    snapshot: {
      params: params,
      queryParamMap: {
        get: (key: string) => queryParams[key] || null
      }
    }
  };
}

export function mockConfiguracionService() {
  return {
    getConfiguracion: jasmine.createSpy('getConfiguracion').and.returnValue(of(new ConfiguracionModel())),
    updateConfiguracion: jasmine.createSpy('updateConfiguracion').and.returnValue(of(new ConfiguracionModel())),
    uploadLogo: jasmine.createSpy('uploadLogo').and.returnValue(of(new ConfiguracionModel())),
    deleteLogo: jasmine.createSpy('deleteLogo').and.returnValue(of({})),
    getLogoUrl: jasmine.createSpy('getLogoUrl').and.returnValue('http://test-api/configuracion/logo')
  };
}

export function mockBsModalService() {
  const modalRef = { hide: jasmine.createSpy('hide') };
  return {
    show: jasmine.createSpy('show').and.returnValue(modalRef),
    _modalRef: modalRef
  };
}

// Model factories

export function createPedidoItem(overrides: Partial<PedidoItemModel> = {}): PedidoItemModel {
  const item = new PedidoItemModel();
  item.codigoLuongo = '123';
  item.libro = 'Test Book';
  item.autor = 'Test Author';
  item.editorial = 'Test Editorial';
  item.isbn = '978-3-16-148410-0';
  item.precio = 100;
  item.cantidad = 1;
  return Object.assign(item, overrides);
}

export function createPedido(overrides: Partial<PedidoModel> = {}): PedidoModel {
  const pedido = new PedidoModel();
  pedido.id = 1;
  pedido.fecha = new Date('2024-01-01');
  pedido.senia = 0;
  pedido.observaciones = '';
  pedido.cliente = createCliente();
  return Object.assign(pedido, overrides);
}

export function createCliente(overrides: Partial<ClienteModel> = {}): ClienteModel {
  const cliente = new ClienteModel();
  cliente.id = 1;
  cliente.nombre = 'Test Client';
  cliente.direccion = 'Test Address';
  cliente.telefonoMovil = '1234567890';
  cliente.telefonoFijo = '';
  cliente.email = 'test@test.com';
  return Object.assign(cliente, overrides);
}

export function createLibro(overrides: Partial<LibroModel> = {}): LibroModel {
  const libro = new LibroModel();
  libro.id = 1;
  libro.codigoLuongo = 100;
  libro.descripcion = 'Test Book';
  libro.autor = 'Test Author';
  libro.editorial = 'Test Editorial';
  libro.isbn = '978-3-16-148410-0';
  libro.precio = 200;
  libro.tema = 'Fiction';
  libro.observaciones = '';
  return Object.assign(libro, overrides);
}

export function createDistribuidora(overrides: Partial<DistribuidoraModel> = {}): DistribuidoraModel {
  const dist = new DistribuidoraModel(1, 'Test Distribuidora', '12345');
  return Object.assign(dist, overrides);
}

export function createRemitoItem(overrides: Partial<RemitoItemModel> = {}): RemitoItemModel {
  const item = new RemitoItemModel();
  item.ri_remito_item_k = 1;
  item.ri_nombre_libro = 'Test Book';
  item.ri_autor = 'Test Author';
  item.ri_editorial = 'Test Editorial';
  item.ri_isbn = '978-3-16-148410-0';
  item.ri_precio = 150;
  item.ri_cantidad = 1;
  item.ri_factura = '';
  item.ri_motivo = '';
  return Object.assign(item, overrides);
}
