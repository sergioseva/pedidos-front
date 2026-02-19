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
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading = false;
  error = false;
  errMessage: string;

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
        this.loading = false;
      });
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
