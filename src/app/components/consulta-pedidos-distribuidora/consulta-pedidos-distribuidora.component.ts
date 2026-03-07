import { Component, OnInit } from '@angular/core';
import { PedidoDistribuidoraService } from 'src/app/providers/pedido-distribuidora.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-consulta-pedidos-distribuidora',
  templateUrl: './consulta-pedidos-distribuidora.component.html',
  styleUrls: ['./consulta-pedidos-distribuidora.component.css']
})
export class ConsultaPedidosDistribuidoraComponent implements OnInit {

  pedidos: any[];
  filteredPedidos: any[] = [];
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading = false;
  error = false;
  errMessage: string;
  searchPerformed = false;

  sortColumn = 'fecha';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  constructor(private pds: PedidoDistribuidoraService,
              private datePipe: DatePipe) { }

  ngOnInit() {
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
        this.applySort();
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
    this.applySort();
  }

  applySort() {
    if (!this.pedidos) {
      this.filteredPedidos = [];
      return;
    }
    const result = this.pedidos.slice();
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
    const past = new Date();
    const today = new Date();
    past.setDate(past.getDate() - days);
    today.setDate(today.getDate() + 1);
    this.fromDate = this.datePipe.transform(past, 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.buscarTermino('');
  }
}
