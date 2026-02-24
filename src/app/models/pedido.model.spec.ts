import { PedidoModel } from './pedido.model';
import { PedidoItemModel } from './pedido.item';

describe('PedidoModel', () => {
  let pedido: PedidoModel;

  beforeEach(() => {
    pedido = new PedidoModel();
  });

  it('should initialize with default values', () => {
    expect(pedido.pedidoItems).toEqual([]);
    expect(pedido.total).toBe(0);
    expect(pedido.finalizado).toBe(false);
  });

  describe('addPedidoItem', () => {
    it('should add an item to pedidoItems', () => {
      const item = new PedidoItemModel();
      item.precio = 100;
      item.cantidad = 2;

      pedido.addPedidoItem(item);

      expect(pedido.pedidoItems.length).toBe(1);
      expect(pedido.pedidoItems[0]).toBe(item);
    });

    it('should recalculate total after adding', () => {
      const item = new PedidoItemModel();
      item.precio = 100;
      item.cantidad = 2;

      pedido.addPedidoItem(item);

      expect(pedido.total).toBe(200);
    });

    it('should accumulate total with multiple items', () => {
      const item1 = new PedidoItemModel();
      item1.precio = 100;
      item1.cantidad = 2;

      const item2 = new PedidoItemModel();
      item2.precio = 50;
      item2.cantidad = 3;

      pedido.addPedidoItem(item1);
      pedido.addPedidoItem(item2);

      expect(pedido.pedidoItems.length).toBe(2);
      expect(pedido.total).toBe(350);
    });
  });

  describe('removePedidoItem', () => {
    it('should remove an item by reference', () => {
      const item = new PedidoItemModel();
      item.precio = 100;
      item.cantidad = 1;
      pedido.addPedidoItem(item);

      pedido.removePedidoItem(item);

      expect(pedido.pedidoItems.length).toBe(0);
    });

    it('should recalculate total after removal', () => {
      const item1 = new PedidoItemModel();
      item1.precio = 100;
      item1.cantidad = 2;

      const item2 = new PedidoItemModel();
      item2.precio = 50;
      item2.cantidad = 1;

      pedido.addPedidoItem(item1);
      pedido.addPedidoItem(item2);
      pedido.removePedidoItem(item1);

      expect(pedido.total).toBe(50);
    });

    it('should not throw for missing item', () => {
      const item = new PedidoItemModel();
      item.precio = 100;
      item.cantidad = 1;

      expect(() => pedido.removePedidoItem(item)).not.toThrow();
    });

    it('should set total to 0 when all items removed', () => {
      const item = new PedidoItemModel();
      item.precio = 100;
      item.cantidad = 2;
      pedido.addPedidoItem(item);

      pedido.removePedidoItem(item);

      expect(pedido.total).toBe(0);
    });
  });

  describe('calcularTotal', () => {
    it('should return 0 for empty items', () => {
      pedido.calcularTotal();
      expect(pedido.total).toBe(0);
    });

    it('should sum cantidad * precio for all items', () => {
      const item1 = new PedidoItemModel();
      item1.precio = 200;
      item1.cantidad = 3;

      const item2 = new PedidoItemModel();
      item2.precio = 150;
      item2.cantidad = 2;

      pedido.pedidoItems.push(item1, item2);
      pedido.calcularTotal();

      expect(pedido.total).toBe(900);
    });
  });
});
