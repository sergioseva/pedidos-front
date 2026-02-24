import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ClientesComponent } from './clientes.component';
import { ClientesServiceService } from '../../providers/clientes-service.service';
import { ActivatedRoute } from '@angular/router';
import { mockActivatedRoute } from '../../testing/test-helpers';
import { of } from 'rxjs';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;
  let clientesService: any;

  const halResponse = {
    _embedded: {
      clientes: [
        { id: 1, nombre: 'Client A' },
        { id: 2, nombre: 'Client B' }
      ]
    },
    page: {
      totalPages: 3,
      totalElements: 25,
      first: true,
      prev: null,
      next: '/clientes?page=1',
      last: '/clientes?page=2'
    }
  };

  beforeEach(async(() => {
    clientesService = {
      getClientes: jasmine.createSpy('getClientes').and.returnValue(of(halResponse)),
      getClientesPage: jasmine.createSpy('getClientesPage').and.returnValue(of(halResponse)),
      getClientesPorCualquier: jasmine.createSpy('getClientesPorCualquier').and.returnValue(of([])),
      checkPedidos: jasmine.createSpy('checkPedidos').and.returnValue(of(false)),
      deleteCliente: jasmine.createSpy('deleteCliente').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      declarations: [ClientesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ClientesServiceService, useValue: clientesService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute({}) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse HAL response on init', () => {
    expect(component.clientes.length).toBe(2);
    expect(component.totalPages).toBe(3);
    expect(component.total).toBe(25);
    expect(component.currentPage).toBe(1);
  });

  describe('setPage', () => {
    it('should call getClientesPage with page number', () => {
      component.setPage(2);
      expect(clientesService.getClientesPage).toHaveBeenCalledWith(2);
    });
  });

  describe('buscarCliente', () => {
    it('should search by term', () => {
      clientesService.getClientesPorCualquier.and.returnValue(of([{ id: 1, nombre: 'Found' }]));

      component.buscarCliente('test');

      expect(clientesService.getClientesPorCualquier).toHaveBeenCalledWith('test');
    });

    it('should reload all clients when term is empty', () => {
      component.buscarCliente('');

      expect(clientesService.getClientes).toHaveBeenCalled();
    });
  });
});
