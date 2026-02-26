import { Component, OnInit } from '@angular/core';
import { RemitosService } from 'src/app/providers/remitos.service';
import { DatePipe } from '@angular/common';
import { RemitoModel } from '../../models/remito.model';
import { PrintRemitoService } from 'src/app/providers/print-remito.service';

@Component({
  selector: 'app-remitos',
  templateUrl: './remitos.component.html',
  styleUrls: ['./remitos.component.css']
})
export class RemitosComponent implements OnInit {

  remitos: any[];
  filteredRemitos: any[] = [];
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading = false;
  error = false;
  errMessage: string;
  searchPerformed = false;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  constructor(public printService: PrintRemitoService,
              private rs: RemitosService,
              private datePipe: DatePipe) { }

  ngOnInit() {
    this.dateFilter(0);
    this.buscarTermino('');
  }

  imprimir(remito: RemitoModel) {
    this.printService.imprimirRemito(remito.re_remito_k);
  }

  buscarTermino(termino: string) {
    this.loading = true;
    this.remitos = new Array();
    this.rs.buscarRemitos(termino,
                          this.datePipe.transform(this.fromDate, 'yyyy-MM-dd'),
                          this.datePipe.transform(this.toDate, 'yyyy-MM-dd'))
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
    const result = this.remitos.slice();
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
    const past = new Date();
    const today = new Date();
    past.setDate(past.getDate() - days);
    today.setDate(today.getDate() + 1);
    this.fromDate = this.datePipe.transform(past, 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.buscarTermino('');
  }
}
