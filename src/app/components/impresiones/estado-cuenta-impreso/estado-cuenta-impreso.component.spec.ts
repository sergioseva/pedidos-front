import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstadoCuentaImpresoComponent } from './estado-cuenta-impreso.component';
import { RemitosService } from '../../../providers/remitos.service';
import { ComercioService } from '../../../providers/comercio.service';
import { PrintRemitoService } from '../../../providers/print-remito.service';
import { ConfiguracionRemitoService } from '../../../providers/configuracion-remito.service';
import { of, throwError } from 'rxjs';

describe('EstadoCuentaImpresoComponent', () => {
  let fixture: ComponentFixture<EstadoCuentaImpresoComponent>;
  let component: EstadoCuentaImpresoComponent;
  let remitosService: any;
  let comercioService: any;
  let printService: any;
  let configuracionRemitoService: any;

  const filas = [
    { nombreLibro: 'El Principito', cantidad: 5, precio: 1000, subtotal: 5000 },
    { nombreLibro: 'Rayuela', cantidad: 2, precio: 3000, subtotal: 6000 }
  ];

  function crear(params: any = { comercioId: '1' }) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [EstadoCuentaImpresoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: ComercioService, useValue: comercioService },
        { provide: PrintRemitoService, useValue: printService },
        { provide: ConfiguracionRemitoService, useValue: configuracionRemitoService },
        { provide: ActivatedRoute, useValue: { snapshot: { params } } }
      ]
    });
    fixture = TestBed.createComponent(EstadoCuentaImpresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    remitosService = {
      estadoCuentaConsignacion: jasmine.createSpy('estadoCuentaConsignacion').and.returnValue(of(filas))
    };
    comercioService = {
      getComercio: jasmine.createSpy('getComercio').and.returnValue(
        of({ id: 1, descripcion: 'Hotel Costa Azul', cuit: '30-1-1', comision: 20 }))
    };
    printService = { onDataReady: jasmine.createSpy('onDataReady') };
    configuracionRemitoService = {
      getConfiguracion: jasmine.createSpy('getConfiguracion').and.returnValue(of({ remitente: 'Libros Mario' }))
    };
    crear();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ask for that comercio only', () => {
    expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalledWith(1);
    expect(comercioService.getComercio).toHaveBeenCalledWith(1);
  });

  /** El detalle es todo lo que el negocio tiene: los recortes por fecha se sacaron. */
  it('should ask for the whole balance, with no date range', () => {
    crear({ comercioId: '2' });

    expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalledWith(2);
  });

  /** El detalle se le deja al negocio: una sola hoja, sin duplicado. */
  it('should render a single copy', () => {
    expect(fixture.nativeElement.querySelectorAll('.estado-page').length).toBe(1);
  });

  it('should total units and money', () => {
    expect(component.unidades).toBe(7);
    expect(component.total).toBe(11000);
  });

  it('should print once every piece has arrived', () => {
    expect(printService.onDataReady).toHaveBeenCalledTimes(1);
  });

  /** Un negocio sin nada en la calle igual tiene que poder imprimir su constancia. */
  it('should still print with an empty account', () => {
    remitosService.estadoCuentaConsignacion.and.returnValue(of([]));

    crear();

    expect(component.filas.length).toBe(0);
    expect(component.total).toBe(0);
    expect(printService.onDataReady).toHaveBeenCalled();
  });

  /** Si algo falla, el papel sale igual: colgarse dejaria la pantalla tapada para siempre. */
  it('should print even when a request fails', () => {
    remitosService.estadoCuentaConsignacion.and.returnValue(throwError(() => ({ status: 500 })));
    comercioService.getComercio.and.returnValue(throwError(() => ({ status: 404 })));
    configuracionRemitoService.getConfiguracion.and.returnValue(throwError(() => ({ status: 500 })));

    crear();

    expect(printService.onDataReady).toHaveBeenCalled();
    expect(component.filas).toEqual([]);
  });
});
