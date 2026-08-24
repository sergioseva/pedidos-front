import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { RemitosService } from 'src/app/providers/remitos.service';
import { DatePipe } from '@angular/common';
import { RemitoModel, TIPO_CONSIGNACION, TIPO_DEVOLUCION, TIPO_RETIRO,
         TIPO_VENTA_CONSIGNACION } from '../../models/remito.model';
import { PrintRemitoService } from 'src/app/providers/print-remito.service';
import { ComercioService } from 'src/app/providers/comercio.service';
import { ComercioModel } from '../../models/comercio.model';

@Component({
  selector: 'app-remitos',
  templateUrl: './remitos.component.html',
  styleUrls: ['./remitos.component.css']
})
export class RemitosComponent implements OnInit {

  remitos: any[];
  filteredRemitos: any[] = [];
  /** DEVOLUCION o CONSIGNACION, fijado por la ruta. */
  tipo = TIPO_DEVOLUCION;
  esConsignacion = false;
  /** Ultimo termino buscado, para poder repetir la busqueda al cambiar un filtro. */
  private ultimoTermino = '';
  /** Which date preset is applied, so the pill shows as selected. */
  filtroActivo: number = null;
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading = false;
  error = false;
  errMessage: string;
  searchPerformed = false;

  /** Lo mas reciente primero: en una lista de comprobantes es lo que se busca casi siempre. */
  sortColumn = 're_fecha';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  /** Filtros explicitos de la consulta de consignacion. */
  comercios: ComercioModel[] = [];
  comercioFiltro: ComercioModel;
  tipoFiltro = '';
  tiposDisponibles = [
    { valor: '', etiqueta: 'Todos los movimientos' },
    { valor: TIPO_CONSIGNACION, etiqueta: 'Entregas' },
    { valor: TIPO_RETIRO, etiqueta: 'Retiros' },
    { valor: TIPO_VENTA_CONSIGNACION, etiqueta: 'Ventas' }
  ];

  /** Solo los remitos de venta impagos, para poder salir a cobrarlos. */
  soloImpagos = false;
  remitoACobrar: any;
  medioPago = 'Efectivo';
  cobrando = false;
  modalRef: BsModalRef;

  constructor(public printService: PrintRemitoService,
              private rs: RemitosService,
              private route: ActivatedRoute,
              private modalService: BsModalService,
              private comercioService: ComercioService,
              private datePipe: DatePipe) {
    this.tipo = this.route.snapshot.data['tipo'] || TIPO_DEVOLUCION;
    this.esConsignacion = this.tipo === TIPO_CONSIGNACION;
  }

  get tituloSeccion(): string {
    return this.esConsignacion ? 'Consulta de Remitos de Consignacion' : 'Consulta de Remitos de Devolucion';
  }

  /**
   * La consignacion muestra la hora: un mismo dia puede tener la entrega, el retiro y la venta
   * del mismo negocio, y sin la hora no hay forma de saber en que orden pasaron.
   */
  get formatoFecha(): string {
    return this.esConsignacion ? 'dd/MM/yyyy HH:mm' : 'mediumDate';
  }

  get labelDestinatario(): string {
    return this.esConsignacion ? 'Negocio' : 'Distribuidora';
  }

  /**
   * Los remitos llegan como JSON plano, no como RemitoModel, asi que el getter del modelo no
   * esta disponible aca.
   */
  destinatario(remito: any): string {
    if (!remito) {
      return '';
    }
    const dest = this.esConsignacion ? remito.re_comercio_cm : remito.re_distribuidora_ed;
    return dest ? dest.descripcion : '';
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value || 0);
  }

  esVenta(remito: any): boolean {
    return remito.re_tipo === TIPO_VENTA_CONSIGNACION;
  }

  /** Un remito de venta sin recibo es plata que el comercio todavia debe. */
  estaImpago(remito: any): boolean {
    return this.esVenta(remito) && !remito.recibo;
  }

  netoAPagar(remito: any): number {
    const tapa = ((remito && remito.items) || []).reduce((acc, i) => acc + i.ri_cantidad * (i.ri_precio || 0), 0);
    return tapa * (100 - (remito.re_comision || 0)) / 100;
  }

  abrirCobro(remito: any, template: TemplateRef<any>) {
    this.remitoACobrar = remito;
    this.medioPago = 'Efectivo';
    this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
  }

  cerrarModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  confirmarCobro() {
    this.cobrando = true;
    this.rs.pagarRemito(this.remitoACobrar.re_remito_k, this.medioPago).subscribe(
      (recibo) => {
        this.cobrando = false;
        // Actualizo la fila en el lugar: recargar la busqueda perderia el filtro y el scroll.
        this.remitoACobrar.recibo = recibo;
        this.remitoACobrar.pagado = true;
        this.applySort();
        this.cerrarModal();
        // Aviso no bloqueante y nada mas. Ofrecer aca la impresion disparaba el print mientras
        // el dialogo todavia se estaba desmontando y la hoja salia en blanco; la fila ya quedo
        // en "Pagado" con su boton de impresora, que es el camino que funciona.
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Pago registrado. Imprima el recibo desde la fila.',
          showConfirmButton: false,
          timer: 2500
        });
      },
      (err) => {
        this.cobrando = false;
        Swal.fire({
          title: 'Cobro',
          text: (err.error && err.error.message) || 'Error al registrar el pago',
          icon: 'error'
        });
      });
  }

  imprimirRecibo(remitoId: number) {
    this.printService.imprimirRecibo(remitoId);
  }

  /** Etiqueta del documento, para distinguirlos en la consulta de consignacion. */
  etiquetaTipo(remito: any): string {
    switch (remito.re_tipo) {
      case TIPO_RETIRO: return 'Retiro';
      case TIPO_VENTA_CONSIGNACION: return 'Venta';
      case TIPO_CONSIGNACION: return 'Entrega';
      default: return 'Devolucion';
    }
  }

  claseTipo(remito: any): string {
    switch (remito.re_tipo) {
      case TIPO_RETIRO: return 'badge-warning';
      case TIPO_VENTA_CONSIGNACION: return 'badge-success';
      default: return 'badge-primary';
    }
  }

  total(remito: any): string {
    const items = (remito && remito.items) || [];
    return this.formatPrecio(items.reduce((acc, i) => acc + i.ri_cantidad * (i.ri_precio || 0), 0));
  }

  ngOnInit() {
    if (this.esConsignacion) {
      this.comercioService.getComercios().subscribe(comercios => this.comercios = comercios);
    }
    this.dateFilter(0);
    this.buscarTermino('');
  }

  /**
   * Sin tipo elegido pide los tres movimientos del comercio; con uno elegido, solo ese. El filtro
   * de tipo va al backend porque ya sabe filtrarlo, mientras que el de negocio se aplica sobre lo
   * que ya vino: alcanza y responde al instante.
   */
  private get tiposAPedir(): string {
    if (!this.esConsignacion) {
      return TIPO_DEVOLUCION;
    }
    return this.tipoFiltro
      ? this.tipoFiltro
      : [TIPO_CONSIGNACION, TIPO_RETIRO, TIPO_VENTA_CONSIGNACION].join(',');
  }

  onTipoFiltroChange() {
    this.buscarTermino(this.ultimoTermino);
  }

  imprimir(remito: RemitoModel) {
    this.printService.imprimirRemito(remito.re_remito_k);
  }

  buscarTermino(termino: string) {
    this.ultimoTermino = termino;
    this.loading = true;
    this.remitos = new Array();
    this.rs.buscarRemitos(termino,
                          this.datePipe.transform(this.fromDate, 'yyyy-MM-dd'),
                          this.datePipe.transform(this.toDate, 'yyyy-MM-dd'),
                          this.tiposAPedir)
      .subscribe((data: any) => {
        this.remitos = data;
        this.applySort();
        this.loading = false;
        this.error = false;
        this.searchPerformed = true;
      },
      (err) => {
        this.loading = false;
        this.error = true;
        this.errMessage = (err.error && err.error.message) || 'Error al buscar remitos';
      });
  }

  /** La columna del destinatario cambia de nombre con el tipo; el resto se ordena igual. */
  get columnaDestinatario(): string {
    return this.esConsignacion ? 're_comercio_cm.descripcion' : 're_distribuidora_ed.descripcion';
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
      if (this.sortDirection === '') {
        this.sortColumn = '';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort() {
    if (!this.remitos) {
      this.filteredRemitos = [];
      return;
    }
    let result = this.remitos.slice();
    if (this.soloImpagos) {
      result = result.filter(r => this.estaImpago(r));
    }
    if (this.comercioFiltro) {
      result = result.filter(r => r.re_comercio_cm && r.re_comercio_cm.id === this.comercioFiltro.id);
    }
    if (this.sortColumn && this.sortDirection) {
      result.sort((a, b) => {
        const valA = this.getNestedValue(a, this.sortColumn) ?? '';
        const valB = this.getNestedValue(b, this.sortColumn) ?? '';
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
    }
    this.filteredRemitos = result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  dateFilter(days: number) {

    this.filtroActivo = days;
    const past = new Date();
    const today = new Date();
    past.setDate(past.getDate() - days);
    today.setDate(today.getDate() + 1);
    this.fromDate = this.datePipe.transform(past, 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.buscarTermino('');
  }
}
