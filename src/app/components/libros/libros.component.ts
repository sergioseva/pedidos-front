import { Component, OnInit } from '@angular/core';
import { LibroModel } from '../../models/libro.model';
import { LibrosService } from '../../providers/libros.service';
import { PedidosService } from '../../providers/pedidos.service';
import { PedidoItemModel } from '../../models/pedido.item';
import { PrintPedidoService } from '../../providers/print-pedido.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit {
  libros: LibroModel[];
  filteredLibros: LibroModel[];
  cantItemsPedido = 0;
  pedidoFinalizado = false;
  loading = false;
  searchPerformed = false;

  // Inline add/edit state
  isAdding = false;
  newLibro: any = {};
  editingLibro: LibroModel | null = null;
  editData: any = {};

  // Sorting state
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  // Column filters
  filters: any = {
    descripcion: '',
    autor: '',
    precio: '',
    editorial: '',
    isbn: '',
    observaciones: ''
  };

  constructor(private librosService: LibrosService,
              private pedidosService: PedidosService,
              public printService: PrintPedidoService) {
  }

  ngOnInit() {
    this.pedidosService.currentPedido.subscribe(pedido => {
      this.cantItemsPedido = pedido.pedidoItems.length;
      this.pedidoFinalizado = pedido.finalizado;
    });
  }

  buscarLibros(termino: string) {
    this.loading = true;
    this.librosService.buscarLibros(termino).subscribe(
      (libros: any[]) => {
        this.libros = libros;
        this.applyFiltersAndSort();
        this.loading = false;
        this.searchPerformed = true;
      },
      () => {
        this.loading = false;
      }
    );
  }

  // --- Filtering ---
  onFilterChange() {
    this.applyFiltersAndSort();
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
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    if (!this.libros) {
      this.filteredLibros = [];
      return;
    }
    let result = this.libros.slice();

    // Apply filters
    Object.keys(this.filters).forEach(key => {
      const filterValue = (this.filters[key] || '').toLowerCase();
      if (filterValue) {
        result = result.filter(libro => {
          const val = libro[key];
          return val != null && String(val).toLowerCase().includes(filterValue);
        });
      }
    });

    // Apply sort
    if (this.sortColumn && this.sortDirection) {
      result.sort((a, b) => {
        const valA = a[this.sortColumn] || '';
        const valB = b[this.sortColumn] || '';
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    this.filteredLibros = result;
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value);
  }

  // --- Inline Add ---
  startAdd() {
    this.isAdding = true;
    this.newLibro = { descripcion: '', autor: '', precio: '', editorial: '', isbn: '', observaciones: '' };
  }

  cancelAdd() {
    this.isAdding = false;
    this.newLibro = {};
  }

  saveNew() {
    this.librosService.insertLibro(this.newLibro)
      .subscribe(
        (resp: any) => {
          this.libros = [resp, ...(this.libros || [])];
          this.applyFiltersAndSort();
          this.isAdding = false;
          this.newLibro = {};
        },
        err => { }
      );
  }

  // --- Inline Edit ---
  startEdit(libro: LibroModel) {
    this.editingLibro = libro;
    this.editData = { ...libro };
  }

  cancelEdit() {
    this.editingLibro = null;
    this.editData = {};
  }

  saveEdit() {
    this.librosService.updateLibro(this.editData)
      .subscribe(
        resp => {
          const idx = this.libros.findIndex(l => l.id === this.editData.id);
          if (idx >= 0) {
            Object.assign(this.libros[idx], this.editData);
          }
          this.applyFiltersAndSort();
          this.editingLibro = null;
          this.editData = {};
        },
        err => { }
      );
  }

  // --- Delete ---
  confirmDelete(libro: LibroModel) {
    Swal.fire({
      title: 'Confirmar',
      text: 'Esta seguro que desea eliminar este libro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.librosService.deleteLibro(libro)
          .subscribe(
            resp => {
              this.libros = this.libros.filter(l => l !== libro);
              this.applyFiltersAndSort();
            },
            err => { }
          );
      }
    });
  }

  // --- Add to Pedido ---
  agregarAlPedido(libro: LibroModel) {
    if (this.pedidoFinalizado) {
      Swal.fire({
        title: 'Pedido Finalizado',
        text: 'El pedido ya fue finalizado. Pulse Reiniciar para generar uno nuevo.',
        icon: 'warning'
      });
      return;
    }
    const pi = new PedidoItemModel;
    pi.codigoLuongo = libro.codigoLuongo ? String(libro.codigoLuongo) : null;
    pi.libro = libro.descripcion;
    pi.autor = libro.autor;
    pi.editorial = libro.editorial;
    pi.precio = libro.precio;
    pi.isbn = libro.isbn;
    pi.cantidad = 1;
    this.pedidosService.addPedidoItem(pi);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Libro agregado al pedido',
      showConfirmButton: false,
      timer: 1500
    });
  }
}
