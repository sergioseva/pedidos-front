import { TestBed } from '@angular/core/testing';
import { ClientesServiceService } from './clientes-service.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockConfigService, createCliente } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('ClientesServiceService', () => {
  let service: ClientesServiceService;
  let chttp: any;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      providers: [
        ClientesServiceService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(ClientesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClientes', () => {
    it('should call correct URL with sort param', () => {
      chttp.get.and.returnValue(of({ _embedded: { clientes: [] }, page: {} }));

      service.getClientes().subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/clientes?sort=id,desc');
    });
  });

  describe('getCliente', () => {
    it('should call correct URL with id', () => {
      chttp.get.and.returnValue(of({}));

      service.getCliente(5);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/clientes/5');
    });
  });

  describe('getClientesPage', () => {
    it('should call correct URL with page number', () => {
      chttp.get.and.returnValue(of({ _embedded: { clientes: [] }, page: {} }));

      service.getClientesPage(2).subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/clientes?page=2&sort=id,desc');
    });
  });

  describe('getClientesPorCualquier', () => {
    it('should call correct search URL', () => {
      chttp.get.and.returnValue(of([]));

      service.getClientesPorCualquier('mario').subscribe();

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/clientes/search/findByAny?parametro=mario');
    });
  });

  describe('insertCliente', () => {
    it('should POST to clientes URL', () => {
      const cliente = createCliente();
      chttp.post.and.returnValue(of(cliente));

      service.insertCliente(cliente).subscribe();

      expect(chttp.post).toHaveBeenCalledWith('http://test-api/clientes', cliente);
    });
  });

  describe('updateCliente', () => {
    it('should PUT to clientes URL with id', () => {
      const cliente = createCliente();
      chttp.put.and.returnValue(of(cliente));

      service.updateCliente(5, cliente).subscribe();

      expect(chttp.put).toHaveBeenCalledWith('http://test-api/clientes/5', cliente);
    });
  });

  describe('deleteCliente', () => {
    it('should DELETE with id', () => {
      chttp.delete.and.returnValue(of({}));

      service.deleteCliente(5).subscribe();

      expect(chttp.delete).toHaveBeenCalledWith('http://test-api/clientes/5');
    });
  });

  describe('checkPedidos', () => {
    it('should call correct URL', () => {
      chttp.get.and.returnValue(of(false));

      service.checkPedidos(5);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/clientes/checkPedidos/5');
    });
  });
});
