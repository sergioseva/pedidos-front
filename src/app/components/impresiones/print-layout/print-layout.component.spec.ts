import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PrintLayoutComponent } from './print-layout.component';
import { ConfigService } from '../../../providers/config.service';
import { ConfiguracionService } from '../../../providers/configuracion.service';
import { Router } from '@angular/router';
import { mockConfigService, mockRouter, mockConfiguracionService } from '../../../testing/test-helpers';
import { of } from 'rxjs';
import { ConfiguracionModel } from '../../../models/configuracion.model';

describe('PrintLayoutComponent', () => {
  let component: PrintLayoutComponent;
  let fixture: ComponentFixture<PrintLayoutComponent>;
  let configuracionService: any;

  beforeEach(waitForAsync(() => {
    configuracionService = mockConfiguracionService();
    const config = new ConfiguracionModel();
    config.nombre = 'Test Store';
    config.direccion = 'Test Addr';
    config.telefono = '123';
    config.hasLogo = true;
    configuracionService.getConfiguracion.and.returnValue(of(config));

    TestBed.configureTestingModule({
      declarations: [PrintLayoutComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConfigService, useValue: mockConfigService() },
        { provide: Router, useValue: { ...mockRouter(), url: '/print/printpedido/1' } },
        { provide: ConfiguracionService, useValue: configuracionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration values', () => {
    expect(component.nombre).toBe('Test Store');
    expect(component.direccion).toBe('Test Addr');
    expect(component.telefono).toBe('123');
    expect(component.showLogo).toBe(true);
  });

  it('should hide logo on error', () => {
    component.showLogo = true;
    component.onLogoError();
    expect(component.showLogo).toBe(false);
  });

  describe('encabezado segun el documento', () => {
    function conUrl(url: string) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [PrintLayoutComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: ConfigService, useValue: mockConfigService() },
          { provide: ConfiguracionService, useValue: configuracionService },
          { provide: Router, useValue: { ...mockRouter(), url } }
        ]
      });
      const f = TestBed.createComponent(PrintLayoutComponent);
      f.detectChanges();
      return f.componentInstance;
    }

    it('titles a pedido and keeps its footer', () => {
      const c = conUrl('/print/printpedido/1');
      expect(c.titulo).toBe('NOTA DE PEDIDO');
      expect(c.isPedido).toBeTrue();
    });

    it('titles a remito without the pedido footer', () => {
      const c = conUrl('/print/printremito/1');
      expect(c.titulo).toBe('REMITO');
      expect(c.isPedido).toBeFalse();
    });

    it('titles a consignment detail without the pedido footer', () => {
      const c = conUrl('/print/printestadocuenta/1');
      expect(c.titulo).toBe('DETALLE DE CONSIGNACION');
      expect(c.isPedido).toBeFalse();
    });

    /** Sin este caso el recibo caia en el default y salia titulado "NOTA DE PEDIDO". */
    it('titles a recibo without the pedido footer', () => {
      const c = conUrl('/print/printrecibo/1');
      expect(c.titulo).toBe('RECIBO DE PAGO');
      expect(c.isPedido).toBeFalse();
    });
  });
});
