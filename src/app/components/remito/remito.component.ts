import { Component, OnInit, OnDestroy, TemplateRef, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RemitoModel, TIPO_CONSIGNACION, TIPO_DEVOLUCION } from 'src/app/models/remito.model';
import { RemitosService } from 'src/app/providers/remitos.service';
import { RemitoItemModel } from '../../models/remito-item.model';
import { DistribuidoraModel } from '../../models/distribuidora.model';
import { ComercioModel } from '../../models/comercio.model';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { ComercioService } from '../../providers/comercio.service';
import { LibrosService } from '../../providers/libros.service';
import { LibroModel } from '../../models/libro.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-remito',
  templateUrl: './remito.component.html',
  styleUrls: ['./remito.component.css']
})
export class RemitoComponent implements OnInit, OnDestroy {

  forma: FormGroup;
  remito: RemitoModel;
  /** DEVOLUCION o CONSIGNACION, fijado por la ruta. Decide destinatario, textos e impresion. */
  tipo = TIPO_DEVOLUCION;
  esConsignacion = false;
  /** Distribuidoras o comercios segun el tipo; la vista no necesita saber cual de los dos es. */
  destinatarios: (DistribuidoraModel | ComercioModel)[] = [];
  destinatarioSeleccionado: DistribuidoraModel | ComercioModel;
  libros: LibroModel[];
  filteredLibros: LibroModel[];
  cantItemsRemito = 0;
  /** Items que venian de una carga sin terminar, para avisarlo en pantalla. */
  itemsRecuperados = 0;
  loading = false;
  searchPerformed = false;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  pageSize = 20;
  visiblePages: number[] = [];
  private lastTermino = '';
  modalRef: BsModalRef;
  itemModalRef: BsModalRef;

  // Sorting state
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  // Column filters
  filters: any = {
    descripcion: '',
    autor: '',
    editorial: '',
    isbn: ''
  };

  private filterSubject = new Subject<void>();
  private filterSubscription: Subscription;

  constructor(private remitosService: RemitosService,
              private distribuidoraService: DistribuidoraService,
              private comercioService: ComercioService,
              private librosService: LibrosService,
              public printService: PrintRemitoService,
              private modalService: BsModalService,
              private route: ActivatedRoute,
              private appRef: ApplicationRef) {
    this.tipo = this.route.snapshot.data['tipo'] || TIPO_DEVOLUCION;
    this.esConsignacion = this.tipo === TIPO_CONSIGNACION;
    this.buildForm();
  }

  /** Etiquetas que cambian entre los dos tipos, para no repetir el condicional en la plantilla. */
  get tituloSeccion(): string {
    return this.esConsignacion ? 'Remito de Consignacion' : 'Remito de Devolucion';
  }

  get labelDestinatario(): string {
    return this.esConsignacion ? 'Seleccione el negocio destino' : 'Seleccione la distribuidora';
  }

  private buildForm() {
    this.forma = new FormGroup({
      'destinatario': new FormControl(null, Validators.required),
      'observaciones': new FormControl(''),
    });
  }

  ngOnInit() {
    this.remitosService.currentRemito.subscribe(remito => {
      this.remito = remito;
      this.cantItemsRemito = remito.items.length;
    });
    // El remito vive en un BehaviorSubject compartido, asi que hay que reiniciarlo al entrar
    // para no arrastrar el de la otra pantalla. Si quedo una carga a medias, se recupera.
    this.itemsRecuperados = this.remitosService.restaurarBorrador(this.tipo);
    this.cargarDestinatarios();
    this.filterSubscription = this.filterSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.loadPage(1);
    });
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  private cargarDestinatarios() {
    const origen: Observable<(DistribuidoraModel | ComercioModel)[]> = this.esConsignacion
      ? this.comercioService.getComercios()
      : this.distribuidoraService.getDistribuidoras();
    origen.subscribe((destinatarios) => {
      this.destinatarios = destinatarios;
    });
  }

  onReiniciar() {
    if (this.remito.items.length > 0 && !this.remito.finalizado) {
      Swal.fire({
        title: 'Reiniciar',
        text: `Se van a descartar ${this.remito.items.length} items cargados. Continuar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si, descartar',
        cancelButtonText: 'Cancelar'
      }).then(r => {
        if (r.value) {
          this.reiniciar();
        }
      });
      return;
    }
    this.reiniciar();
  }

  private reiniciar() {
    this.forma.reset();
    this.forma.enable();
    this.destinatarioSeleccionado = null;
    this.itemsRecuperados = 0;
    this.remitosService.generarNuevoRemito(this.tipo);
  }

  descartarRecuperado() {
    this.onReiniciar();
  }

  onSubmit() {
    Swal.fire({
      title: 'Confirmar',
      text: 'Esta seguro que desea finalizar el remito? No podra modificarlo despues.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.guardarRemito();
      }
    });
  }

  private guardarRemito() {
    this.remitosService.asignarDatos(this.destinatarioSeleccionado, this.forma.controls.observaciones.value);
    Swal.fire({
      title: 'Espere',
      text: 'Generando el remito',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.remitosService.grabarRemito().subscribe(
      resp => {
        this.closeModal();
        Swal.fire({
          title: 'Remito',
          text: 'Remito ingresado!',
          icon: 'success'
        });
        this.remito.re_remito_k = resp['re_remito_k'];
        this.remitosService.finalizarRemito();
      },
      err => {
        Swal.fire({
          title: 'Remito',
          text: 'Error al ingresar el remito',
          icon: 'error'
        });
      }
    );
  }

  cambiarCantidad(item: RemitoItemModel, cantidad: number) {
    this.remitosService.actualizarCantidad(item, cantidad);
  }

  borrarItem(item: RemitoItemModel) {
    this.remitosService.removeRemitoItem(item);
  }

  onImprimir() {
    this.closeModal();
    setTimeout(() => {
      this.printService.imprimirRemito(this.remito.re_remito_k);
    }, 300);
  }

  agregarAlRemito(libro: LibroModel) {
    if (this.remito.finalizado) {
      Swal.fire({
        title: 'Remito Finalizado',
        text: 'El remito ya fue finalizado. Pulse Reiniciar para generar uno nuevo.',
        icon: 'warning'
      });
      return;
    }
    const item = new RemitoItemModel();
    item.ri_nombre_libro = libro.descripcion;
    item.ri_autor = libro.autor;
    item.ri_editorial = libro.editorial;
    item.ri_precio = libro.precio;
    item.ri_isbn = libro.isbn;
    item.ri_cantidad = 1;
    this.remitosService.addRemitoItem(item);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Libro agregado al remito',
      showConfirmButton: false,
      timer: 1500
    });
  }

  buscarLibros(termino: string) {
    this.lastTermino = termino;
    this.totalItems = 0;
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.loading = true;
    const serverFilters: {[key: string]: string} = {};
    Object.keys(this.filters).forEach(key => {
      if (this.filters[key]) {
        serverFilters[key] = this.filters[key];
      }
    });
    const sort = this.sortColumn && this.sortDirection
      ? `${this.sortColumn},${this.sortDirection}`
      : 'descripcion,asc';
    this.librosService.buscarLibros(this.lastTermino, page - 1, this.pageSize, serverFilters, sort).subscribe(
      (data: any) => {
        this.libros = data.content;
        this.totalItems = data.page.totalElements;
        this.totalPages = data.page.totalPages;
        this.updateVisiblePages();
        this.applyFiltersAndSort();
        this.loading = false;
        this.searchPerformed = true;
      },
      () => {
        this.loading = false;
      }
    );
  }

  nextGroup() {
    const firstOfNextGroup = Math.floor((this.currentPage - 1) / 10) * 10 + 11;
    this.loadPage(Math.min(firstOfNextGroup, this.totalPages));
  }

  prevGroup() {
    const firstOfPrevGroup = (Math.floor((this.currentPage - 1) / 10) - 1) * 10 + 1;
    this.loadPage(Math.max(firstOfPrevGroup, 1));
  }

  private updateVisiblePages() {
    const groupStart = Math.floor((this.currentPage - 1) / 10) * 10 + 1;
    const groupEnd = Math.min(groupStart + 9, this.totalPages);
    this.visiblePages = [];
    for (let i = groupStart; i <= groupEnd; i++) {
      this.visiblePages.push(i);
    }
  }

  // --- Filtering ---
  onFilterChange() {
    this.filterSubject.next();
  }

  // --- Sorting ---
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
    this.loadPage(1);
  }

  applyFiltersAndSort() {
    this.filteredLibros = this.libros ? this.libros.slice() : [];
    if (this.sortColumn && this.sortDirection) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      this.filteredLibros.sort((a: any, b: any) => {
        const valA = (a[this.sortColumn] || '').toString().toLowerCase();
        const valB = (b[this.sortColumn] || '').toString().toLowerCase();
        return valA < valB ? -dir : valA > valB ? dir : 0;
      });
    }
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value);
  }

  openItemModal(template: TemplateRef<any>) {
    this.itemModalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  closeItemModal() {
    if (this.itemModalRef) {
      this.itemModalRef.hide();
    }
  }

  onItemAdded() {
  }

  openDetalleModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      this.destinatarios = [...this.destinatarios];
      this.appRef.tick();
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

}
