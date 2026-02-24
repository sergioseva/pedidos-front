import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioComponent } from './usuario.component';
import { UsuariosService } from '../../providers/usuarios.service';
import { Router, ActivatedRoute } from '@angular/router';
import { mockRouter, mockActivatedRoute } from '../../testing/test-helpers';
import { of } from 'rxjs';

describe('UsuarioComponent', () => {
  let component: UsuarioComponent;
  let fixture: ComponentFixture<UsuarioComponent>;
  let usuariosService: any;
  let router: any;

  function createComponent(routeParams: any = { id: 'nuevo' }) {
    usuariosService = {
      validarEmail: jasmine.createSpy('validarEmail').and.returnValue(of({ available: true })),
      validarUser: jasmine.createSpy('validarUser').and.returnValue(of({ available: true })),
      registrarUser: jasmine.createSpy('registrarUser').and.returnValue(of({})),
      getUsuario: jasmine.createSpy('getUsuario').and.returnValue(of({
        name: 'Test', username: 'testuser', email: 'test@test.com', role: 'ROLE_USER'
      })),
      updateUsuario: jasmine.createSpy('updateUsuario').and.returnValue(of({}))
    };
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [UsuarioComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UsuariosService, useValue: usuariosService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(routeParams) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    if (fixture) { fixture.destroy(); }
    TestBed.resetTestingModule();
  });

  describe('new mode', () => {
    beforeEach(waitForAsync(() => {
      createComponent({ id: 'nuevo' });
    }));

    it('should create in new mode', () => {
      expect(component).toBeTruthy();
      expect(component.isNew).toBe(true);
    });

    it('should require all fields', () => {
      expect(component.forma.controls.email.valid).toBe(false);
      expect(component.forma.controls.name.valid).toBe(false);
      expect(component.forma.controls.username.valid).toBe(false);
      expect(component.forma.controls.password.valid).toBe(false);
      expect(component.forma.controls.role.valid).toBe(false);
    });

    it('should validate email pattern', () => {
      component.forma.controls.email.setValue('invalid');
      expect(component.forma.controls.email.valid).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(waitForAsync(() => {
      createComponent({ id: '1' });
    }));

    it('should load user data', () => {
      expect(usuariosService.getUsuario).toHaveBeenCalledWith('1');
      expect(component.isNew).toBe(false);
    });

    it('should not require password in edit mode', () => {
      expect(component.forma.controls.password.valid).toBe(true);
    });
  });
});
