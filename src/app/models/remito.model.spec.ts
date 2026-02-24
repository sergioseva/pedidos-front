import { RemitoModel } from './remito.model';
import { RemitoItemModel } from './remito-item.model';

describe('RemitoModel', () => {
  let remito: RemitoModel;

  beforeEach(() => {
    remito = new RemitoModel();
  });

  it('should initialize with default values', () => {
    expect(remito.items).toEqual([]);
    expect(remito.finalizado).toBe(false);
  });

  describe('addItem', () => {
    it('should add an item', () => {
      const item = new RemitoItemModel();
      item.ri_precio = 100;
      item.ri_cantidad = 2;

      remito.addItem(item);

      expect(remito.items.length).toBe(1);
      expect(remito.items[0]).toBe(item);
    });

    it('should accumulate with multiple items', () => {
      const item1 = new RemitoItemModel();
      item1.ri_precio = 100;
      item1.ri_cantidad = 1;

      const item2 = new RemitoItemModel();
      item2.ri_precio = 200;
      item2.ri_cantidad = 1;

      remito.addItem(item1);
      remito.addItem(item2);

      expect(remito.items.length).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by reference', () => {
      const item = new RemitoItemModel();
      item.ri_precio = 100;
      item.ri_cantidad = 1;
      remito.addItem(item);

      remito.removeItem(item);

      expect(remito.items.length).toBe(0);
    });

    it('should not throw for missing item', () => {
      const item = new RemitoItemModel();
      expect(() => remito.removeItem(item)).not.toThrow();
    });
  });

  describe('calcularTotal', () => {
    it('should return 0 for empty items', () => {
      expect(remito.calcularTotal()).toBe(0);
    });

    it('should sum ri_cantidad * ri_precio for all items', () => {
      const item1 = new RemitoItemModel();
      item1.ri_precio = 200;
      item1.ri_cantidad = 3;

      const item2 = new RemitoItemModel();
      item2.ri_precio = 150;
      item2.ri_cantidad = 2;

      remito.items.push(item1, item2);

      expect(remito.calcularTotal()).toBe(900);
    });

    it('should return a number (not stored on property)', () => {
      const item = new RemitoItemModel();
      item.ri_precio = 100;
      item.ri_cantidad = 2;
      remito.items.push(item);

      const total = remito.calcularTotal();

      expect(typeof total).toBe('number');
      expect(total).toBe(200);
    });
  });
});
