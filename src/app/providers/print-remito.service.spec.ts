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
    it('should call window.print and reset isPrinting', (done) => {
      spyOn(window, 'print');
      service.isPrinting = true;

      service.onDataReady();

      setTimeout(() => {
        expect(window.print).toHaveBeenCalled();
        expect(service.isPrinting).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith([{ outlets: { print: null } }]);
        done();
      }, 50);
    });
  });
});
