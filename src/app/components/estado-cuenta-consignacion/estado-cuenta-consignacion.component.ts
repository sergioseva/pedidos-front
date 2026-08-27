import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { RemitosService } from 'src/app/providers/remitos.service';
import { ComercioService } from 'src/app/providers/comercio.service';
import { ComercioModel } from 'src/app/models/comercio.model';
import { ConsignacionEstadoCuentaModel } from 'src/app/models/consignacion-estado-cuenta.model';
import { LiquidacionModel, LiquidacionResultadoModel } from 'src/app/models/liquidacion.model';
import { PrintRemitoService } from 'src/app/providers/print-remito.service';

/** Una fila del estado de cuenta mas lo que el operador marco todavia sin confirmar. */
export interface FilaLiquidable extends ConsignacionEstadoCuentaModel {
  vendidos: number;
  devueltos: number;
}

/** Un comercio con sus lineas, ya sumadas. */
interface GrupoComercio {
  comercioId: number;
  comercio: string;
  comision: number;
  filas: FilaLiquidable[];
  unidades: number;
  total: number;
}

@Component({
  selector: 'app-estado-cuenta-consignacion',
  templateUrl: './estado-cuenta-consignacion.component.html',
  styleUrls: ['./estado-cuenta-consignacion.component.css']
})
export class EstadoCuentaConsignacionComponent implements OnInit {

  comercios: ComercioModel[] = [];
  comercioSeleccionado: ComercioModel;
  /** Titulo a buscar, para poder preguntar quien tiene un libro sin elegir negocio. */
  libro = '';
  grupos: GrupoComercio[] = [];
  loading = false;
  error = false;
  errMessage: string;
  searchPerformed = false;

  /** Grupo que se esta liquidando en el modal. */
  grupoALiquidar: GrupoComercio;
  observaciones = '';
  registrarPago = false;
  medioPago = 'Efectivo';
  liquidando = false;
  descargando = false;
  actualizandoPrecios = false;
  modalRef: BsModalRef;
  /**
   * Los comprobantes de la ultima liquidacion se ofrecen desde la pantalla, no desde el modal.
   * Imprimir con el modal abierto sale en blanco, y ademas una liquidacion emite hasta tres
   * papeles: el panel queda a la vista hasta que se lo cierra y se pueden imprimir de a uno.
   */
  resultado: LiquidacionResultadoModel;
  comercioLiquidado: string;

  constructor(private rs: RemitosService,
              private comercioService: ComercioService,
              public printService: PrintRemitoService,
              private modalService: BsModalService) { }

  ngOnInit() {
    this.comercioService.getComercios().subscribe(comercios => this.comercios = comercios);
    // No se carga nada al entrar: con muchos negocios y muchos titulos, listar todo es una espera
    // larga para algo que despues hay que filtrar igual. Primero se elige negocio o se busca libro.
  }

  /** Sin negocio ni titulo no hay nada que traer, y traerlo todo es justamente lo que se evita. */
  get hayFiltro(): boolean {
    return !!this.comercioSeleccionado || !!(this.libro && this.libro.trim());
  }

  buscar() {
    this.grupos = [];
    if (!this.hayFiltro) {
      this.searchPerformed = false;
      return;
    }
    this.loading = true;
    const comercioId = this.comercioSeleccionado ? this.comercioSeleccionado.id : null;
    this.rs.estadoCuentaConsignacion(comercioId, this.libro).subscribe(
      (filas: ConsignacionEstadoCuentaModel[]) => {
        this.grupos = this.agrupar(filas);
        this.loading = false;
        this.error = false;
        this.searchPerformed = true;
      },
      (err) => {
        this.loading = false;
        this.error = true;
        this.errMessage = (err.error && err.error.message) || 'Error al consultar las consignaciones';
      });
  }

  limpiar() {
    this.comercioSeleccionado = null;
    this.libro = '';
    this.grupos = [];
    this.searchPerformed = false;
  }

  /** El backend ya devuelve las filas ordenadas por comercio, asi que un solo recorrido alcanza. */
  private agrupar(filas: ConsignacionEstadoCuentaModel[]): GrupoComercio[] {
    const grupos: GrupoComercio[] = [];
    (filas || []).forEach(fila => {
      let grupo = grupos.find(g => g.comercioId === fila.comercioId);
      if (!grupo) {
        grupo = {
          comercioId: fila.comercioId,
          comercio: fila.comercio,
          comision: this.comisionDe(fila.comercioId),
          filas: [], unidades: 0, total: 0
        };
        grupos.push(grupo);
      }
      grupo.filas.push({ ...fila, vendidos: 0, devueltos: 0 });
      grupo.unidades += fila.cantidad;
      grupo.total += fila.subtotal;
    });
    return grupos;
  }

  private comisionDe(comercioId: number): number {
    const comercio = this.comercios.find(c => c.id === comercioId);
    return comercio && comercio.comision ? comercio.comision : 0;
  }

  // --- Marcado ---

  /**
   * Vendidos y devueltos comparten el mismo saldo, asi que el tope de cada uno es lo que queda
   * despues del otro. Sin esto se podria marcar 5 y 5 sobre un saldo de 5 y el backend rechazaria
   * la liquidacion entera recien al confirmar.
   */
  maxVendidos(fila: FilaLiquidable): number {
    return fila.cantidad - (fila.devueltos || 0);
  }

  maxDevueltos(fila: FilaLiquidable): number {
    return fila.cantidad - (fila.vendidos || 0);
  }

  onCantidadChange(fila: FilaLiquidable) {
    fila.vendidos = this.acotar(fila.vendidos, fila.cantidad);
    fila.devueltos = this.acotar(fila.devueltos, fila.cantidad - fila.vendidos);
  }

  private acotar(valor: number, max: number): number {
    const n = Math.floor(Number(valor) || 0);
    return Math.min(Math.max(n, 0), Math.max(max, 0));
  }

  /** Marca todo el saldo de un grupo como devuelto, que es el caso mas comun al levantar. */
  devolverTodo(grupo: GrupoComercio) {
    grupo.filas.forEach(f => { f.vendidos = 0; f.devueltos = f.cantidad; });
  }

  limpiarMarcas(grupo: GrupoComercio) {
    grupo.filas.forEach(f => { f.vendidos = 0; f.devueltos = 0; });
  }

  // --- Precios ---

  /**
   * Guarda el precio al salir del campo, no en cada tecla. El precio nuevo queda en la entrega
   * como valor vigente pero sin pisar el original, asi que el remito ya emitido no cambia.
   */
  cambiarPrecio(grupo: GrupoComercio, fila: FilaLiquidable, precio: number) {
    const nuevo = Number(precio);
    if (!(nuevo >= 0) || nuevo === fila.precio) {
      fila.precio = fila.precio;
      return;
    }
    const anterior = fila.precio;
    fila.precio = nuevo;
    fila.subtotal = fila.cantidad * nuevo;

    this.rs.actualizarPrecioConsignacion(grupo.comercioId, fila.isbn, fila.nombreLibro, nuevo).subscribe(
      () => this.recalcularGrupo(grupo),
      (err) => {
        // Si el servidor lo rechaza, la pantalla no puede quedar mostrando un precio que no se guardo.
        fila.precio = anterior;
        fila.subtotal = fila.cantidad * anterior;
        this.recalcularGrupo(grupo);
        Swal.fire({
          title: 'Precio',
          text: (err.error && err.error.message) || 'No se pudo actualizar el precio',
          icon: 'error'
        });
      });
  }

  actualizarPreciosDesdeCatalogo(grupo: GrupoComercio) {
    if (this.actualizandoPrecios) {
      return;
    }
    this.actualizandoPrecios = true;
    this.rs.actualizarPreciosDesdeCatalogo(grupo.comercioId).subscribe(
      (r: any) => {
        this.actualizandoPrecios = false;
        this.buscar();
        Swal.fire({
          title: 'Precios',
          html: `Se actualizaron <strong>${r.actualizados}</strong> titulos desde el catalogo.` +
            (r.sinCoincidencia > 0
              ? `<br><br>Quedaron <strong>${r.sinCoincidencia}</strong> sin coincidencia de ISBN` +
                ' en el catalogo: esos hay que corregirlos a mano.'
              : ''),
          icon: r.sinCoincidencia > 0 ? 'warning' : 'success'
        });
      },
      () => {
        this.actualizandoPrecios = false;
        Swal.fire({ title: 'Precios', text: 'No se pudieron actualizar', icon: 'error' });
      });
  }

  private recalcularGrupo(grupo: GrupoComercio) {
    grupo.total = grupo.filas.reduce((acc, f) => acc + (f.subtotal || 0), 0);
  }

  // --- Totales de lo marcado ---

  vendidosDe(grupo: GrupoComercio): number {
    return grupo.filas.reduce((acc, f) => acc + (f.vendidos || 0), 0);
  }

  devueltosDe(grupo: GrupoComercio): number {
    return grupo.filas.reduce((acc, f) => acc + (f.devueltos || 0), 0);
  }

  totalTapaDe(grupo: GrupoComercio): number {
    return grupo.filas.reduce((acc, f) => acc + (f.vendidos || 0) * (f.precio || 0), 0);
  }

  netoAPagarDe(grupo: GrupoComercio): number {
    return this.totalTapaDe(grupo) * (100 - (grupo.comision || 0)) / 100;
  }

  hayMarcas(grupo: GrupoComercio): boolean {
    return this.vendidosDe(grupo) > 0 || this.devueltosDe(grupo) > 0;
  }

  // --- Liquidacion ---

  abrirLiquidacion(grupo: GrupoComercio, template: TemplateRef<any>) {
    this.grupoALiquidar = grupo;
    this.observaciones = '';
    this.registrarPago = false;
    this.medioPago = 'Efectivo';
    this.resultado = null;
    this.comercioLiquidado = null;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static', keyboard: false });
  }

  cerrarModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  confirmarLiquidacion() {
    const grupo = this.grupoALiquidar;
    const liquidacion = new LiquidacionModel();
    liquidacion.comercioId = grupo.comercioId;
    liquidacion.observaciones = this.observaciones;
    liquidacion.registrarPago = this.registrarPago;
    liquidacion.medioPago = this.registrarPago ? this.medioPago : null;
    liquidacion.lineas = grupo.filas
      .filter(f => (f.vendidos || 0) > 0 || (f.devueltos || 0) > 0)
      .map(f => ({
        isbn: f.isbn,
        nombreLibro: f.nombreLibro,
        autor: f.autor,
        editorial: f.editorial,
        precio: f.precio,
        cantidadVendida: f.vendidos || 0,
        cantidadDevuelta: f.devueltos || 0
      }));

    this.liquidando = true;
    this.rs.liquidarConsignacion(liquidacion).subscribe(
      (resultado) => {
        this.liquidando = false;
        this.resultado = resultado;
        this.comercioLiquidado = grupo.comercio;
        // El modal se cierra: los comprobantes se imprimen desde el panel de la pantalla.
        this.cerrarModal();
        // El saldo cambio: hay que releerlo, no descontarlo a mano en la pantalla.
        this.buscar();
      },
      (err) => {
        this.liquidando = false;
        Swal.fire({
          title: 'Liquidacion',
          text: (err.error && err.error.message) || 'Error al liquidar',
          icon: 'error'
        });
      });
  }

  cerrarPanelComprobantes() {
    this.resultado = null;
    this.comercioLiquidado = null;
  }

  /**
   * Estado de cuenta del negocio, para entregarle el detalle de lo que tiene. Se imprime con las
   * mismas fechas que tiene la pantalla, asi el papel coincide con lo que se esta mirando.
   */
  imprimirEstadoCuenta(grupo: GrupoComercio) {
    this.printService.imprimirEstadoCuenta(grupo.comercioId);
  }

  /**
   * Baja el mismo detalle en .xlsx. Los bytes se piden con el header del token y se guardan con
   * un object URL temporal: un enlace comun no podria llevar la autorizacion.
   */
  exportarExcel(grupo: GrupoComercio) {
    if (this.descargando) {
      return;
    }
    this.descargando = true;
    this.rs.descargarReporteConsignacion(grupo.comercioId, '', '').subscribe(
      (blob: Blob) => {
        const limpio = (grupo.comercio || 'negocio').replace(/[^a-zA-Z0-9]+/g, '_');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consignacion_${limpio}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando = false;
      },
      () => {
        this.descargando = false;
        Swal.fire({
          title: 'Exportar',
          text: 'No se pudo generar el reporte',
          icon: 'error'
        });
      });
  }

  imprimirRemito(remitoId: number) {
    this.printService.imprimirRemito(remitoId);
  }

  imprimirRecibo(remitoVentaId: number) {
    this.printService.imprimirRecibo(remitoVentaId);
  }

  // --- Totales generales ---

  get totalGeneral(): number {
    return this.grupos.reduce((acc, g) => acc + g.total, 0);
  }

  get unidadesGenerales(): number {
    return this.grupos.reduce((acc, g) => acc + g.unidades, 0);
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value || 0);
  }
}
