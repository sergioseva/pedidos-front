import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroComponent } from './registro.component';
import { UsuariosService } from '../../providers/usuarios.service';
import { Router } from '@angular/router';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { mockRouter, mockConfiguracionService } from '../../testing/test-helpers';
import { of } from 'rxjs';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let usuariosService: any;
  let router: any;

  beforeEach(async(() => {
    usuariosService = {
      validarEmail: jasmine.createSpy('validarEmail').and.returnValue(of({ available: true })),
      validarUser: jasmine.createSpy('validarUser').and.returnValue(of({ available: true })),
      registrarUser: jasmine.createSpy('registrarUser').and.returnValue(of({}))
    };
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [RegistroComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UsuariosService, useValue: usuariosService },
        { provide: Router, useValue: router },
        { provide: ConfiguracionService, useValue: mockConfiguracionService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required form fields', () => {
    expect(component.formRegistrar.controls.email).toBeTruthy();
    expect(component.formRegistrar.controls.name).toBeTruthy();
    expect(component.formRegistrar.controls.username).toBeTruthy();
    expect(component.formRegistrar.controls.password).toBeTruthy();
    expect(component.formRegistrar.controls.role).toBeTruthy();
  });

  it('should require email in correct format', () => {
    component.formRegistrar.controls.email.setValue('invalid');
    expect(component.formRegistrar.controls.email.valid).toBe(false);
  });

  it('should require name with min length 3', () => {
    component.formRegistrar.controls.name.setValue('ab');
    expect(component.formRegistrar.controls.name.valid).toBe(false);

    component.formRegistrar.controls.name.setValue('abc');
    expect(component.formRegistrar.controls.name.valid).toBe(true);
  });

  it('should validate password confirmation matches', () => {
    component.formRegistrar.controls.password.setValue('pass123');
    component.formRegistrar.controls.password2.setValue('different');
    component.formRegistrar.controls.password2.updateValueAndValidity();

    expect(component.formRegistrar.controls.password2.valid).toBe(false);
  });

  it('should accept matching passwords', () => {
    component.formRegistrar.controls.password.setValue('pass123');
    component.formRegistrar.controls.password2.setValue('pass123');
    component.formRegistrar.controls.password2.updateValueAndValidity();

    expect(component.formRegistrar.controls.password2.errors).toBeNull();
  });
});
