import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ClientesComponent } from './clientes.component';
import { ClientesServiceService } from '../../providers/clientes-service.service';
import { ActivatedRoute } from '@angular/router';
import { mockActivatedRoute } from '../../testing/test-helpers';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;
  let clientesService: any;

  const halResponse = {
    _embedded: {
      clientes: [
        { id: 1, nombre: 'Client A', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-02T10:00:00Z' },
        { id: 2, nombre: 'Client B', createdAt: '2026-07-03T10:00:00Z', updatedAt: '2026-07-01T10:00:00Z' }
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

  beforeEach(waitForAsync(() => {
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

  it('should load with the default sort on init', () => {
    expect(clientesService.getClientes).toHaveBeenCalledWith('id,desc');
  });

  describe('setPage', () => {
    it('should call getClientesPage with page number and the active sort', () => {
      component.setPage(2);
      expect(clientesService.getClientesPage).toHaveBeenCalledWith(2, 'id,desc');
    });
  });

  describe('toggleSort', () => {
    it('sorts a new column ascending and requeries the server from page 1', () => {
      clientesService.getClientes.calls.reset();
      component.toggleSort('nombre');

      expect(component.sortField).toBe('nombre');
      expect(component.sortDir).toBe('asc');
      // Server-side, because the list is paginated -- a local sort would only touch the current page.
      expect(clientesService.getClientes).toHaveBeenCalledWith('nombre,asc');
    });

    it('flips direction on a second click of the same column', () => {
      component.toggleSort('createdAt');
      component.toggleSort('createdAt');
      expect(component.sortDir).toBe('desc');
      expect(clientesService.getClientes).toHaveBeenCalledWith('createdAt,desc');
    });

    it('sorts by updatedAt', () => {
      component.toggleSort('updatedAt');
      expect(clientesService.getClientes).toHaveBeenCalledWith('updatedAt,asc');
    });

    it('sorts search results in place without hitting the server', () => {
      component.buscarCliente('test');   // search mode
      clientesService.getClientes.calls.reset();
      component.clientes = [{ nombre: 'B' }, { nombre: 'A' }];

      component.toggleSort('nombre');

      expect(clientesService.getClientes).not.toHaveBeenCalled();
      expect(component.clientes.map((c: any) => c.nombre)).toEqual(['A', 'B']);
    });
  });

  describe('sortIcon', () => {
    it('shows a neutral icon for an unsorted column and a direction for the active one', () => {
      component.sortField = 'nombre';
      component.sortDir = 'asc';
      expect(component.sortIcon('createdAt')).toBe('fa-sort');
      expect(component.sortIcon('nombre')).toBe('fa-sort-asc');
      component.sortDir = 'desc';
      expect(component.sortIcon('nombre')).toBe('fa-sort-desc');
    });
  });

  describe('borrarCliente', () => {
    // Regression: the delete used to splice a stale/undefined index and drop the FIRST row from the
    // display regardless of which client was deleted. It must remove the actual client, by id.
    it('removes the deleted client by id, not the first row', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: true } as any));
      component.clientes = [{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }];

      component.borrarCliente({ id: 2, nombre: 'B' } as any);
      await Promise.resolve();   // confirm resolves
      await Promise.resolve();   // delete subscribe runs

      expect(clientesService.deleteCliente).toHaveBeenCalledWith(2);
      expect(component.clientes.map((c: any) => c.id)).toEqual([1, 3]);
    });

    it('does not delete when the confirmation is dismissed', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ value: false } as any));
      component.clientes = [{ id: 1, nombre: 'A' }];
      component.borrarCliente({ id: 1, nombre: 'A' } as any);
      await Promise.resolve();
      expect(clientesService.deleteCliente).not.toHaveBeenCalled();
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
