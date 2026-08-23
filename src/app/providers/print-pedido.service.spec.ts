import { PrintPedidoService } from './print-pedido.service';
import { mockRouter } from '../testing/test-helpers';

describe('PrintPedidoService', () => {
  let service: PrintPedidoService;
  let router: any;

  beforeEach(() => {
    router = mockRouter();
    service = new PrintPedidoService(router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize isPrinting to false', () => {
    expect(service.isPrinting).toBe(false);
  });

  describe('imprimirPedido', () => {
    it('should set isPrinting to true', () => {
      service.imprimirPedido(1);

      expect(service.isPrinting).toBe(true);
    });

    it('should navigate to print outlet with pedidoId', () => {
      service.imprimirPedido(42);

      expect(router.navigate).toHaveBeenCalledWith(['/', {
        outlets: { 'print': ['print', 'printpedido', 42] }
      }]);
    });
  });

  describe('onDataReady', () => {
    /** Mismo desarme diferido que el servicio de remitos: sin esto la hoja sale en blanco. */
    it('keeps the document mounted until afterprint', (done) => {
      spyOn(window, 'print');
      service.isPrinting = true;

      service.onDataReady();

      setTimeout(() => {
        expect(window.print).toHaveBeenCalled();
        expect(service.isPrinting).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();

        window.dispatchEvent(new Event('afterprint'));

        expect(service.isPrinting).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { print: null } }]);
        done();
      }, 50);
    });
  });
});
