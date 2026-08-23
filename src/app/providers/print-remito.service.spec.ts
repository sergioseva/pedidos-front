import { PrintRemitoService } from './print-remito.service';
import { mockRouter } from '../testing/test-helpers';

describe('PrintRemitoService', () => {
  let service: PrintRemitoService;
  let router: any;

  beforeEach(() => {
    router = mockRouter();
    service = new PrintRemitoService(router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize isPrinting to false', () => {
    expect(service.isPrinting).toBe(false);
  });

  describe('imprimirRemito', () => {
    it('should set isPrinting to true', () => {
      service.imprimirRemito(1);
      expect(service.isPrinting).toBe(true);
    });

    it('should navigate to print outlet with remitoId', () => {
      service.imprimirRemito(42);
      expect(router.navigate).toHaveBeenCalledWith(['/', {
        outlets: { 'print': ['print', 'printremito', 42] }
      }]);
    });
  });

  describe('onDataReady', () => {
    /**
     * El documento tiene que seguir montado mientras el navegador imprime. Desarmarlo apenas
     * vuelve window.print() sacaba el documento del DOM antes de que la pantalla se destapara,
     * y la vista previa salia en blanco.
     */
    it('keeps the document mounted until the browser finishes printing', (done) => {
      spyOn(window, 'print');
      service.isPrinting = true;

      service.onDataReady();

      setTimeout(() => {
        expect(window.print).toHaveBeenCalled();
        expect(service.isPrinting).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    it('tears down once afterprint fires', (done) => {
      spyOn(window, 'print');
      service.isPrinting = true;

      service.onDataReady();

      setTimeout(() => {
        window.dispatchEvent(new Event('afterprint'));

        expect(service.isPrinting).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { print: null } }]);
        done();
      }, 50);
    });

    /** Un segundo afterprint no debe volver a navegar sobre una impresion ya cerrada. */
    it('tears down only once', (done) => {
      spyOn(window, 'print');

      service.onDataReady();

      setTimeout(() => {
        window.dispatchEvent(new Event('afterprint'));
        window.dispatchEvent(new Event('afterprint'));

        expect(router.navigate).toHaveBeenCalledTimes(1);
        done();
      }, 50);
    });

    /** Imprimir dos veces seguidas tiene que armar y desarmar cada una por su cuenta. */
    it('handles a second print after the first one finished', (done) => {
      spyOn(window, 'print');

      service.imprimirRecibo(1);
      service.onDataReady();

      setTimeout(() => {
        window.dispatchEvent(new Event('afterprint'));
        expect(service.isPrinting).toBe(false);

        service.imprimirRecibo(2);
        expect(service.isPrinting).toBe(true);
        service.onDataReady();

        setTimeout(() => {
          expect(service.isPrinting).toBe(true);
          window.dispatchEvent(new Event('afterprint'));
          expect(service.isPrinting).toBe(false);
          expect(router.navigate).toHaveBeenCalledTimes(4);
          done();
        }, 50);
      }, 50);
    });
  });
});
