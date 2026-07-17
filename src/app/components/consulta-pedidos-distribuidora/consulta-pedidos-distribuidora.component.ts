import { Component, OnInit, TemplateRef } from '@angular/core';
import { PedidoDistribuidoraService } from 'src/app/providers/pedido-distribuidora.service';
import { PedidosService } from 'src/app/providers/pedidos.service';
import { DistribuidoraService } from 'src/app/providers/distribuidora.service';
import { DatePipe } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-consulta-pedidos-distribuidora',
  templateUrl: './consulta-pedidos-distribuidora.component.html',
  styleUrls: ['./consulta-pedidos-distribuidora.component.css']
})
export class ConsultaPedidosDistribuidoraComponent implements OnInit {

  pedidos: any[];
  filteredPedidos: any[] = [];
  /** Which date preset is applied, so the pill shows as selected. */
  filtroActivo: number = null;
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading = false;
  error = false;
  errMessage: string;
  searchPerformed = false;

  sortColumn = 'fecha';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  distribuidoras: any[] = [];
  filterDistribuidora: number = null;
  filterConfirmado: string = '';

  modalRef: BsModalRef;
  pedidoDetalle: any = null;
  loadingPedido = false;

  constructor(private pds: PedidoDistribuidoraService,
              private pedidosService: PedidosService,
              private distribuidoraService: DistribuidoraService,
              private datePipe: DatePipe,
              private modalService: BsModalService) { }

  ngOnInit() {
    this.distribuidoraService.getDistribuidoras().subscribe(
      (items) => {
        this.distribuidoras = items;
      }
    );
    this.dateFilter(0);
    this.buscarTermino('');
  }

  buscarTermino(termino: string) {
    this.loading = true;
    this.pedidos = new Array();
    this.pds.buscarPedidosDistribuidora(termino,
                          this.datePipe.transform(this.fromDate, 'yyyy-MM-dd'),
                          this.datePipe.transform(this.toDate, 'yyyy-MM-dd'))
      .subscribe((data: any) => {
        this.pedidos = data;
        this.applyFiltersAndSort();
        this.loading = false;
        this.error = false;
        this.searchPerformed = true;
      },
      (err) => {
        this.loading = false;
        this.error = true;
        this.errMessage = (err.error && err.error.message) || 'Error al buscar pedidos a distribuidora';
      });
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
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    if (!this.pedidos) {
      this.filteredPedidos = [];
      return;
    }
    let result = this.pedidos.slice();

    if (this.filterDistribuidora) {
      result = result.filter(p => p.distribuidora?.id === this.filterDistribuidora);
    }
    if (this.filterConfirmado === 'si') {
      result = result.filter(p => p.realizado);
    } else if (this.filterConfirmado === 'no') {
      result = result.filter(p => !p.realizado);
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
    this.filteredPedidos = result;
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

  verPedido(pedidoId: number, template: TemplateRef<any>) {
    this.pedidoDetalle = null;
    this.loadingPedido = true;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    this.pedidosService.getPedidoProjection(pedidoId).subscribe((data: any) => {
      this.pedidoDetalle = data;
      this.pedidoDetalle.groupedItems = this.groupItems(data.pedidoItems);
      this.loadingPedido = false;
    });
  }

  groupItems(items: any[]): any[] {
    const groups = new Map<string, any>();
    for (const pi of items) {
      const key = `${pi.libro}||${pi.autor}||${pi.editorial}||${pi.precio}`;
      if (groups.has(key)) {
        groups.get(key).cantidad += pi.cantidad;
      } else {
        groups.set(key, { ...pi, cantidad: pi.cantidad });
      }
    }
    return Array.from(groups.values());
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }
}
