import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfiguracionComponent } from './configuracion.component';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { mockConfiguracionService } from '../../testing/test-helpers';
import { of } from 'rxjs';
import { ConfiguracionModel } from '../../models/configuracion.model';

describe('ConfiguracionComponent', () => {
  let component: ConfiguracionComponent;
  let fixture: ComponentFixture<ConfiguracionComponent>;
  let configuracionService: any;

  beforeEach(waitForAsync(() => {
    configuracionService = mockConfiguracionService();
    const config = new ConfiguracionModel();
    config.nombre = 'Test Store';
    config.direccion = 'Test Addr';
    config.telefono = '123';
    config.hasLogo = false;
    configuracionService.getConfiguracion.and.returnValue(of(config));

    TestBed.configureTestingModule({
      declarations: [ConfiguracionComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConfiguracionService, useValue: configuracionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration on init', () => {
    expect(component.forma.controls.nombre.value).toBe('Test Store');
    expect(component.forma.controls.direccion.value).toBe('Test Addr');
  });

  it('should require nombre', () => {
    component.forma.controls.nombre.setValue('');
    expect(component.forma.controls.nombre.valid).toBe(false);
  });

  describe('onSubmit', () => {
    it('should call updateConfiguracion', () => {
      configuracionService.updateConfiguracion.and.returnValue(of(new ConfiguracionModel()));
      component.onSubmit();
      expect(configuracionService.updateConfiguracion).toHaveBeenCalled();
    });
  });

  describe('deleteLogo', () => {
    it('should call deleteLogo and reset state', () => {
      configuracionService.deleteLogo.and.returnValue(of({}));
      component.configuracion.hasLogo = true;

      component.deleteLogo();

      expect(configuracionService.deleteLogo).toHaveBeenCalled();
      expect(component.configuracion.hasLogo).toBe(false);
    });
  });
});
