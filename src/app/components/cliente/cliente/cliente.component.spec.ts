import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ClienteComponent } from './cliente.component';
import { ClientesServiceService } from '../../../providers/clientes-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { mockRouter, mockActivatedRoute, mockCustomHttpClient } from '../../../testing/test-helpers';
import { of } from 'rxjs';

describe('ClienteComponent', () => {
  let component: ClienteComponent;
  let fixture: ComponentFixture<ClienteComponent>;
  let clientesService: any;
  let router: any;

  function createComponent(routeParams: any = { id: 'nuevo' }) {
    clientesService = {
      getCliente: jasmine.createSpy('getCliente').and.returnValue(of({
        nombre: 'Existing',
        direccion: 'Addr',
        email: 'e@e.com',
        telefonoMovil: '1234567890',
        telefonoFijo: '',
        _links: { self: { href: '/clientes/1' } }
      })),
      insertCliente: jasmine.createSpy('insertCliente').and.returnValue(of({})),
      updateCliente: jasmine.createSpy('updateCliente').and.returnValue(of({}))
    };
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [ClienteComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ClientesServiceService, useValue: clientesService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(routeParams) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    TestBed.resetTestingModule();
  });

  describe('new mode', () => {
    beforeEach(async(() => {
      createComponent({ id: 'nuevo' });
    }));

    it('should create in new mode', () => {
      expect(component).toBeTruthy();
      expect(component.headerText).toBe('Nuevo Cliente');
    });

    it('should have form with required nombre', () => {
      component.forma.controls.nombre.setValue('');
      expect(component.forma.controls.nombre.valid).toBe(false);

      component.forma.controls.nombre.setValue('Test');
      expect(component.forma.controls.nombre.valid).toBe(true);
    });

    it('should validate email pattern', () => {
      component.forma.controls.email.setValue('invalid');
      expect(component.forma.controls.email.valid).toBe(false);

      component.forma.controls.email.setValue('test@test.com');
      expect(component.forma.controls.email.valid).toBe(true);
    });

    it('should validate phone must be 10 digits', () => {
      component.forma.controls.telefonoMovil.setValue('123');
      expect(component.forma.controls.telefonoMovil.valid).toBe(false);

      component.forma.controls.telefonoMovil.setValue('1234567890');
      expect(component.forma.controls.telefonoMovil.valid).toBe(true);
    });

    it('should call insertCliente on submit for new cliente', () => {
      component.forma.patchValue({
        nombre: 'Test',
        telefonoMovil: '1234567890',
        email: 'test@test.com'
      });

      component.onSubmit();

      expect(clientesService.insertCliente).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(async(() => {
      createComponent({ id: '1' });
    }));

    it('should load existing cliente data', () => {
      expect(clientesService.getCliente).toHaveBeenCalledWith('1');
    });

    it('should call updateCliente on submit for existing cliente', () => {
      component.forma.patchValue({
        nombre: 'Updated',
        telefonoMovil: '1234567890'
      });

      component.onSubmit();

      expect(clientesService.updateCliente).toHaveBeenCalledWith('1', jasmine.any(Object));
    });
  });
});
