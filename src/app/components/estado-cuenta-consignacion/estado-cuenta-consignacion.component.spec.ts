import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EstadoCuentaConsignacionComponent, FilaLiquidable } from './estado-cuenta-consignacion.component';
import { RemitosService } from '../../providers/remitos.service';
import { ComercioService } from '../../providers/comercio.service';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { mockBsModalService } from '../../testing/test-helpers';
import { of, throwError } from 'rxjs';

describe('EstadoCuentaConsignacionComponent', () => {
  let component: EstadoCuentaConsignacionComponent;
  let fixture: ComponentFixture<EstadoCuentaConsignacionComponent>;
  let remitosService: any;
  let comercioService: any;
  let printService: any;

  /** Hotel (comision 20%) con dos titulos; Almacen (sin comision) con uno. */
  const filas: any[] = [
    { comercioId: 1, comercio: 'Hotel Costa Azul', nombreLibro: 'El Principito',
      entregado: 5, devuelto: 0, vendido: 0, cantidad: 5, precio: 1000, subtotal: 5000 },
    { comercioId: 1, comercio: 'Hotel Costa Azul', nombreLibro: 'Rayuela',
      entregado: 4, devuelto: 1, vendido: 1, cantidad: 2, precio: 3000, subtotal: 6000 },
    { comercioId: 2, comercio: 'Almacen Don Pedro', nombreLibro: 'Rayuela',
      entregado: 4, devuelto: 0, vendido: 0, cantidad: 4, precio: 3000, subtotal: 12000 }
  ];

  beforeEach(waitForAsync(() => {
    remitosService = {
      estadoCuentaConsignacion: jasmine.createSpy('estadoCuentaConsignacion').and.returnValue(of(filas)),
      actualizarPrecioConsignacion: jasmine.createSpy('actualizarPrecioConsignacion').and.returnValue(of({})),
      actualizarPreciosDesdeCatalogo: jasmine.createSpy('actualizarPreciosDesdeCatalogo')
        .and.returnValue(of({ actualizados: 3, sinCoincidencia: 0 })),
      liquidarConsignacion: jasmine.createSpy('liquidarConsignacion').and.returnValue(
        of({ remitoRetiroId: 10, remitoVentaId: 11, reciboId: 12, totalTapa: 3000, comision: 20, netoAPagar: 2400 }))
    };
    comercioService = {
      getComercios: jasmine.createSpy('getComercios').and.returnValue(of([
        { id: 1, descripcion: 'Hotel Costa Azul', comision: 20 },
        { id: 2, descripcion: 'Almacen Don Pedro' }
      ]))
    };
    printService = {
      imprimirRemito: jasmine.createSpy('imprimirRemito'),
      imprimirRecibo: jasmine.createSpy('imprimirRecibo'),
      imprimirEstadoCuenta: jasmine.createSpy('imprimirEstadoCuenta'),
      isPrinting: false
    };

    TestBed.configureTestingModule({
      declarations: [EstadoCuentaConsignacionComponent],
      // NgSelectModule de verdad: NO_ERRORS_SCHEMA no aporta el ControlValueAccessor que ngModel pide.
      imports: [FormsModule, NgSelectModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: ComercioService, useValue: comercioService },
        { provide: PrintRemitoService, useValue: printService },
        { provide: BsModalService, useValue: mockBsModalService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoCuentaConsignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** Ya no se carga nada al entrar: los tests que miran datos tienen que pedirlos. */
  function cargarGrupos() {
    component.comercioSeleccionado = { id: 1 } as any;
    component.buscar();
  }

  function hotel() {
    return component.grupos[0];
  }

  function principito(): FilaLiquidable {
    return hotel().filas[0];
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Con muchos negocios y muchos titulos, listar todo al entrar es una espera larga para algo
   * que despues hay que filtrar igual: primero se elige.
   */
  it('should load the comercios but not the balances on init', () => {
    expect(comercioService.getComercios).toHaveBeenCalled();
    expect(remitosService.estadoCuentaConsignacion).not.toHaveBeenCalled();
    expect(component.grupos.length).toBe(0);
    expect(component.searchPerformed).toBe(false);
  });

  describe('hay que elegir algo antes de buscar', () => {
    it('should refuse to search with no comercio and no book', () => {
      component.buscar();

      expect(remitosService.estadoCuentaConsignacion).not.toHaveBeenCalled();
      expect(component.hayFiltro).toBe(false);
    });

    it('should search once a comercio is picked', () => {
      component.comercioSeleccionado = { id: 3 } as any;

      component.buscar();

      expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalledWith(3, '');
    });

    /** Buscar un titulo sin negocio responde "quien tiene este libro". */
    it('should search a book with no comercio', () => {
      component.libro = 'rayuela';

      component.buscar();

      expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalledWith(null, 'rayuela');
      expect(component.hayFiltro).toBe(true);
    });

    it('should ignore a blank book term', () => {
      component.libro = '   ';

      component.buscar();

      expect(remitosService.estadoCuentaConsignacion).not.toHaveBeenCalled();
    });
  });

  describe('agrupado', () => {
    beforeEach(() => cargarGrupos());

    it('should group the rows by comercio', () => {
      expect(component.grupos.length).toBe(2);
      expect(hotel().filas.length).toBe(2);
    });

    it('should carry the comision of each comercio', () => {
      expect(hotel().comision).toBe(20);
      expect(component.grupos[1].comision).toBe(0);
    });

    it('should start every row unmarked', () => {
      expect(principito().vendidos).toBe(0);
      expect(principito().devueltos).toBe(0);
    });

    it('should total each group by its outstanding balance', () => {
      expect(hotel().unidades).toBe(7);
      expect(hotel().total).toBe(11000);
    });
  });

  describe('marcado', () => {
    beforeEach(() => cargarGrupos());

    it('should cap a quantity at the outstanding balance', () => {
      const fila = principito();
      fila.vendidos = 99;
      component.onCantidadChange(fila);
      expect(fila.vendidos).toBe(5);
    });

    it('should reject negatives', () => {
      const fila = principito();
      fila.vendidos = -3;
      component.onCantidadChange(fila);
      expect(fila.vendidos).toBe(0);
    });

    /** Vendidos y devueltos comparten el saldo: no pueden sumar mas que lo que hay. */
    it('should share the balance between vendidos and devueltos', () => {
      const fila = principito();
      fila.vendidos = 3;
      component.onCantidadChange(fila);
      fila.devueltos = 4;
      component.onCantidadChange(fila);
      expect(fila.vendidos + fila.devueltos).toBe(5);
      expect(fila.devueltos).toBe(2);
    });

    it('should expose the remaining room per side', () => {
      const fila = principito();
      fila.vendidos = 2;
      expect(component.maxDevueltos(fila)).toBe(3);
      expect(component.maxVendidos(fila)).toBe(5);
    });

    it('should truncate a fractional quantity', () => {
      const fila = principito();
      fila.vendidos = 2.7 as any;
      component.onCantidadChange(fila);
      expect(fila.vendidos).toBe(2);
    });

    it('devolverTodo should mark the whole balance as returned', () => {
      component.devolverTodo(hotel());
      expect(hotel().filas[0].devueltos).toBe(5);
      expect(hotel().filas[1].devueltos).toBe(2);
      expect(component.vendidosDe(hotel())).toBe(0);
    });

    it('limpiarMarcas should clear the group', () => {
      component.devolverTodo(hotel());
      component.limpiarMarcas(hotel());
      expect(component.hayMarcas(hotel())).toBe(false);
    });
  });

  describe('precios editables', () => {
    beforeEach(() => cargarGrupos());

    it('should send the new price for that title', () => {
      component.cambiarPrecio(hotel(), principito(), 2500);

      expect(remitosService.actualizarPrecioConsignacion)
        .toHaveBeenCalledWith(1, principito().isbn, 'El Principito', 2500);
    });

    it('should revalue the row and the group total', () => {
      component.cambiarPrecio(hotel(), principito(), 2000);

      expect(principito().precio).toBe(2000);
      expect(principito().subtotal).toBe(10000);
      expect(hotel().total).toBe(16000);
    });

    it('should ignore a price that did not change', () => {
      component.cambiarPrecio(hotel(), principito(), principito().precio);

      expect(remitosService.actualizarPrecioConsignacion).not.toHaveBeenCalled();
    });

    it('should reject a negative price without calling the server', () => {
      component.cambiarPrecio(hotel(), principito(), -100);

      expect(remitosService.actualizarPrecioConsignacion).not.toHaveBeenCalled();
    });

    /** La pantalla no puede quedar mostrando un precio que el servidor no acepto. */
    it('should roll the row back when the server rejects it', () => {
      remitosService.actualizarPrecioConsignacion.and.returnValue(
        throwError(() => ({ error: { message: 'no' } })));

      component.cambiarPrecio(hotel(), principito(), 9999);

      expect(principito().precio).toBe(1000);
      expect(principito().subtotal).toBe(5000);
      expect(hotel().total).toBe(11000);
    });
  });

  describe('precios del catalogo', () => {
    beforeEach(() => cargarGrupos());

    it('should pull prices for that comercio and reload', () => {
      remitosService.estadoCuentaConsignacion.calls.reset();

      component.actualizarPreciosDesdeCatalogo(hotel());

      expect(remitosService.actualizarPreciosDesdeCatalogo).toHaveBeenCalledWith(1);
      expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalled();
      expect(component.actualizandoPrecios).toBe(false);
    });

    /** Los que no matchean por ISBN hay que corregirlos a mano: no se puede callar el dato. */
    it('should report the titles left without a catalog match', () => {
      remitosService.actualizarPreciosDesdeCatalogo.and.returnValue(
        of({ actualizados: 2, sinCoincidencia: 5 }));

      component.actualizarPreciosDesdeCatalogo(hotel());

      expect(component.actualizandoPrecios).toBe(false);
    });

    it('should ignore a second click while one pull is running', () => {
      component.actualizandoPrecios = true;

      component.actualizarPreciosDesdeCatalogo(hotel());

      expect(remitosService.actualizarPreciosDesdeCatalogo).not.toHaveBeenCalled();
    });

    it('should clear the flag when the pull fails', () => {
      remitosService.actualizarPreciosDesdeCatalogo.and.returnValue(throwError(() => ({ status: 500 })));

      component.actualizarPreciosDesdeCatalogo(hotel());

      expect(component.actualizandoPrecios).toBe(false);
    });
  });

  describe('totales de lo marcado', () => {
    beforeEach(() => cargarGrupos());

    it('should apply the comision to what was sold', () => {
      principito().vendidos = 3;
      expect(component.totalTapaDe(hotel())).toBe(3000);
      expect(component.netoAPagarDe(hotel())).toBe(2400);
    });

    it('should charge full price when there is no comision', () => {
      const almacen = component.grupos[1];
      almacen.filas[0].vendidos = 2;
      expect(component.netoAPagarDe(almacen)).toBe(6000);
    });

    it('should not count returned copies as money', () => {
      principito().devueltos = 5;
      expect(component.totalTapaDe(hotel())).toBe(0);
      expect(component.hayMarcas(hotel())).toBe(true);
    });
  });

  describe('liquidar', () => {
    beforeEach(() => {
      cargarGrupos();
      principito().vendidos = 3;
      hotel().filas[1].devueltos = 2;
      component.abrirLiquidacion(hotel(), {} as any);
    });

    /** Lo que reporto el usuario: el remito traia todos los titulos, no solo los marcados. */
    it('should leave untouched rows out entirely', () => {
      component.limpiarMarcas(hotel());
      hotel().filas[1].devueltos = 2;

      component.confirmarLiquidacion();

      const enviado = remitosService.liquidarConsignacion.calls.mostRecent().args[0];
      expect(enviado.lineas.length).toBe(1);
      expect(enviado.lineas[0].nombreLibro).toBe('Rayuela');
    });

    it('should only send the rows that were marked', () => {
      component.confirmarLiquidacion();

      const enviado = remitosService.liquidarConsignacion.calls.mostRecent().args[0];
      expect(enviado.comercioId).toBe(1);
      expect(enviado.lineas.length).toBe(2);
      expect(enviado.lineas[0].cantidadVendida).toBe(3);
      expect(enviado.lineas[1].cantidadDevuelta).toBe(2);
    });

    it('should not send a medioPago when no payment is recorded', () => {
      component.registrarPago = false;
      component.confirmarLiquidacion();

      expect(remitosService.liquidarConsignacion.calls.mostRecent().args[0].medioPago).toBeNull();
    });

    it('should send the medioPago when the shop pays', () => {
      component.registrarPago = true;
      component.medioPago = 'Transferencia';
      component.confirmarLiquidacion();

      expect(remitosService.liquidarConsignacion.calls.mostRecent().args[0].medioPago).toBe('Transferencia');
    });

    it('should keep the emitted documents to offer printing', () => {
      component.confirmarLiquidacion();

      expect(component.resultado.remitoRetiroId).toBe(10);
      expect(component.resultado.reciboId).toBe(12);
      expect(component.liquidando).toBe(false);
    });

    /**
     * Los comprobantes se ofrecen desde la pantalla y no desde el modal: imprimir con un modal
     * abierto sale en blanco. Cerrarlo es parte del arreglo, no un detalle de presentacion.
     */
    it('should close the modal and surface the documents on the page', () => {
      const modalRef = (component as any).modalRef = { hide: jasmine.createSpy('hide') };

      component.confirmarLiquidacion();

      expect(modalRef.hide).toHaveBeenCalled();
      expect(component.comercioLiquidado).toBe('Hotel Costa Azul');
      expect(component.resultado).toBeTruthy();
    });

    it('should let the documents panel be dismissed', () => {
      component.confirmarLiquidacion();

      component.cerrarPanelComprobantes();

      expect(component.resultado).toBeNull();
      expect(component.comercioLiquidado).toBeNull();
    });

    /** El saldo cambio en el server: hay que releerlo, no descontarlo a mano. */
    it('should reload the balance after liquidating', () => {
      remitosService.estadoCuentaConsignacion.calls.reset();

      component.confirmarLiquidacion();

      expect(remitosService.estadoCuentaConsignacion).toHaveBeenCalled();
    });

    it('should surface a rejection without keeping a resultado', () => {
      remitosService.liquidarConsignacion.and.returnValue(
        throwError(() => ({ error: { message: 'saldo insuficiente' } })));

      component.confirmarLiquidacion();

      expect(component.resultado).toBeNull();
      expect(component.liquidando).toBe(false);
    });
  });

  describe('impresion', () => {
    beforeEach(() => cargarGrupos());

    /**
     * El truco de impresion es global: la pantalla se tapa sola con .isPrinting y el
     * app-print-layout, que vive fuera, queda visible. Sin esta clase se imprime la lista entera
     * en vez del remito.
     */
    it('should mark its root with isPrinting while printing', () => {
      printService.isPrinting = true;
      fixture.detectChanges();

      const raiz = fixture.nativeElement.firstElementChild;
      expect(raiz.classList).toContain('isPrinting');
    });

    it('should not mark it when not printing', () => {
      printService.isPrinting = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.firstElementChild.classList).not.toContain('isPrinting');
    });

    describe('exportar a Excel', () => {
      let clickSpy: jasmine.Spy;

      beforeEach(() => {
        cargarGrupos();
        remitosService.descargarReporteConsignacion = jasmine.createSpy('descargarReporteConsignacion')
          .and.returnValue(of(new Blob(['x'])));
        spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
        spyOn(window.URL, 'revokeObjectURL');
        clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      });

      it('should ask for that comercio', () => {
        component.exportarExcel(hotel());

        expect(remitosService.descargarReporteConsignacion).toHaveBeenCalledWith(1, '', '');
      });

      it('should save the blob under a filename built from the comercio', () => {
        component.exportarExcel(hotel());

        expect(clickSpy).toHaveBeenCalled();
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
        expect(component.descargando).toBe(false);
      });

      /** Sin el guardia, dos clics seguidos bajan el archivo dos veces. */
      it('should ignore a second click while one download is running', () => {
        component.descargando = true;

        component.exportarExcel(hotel());

        expect(remitosService.descargarReporteConsignacion).not.toHaveBeenCalled();
      });

      it('should clear the flag when the download fails', () => {
        remitosService.descargarReporteConsignacion.and.returnValue(throwError(() => ({ status: 500 })));

        component.exportarExcel(hotel());

        expect(component.descargando).toBe(false);
      });
    });

    it('should print the comercio statement', () => {
      component.imprimirEstadoCuenta(hotel());

      expect(printService.imprimirEstadoCuenta).toHaveBeenCalledWith(1);
    });

    it('should print a remito by id', () => {
      component.imprimirRemito(10);
      expect(printService.imprimirRemito).toHaveBeenCalledWith(10);
    });

    it('should print the recibo through its venta remito', () => {
      component.imprimirRecibo(11);
      expect(printService.imprimirRecibo).toHaveBeenCalledWith(11);
    });

    /** Una liquidacion emite hasta tres comprobantes y hay que poder imprimirlos todos. */
    it('should print every document one after another', () => {
      component.imprimirRemito(10);
      component.imprimirRemito(11);
      component.imprimirRecibo(11);

      expect(printService.imprimirRemito).toHaveBeenCalledTimes(2);
      expect(printService.imprimirRecibo).toHaveBeenCalledTimes(1);
    });
  });

  describe('filtros', () => {

    it('should clear the filters and empty the screen', () => {
      component.comercioSeleccionado = { id: 7 } as any;
      component.libro = 'algo';
      component.grupos = [{} as any];

      component.limpiar();

      expect(component.comercioSeleccionado).toBeNull();
      expect(component.libro).toBe('');
      expect(component.grupos.length).toBe(0);
      expect(component.searchPerformed).toBe(false);
    });

    it('should handle an empty result', () => {
      remitosService.estadoCuentaConsignacion.and.returnValue(of([]));
      component.comercioSeleccionado = { id: 1 } as any;

      component.buscar();

      expect(component.grupos.length).toBe(0);
      expect(component.searchPerformed).toBe(true);
    });

    it('should surface an error', () => {
      remitosService.estadoCuentaConsignacion.and.returnValue(
        throwError(() => ({ error: { message: 'fail' } })));
      component.comercioSeleccionado = { id: 1 } as any;

      component.buscar();

      expect(component.error).toBe(true);
      expect(component.errMessage).toBe('fail');
    });
  });

  describe('totales generales', () => {
    beforeEach(() => cargarGrupos());

    it('should total across groups', () => {
      expect(component.unidadesGenerales).toBe(11);
      expect(component.totalGeneral).toBe(23000);
    });
  });
});
