import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfiguracionRemitoComponent } from './configuracion-remito.component';
import { ConfiguracionRemitoService } from '../../providers/configuracion-remito.service';
import { of } from 'rxjs';
import { ConfiguracionRemitoModel } from '../../models/configuracion-remito.model';

describe('ConfiguracionRemitoComponent', () => {
  let component: ConfiguracionRemitoComponent;
  let fixture: ComponentFixture<ConfiguracionRemitoComponent>;
  let configuracionRemitoService: any;

  beforeEach(async(() => {
    const config = new ConfiguracionRemitoModel();
    config.remitente = 'Test Sender';

    configuracionRemitoService = {
      getConfiguracion: jasmine.createSpy('getConfiguracion').and.returnValue(of(config)),
      updateConfiguracion: jasmine.createSpy('updateConfiguracion').and.returnValue(of(config))
    };

    TestBed.configureTestingModule({
      declarations: [ConfiguracionRemitoComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConfiguracionRemitoService, useValue: configuracionRemitoService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionRemitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load config on init', () => {
    expect(component.forma.controls.remitente.value).toBe('Test Sender');
  });

  it('should require remitente', () => {
    component.forma.controls.remitente.setValue('');
    expect(component.forma.controls.remitente.valid).toBe(false);
  });

  describe('onSubmit', () => {
    it('should call updateConfiguracion', () => {
      component.forma.controls.remitente.setValue('Updated');
      component.onSubmit();
      expect(configuracionRemitoService.updateConfiguracion).toHaveBeenCalled();
    });
  });
});
