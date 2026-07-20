import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

import { VentaModel } from '../../models/venta.model';
import { VentaItemModel } from '../../models/venta.item';
import { ClienteModel } from '../../models/cliente.model';
import { VentasService } from '../../providers/ventas.service';
import { ClientesServiceService } from '../../providers/clientes-service.service';

/**
 * The till. Everything here is built around a barcode reader, which behaves as a keyboard that
 * types the digits and presses Enter -- so the scan field must hold focus at all times and the
 * mouse must never be required to ring up a sale.
 */
@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentaComponent implements OnInit, AfterViewInit {

  @ViewChild('isbnInput') isbnInput: ElementRef<HTMLInputElement>;
  @ViewChild('manualTemplate') manualTemplate: TemplateRef<any>;

  venta = new VentaModel();
  isbnScan = '';
  buscando = false;
  guardando = false;
  error = false;
  errMessage = '';

  clientes: any[] = [];
  clienteSeleccionado: any = null;

  // Quick-add cliente, same inline panel the pedido screen uses.
  showNuevoCliente = false;
  nuevoCliente: ClienteModel = new ClienteModel();
  guardandoCliente = false;

  /** The line the operator just touched, for the peripheral confirmation flash. */
  ultimoIsbn: string = null;

  // manual entry, shown when a scan finds nothing in the catalog
  modalRef: BsModalRef;
  manualDesdeScan = false;   // true when the modal was opened by a failed scan (ISBN prefilled)
  manualIsbn = '';
  manualLibro = '';
  manualAutor = '';
  manualPrecio: number = null;
  manualCantidad = 1;

  constructor(private vs: VentasService,
              private cs: ClientesServiceService,
              private modalService: BsModalService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Same source and label shape the pedido screen's ng-select uses.
    this.cs.getClientesPorCualquier('').subscribe(
      (clientes: any) => {
        this.clientes = clientes ?? [];
        this.clientes.forEach(c => c.label = `${c.nombre} - ${c.telefonoMovil}`);
        this.cdr.markForCheck();
      },
      () => {
        // A sale does not need a cliente, so this failing must not stop the till.
        this.clientes = [];
        this.cdr.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    this.focusScan();
  }

  /**
   * Called on Enter from the scan field. Errors as well as hits end by clearing and refocusing:
   * the worst failure here is the field quietly losing focus mid-stack, because every following
   * scan then types into nothing and is lost with no feedback at all.
   */
  onScan(): void {
    const isbn = this.normalizarIsbn(this.isbnScan);
    if (!isbn) {
      this.resetScan();
      return;
    }
    // Readers can emit a trailing CR that fires Enter twice; without this the same book lands twice.
    if (this.buscando) {
      return;
    }

    const existente = this.venta.buscarPorIsbn(isbn);
    if (existente) {
      // Repeat scan: bump the quantity, no round trip. Scanning a stack has to feel instant.
      existente.cantidad++;
      this.venta.calcularTotal();
      this.destacar(isbn);
      this.resetScan();
      return;
    }

    this.buscando = true;
    this.error = false;
    this.vs.buscarPorIsbn(isbn).subscribe(
      (libro: any) => {
        const item = new VentaItemModel();
        item.isbn = libro.isbn ? this.normalizarIsbn(libro.isbn) : isbn;
        item.libro = libro.descripcion;
        item.autor = libro.autor;
        item.editorial = libro.editorial;
        item.precio = libro.precio ?? 0;
        item.cantidad = 1;
        this.venta.addItem(item);
        this.destacar(item.isbn);
        this.buscando = false;
        this.resetScan();
      },
      (err: any) => {
        this.buscando = false;
        if (err.status === 404) {
          this.abrirManual(isbn);
        } else {
          this.error = true;
          this.errMessage = 'Error al buscar el ISBN. Intente nuevamente.';
        }
        this.resetScan();
      });
  }

  /** The catalog is replaced on every import, so a book on the shelf may legitimately be missing. */
  abrirManual(isbn: string): void {
    this.manualDesdeScan = true;
    this.prepararManual(isbn);
  }

  /** Same form, opened proactively from the button for a book known not to be in the catalog. */
  agregarLibroManual(): void {
    this.manualDesdeScan = false;
    this.prepararManual('');
  }

  private prepararManual(isbn: string): void {
    this.manualIsbn = isbn;
    this.manualLibro = '';
    this.manualAutor = '';
    this.manualPrecio = null;
    this.manualCantidad = 1;
    this.modalRef = this.modalService.show(this.manualTemplate);
  }

  confirmarManual(): void {
    if (!this.manualLibro || this.manualPrecio == null || this.manualPrecio < 0 || this.manualCantidad < 1) {
      return;
    }
    const item = new VentaItemModel();
    item.isbn = this.normalizarIsbn(this.manualIsbn);
    item.libro = this.manualLibro;
    item.autor = this.manualAutor ?? '';
    item.editorial = '';
    item.precio = this.manualPrecio;
    item.cantidad = this.manualCantidad;
    this.venta.addItem(item);
    this.destacar(item.isbn);
    this.cerrarManual();
  }

  cerrarManual(): void {
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.resetScan();
  }

  /**
   * Quick-add, mirroring the pedido screen: the customer is standing at the counter, so sending
   * the operator to the Clientes screen and back would lose the half-scanned ticket.
   */
  toggleNuevoCliente(): void {
    this.showNuevoCliente = !this.showNuevoCliente;
    if (this.showNuevoCliente) {
      this.nuevoCliente = new ClienteModel();
    } else {
      // Panel dismissed: the scanner gets the keyboard back.
      this.resetScan();
    }
    this.cdr.markForCheck();
  }

  guardarNuevoCliente(): void {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.telefonoMovil || this.guardandoCliente) {
      return;
    }
    this.guardandoCliente = true;
    Swal.fire({
      title: 'Espere',
      text: 'Guardando cliente...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.cs.insertCliente(this.nuevoCliente).subscribe(
      (resp: any) => {
        Swal.close();
        const saved: any = resp;
        saved.label = `${saved.nombre} - ${saved.telefonoMovil}`;
        this.clientes = [...this.clientes, saved];
        this.clienteSeleccionado = saved;
        this.showNuevoCliente = false;
        this.guardandoCliente = false;
        // Back to scanning, ticket untouched.
        this.resetScan();
      },
      () => {
        this.guardandoCliente = false;
        Swal.fire({
          title: 'Cliente',
          text: 'Error al guardar el cliente',
          icon: 'error'
        });
        this.cdr.markForCheck();
      });
  }

  removeItem(item: VentaItemModel): void {
    this.venta.removeItem(item);
    this.resetScan();
  }

  recalcular(): void {
    this.venta.calcularTotal();
    this.cdr.markForCheck();
  }

  finalizar(): void {
    if (!this.venta.items.length || this.guardando) {
      return;
    }
    this.venta.cliente = this.clienteSeleccionado ?? null;

    Swal.fire({
      title: 'Confirmar venta',
      text: `Total: $${this.venta.total.toLocaleString('es-AR')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) {
        this.focusScan();
        return;
      }
      this.guardando = true;
      this.cdr.markForCheck();
      this.vs.crearVenta(this.venta).subscribe(
        (guardada: any) => {
          this.guardando = false;
          // Show the server's total, not ours: if they ever disagree, the server is right.
          Swal.fire({
            title: 'Venta registrada',
            text: `Venta #${guardada.id} - Total: $${(guardada.total as number).toLocaleString('es-AR')}`,
            icon: 'success'
          });
          this.nuevaVenta();
        },
        (err: any) => {
          this.guardando = false;
          // Keep the ticket: a half-scanned stack must never be lost to a network blip.
          Swal.fire({
            title: 'No se pudo registrar',
            text: err?.error?.message ?? 'Error al registrar la venta. La venta sigue cargada.',
            icon: 'error'
          });
          this.cdr.markForCheck();
        });
    });
  }

  nuevaVenta(): void {
    this.venta = new VentaModel();
    this.clienteSeleccionado = null;
    this.error = false;
    this.resetScan();
  }

  private destacar(isbn: string): void {
    this.ultimoIsbn = isbn;
  }

  private normalizarIsbn(valor: string): string {
    return (valor || '').replace(/[^0-9Xx]/g, '').trim();
  }

  private resetScan(): void {
    this.isbnScan = '';
    this.focusScan();
    this.cdr.markForCheck();
  }

  private focusScan(): void {
    setTimeout(() => {
      if (this.isbnInput) {
        this.isbnInput.nativeElement.focus();
      }
    }, 0);
  }
}
