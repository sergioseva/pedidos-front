import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintRemitoService {
  isPrinting = false;

  constructor(private router: Router) { }

  imprimirRemito(remitoId: number) {
    this.isPrinting = true;
    this.router.navigate(['/',
    { outlets: {
      'print': ['print', 'printremito', remitoId]
    }}]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null }}]);
    });
  }

}
