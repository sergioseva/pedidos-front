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

  /** El recibo se imprime por el remito de venta al que pertenece. */
  imprimirRecibo(remitoVentaId: number) {
    this.isPrinting = true;
    this.router.navigate(['/',
    { outlets: {
      'print': ['print', 'printrecibo', remitoVentaId]
    }}]);
  }

  /**
   * El desarme espera a que el navegador termine de imprimir.
   *
   * Antes se apagaba `isPrinting` y se vaciaba el outlet inmediatamente despues de window.print().
   * Eso abre una ventana peligrosa: quitar el componente del outlet saca el documento del DOM al
   * instante, mientras que la clase `isPrinting` que tapa la pantalla solo desaparece cuando
   * Angular corre deteccion de cambios. Si el navegador arma la vista previa dentro de esa
   * ventana, no encuentra ni el documento ni la pantalla y sale una hoja en blanco. Con
   * 'afterprint' el DOM queda intacto durante toda la impresion.
   *
   * El temporizador es un seguro: si 'afterprint' no llega (algun navegador no lo emite), la
   * aplicacion no puede quedarse con la pantalla tapada para siempre.
   */
  onDataReady() {
    setTimeout(() => {
      let terminado = false;
      const finalizar = () => {
        if (terminado) {
          return;
        }
        terminado = true;
        window.removeEventListener('afterprint', finalizar);
        this.isPrinting = false;
        this.router.navigate([{ outlets: { print: null }}]);
      };

      window.addEventListener('afterprint', finalizar);
      setTimeout(finalizar, 60000);
      window.print();
    });
  }

}
