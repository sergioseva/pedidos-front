import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UsuariosComponent } from './usuarios.component';
import { UsuariosService } from '../../providers/usuarios.service';
import { of } from 'rxjs';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let usuariosService: any;

  const mockUsuarios = [
    { id: 1, name: 'Admin User', username: 'admin', email: 'admin@test.com', role: 'ROLE_ADMIN' },
    { id: 2, name: 'Normal User', username: 'user', email: 'user@test.com', role: 'ROLE_USER' }
  ];

  beforeEach(waitForAsync(() => {
    usuariosService = {
      getUsuarios: jasmine.createSpy('getUsuarios').and.returnValue(of(mockUsuarios)),
      deleteUsuario: jasmine.createSpy('deleteUsuario').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      declarations: [UsuariosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UsuariosService, useValue: usuariosService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load usuarios on init', () => {
    expect(component.usuarios.length).toBe(2);
  });

  describe('buscarUsuario', () => {
    it('should filter by name', () => {
      component.buscarUsuario('admin');
      expect(component.usuarios.length).toBe(1);
      expect(component.usuarios[0].username).toBe('admin');
    });

    it('should reload all when term is empty', () => {
      usuariosService.getUsuarios.calls.reset();
      component.buscarUsuario('');
      expect(usuariosService.getUsuarios).toHaveBeenCalled();
    });
  });

  describe('getRolLabel', () => {
    it('should return Admin for ROLE_ADMIN', () => {
      expect(component.getRolLabel('ROLE_ADMIN')).toBe('Admin');
    });

    it('should return Usuario for ROLE_USER', () => {
      expect(component.getRolLabel('ROLE_USER')).toBe('Usuario');
    });
  });
});
