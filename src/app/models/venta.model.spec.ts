import { VentaModel } from './venta.model';
import { VentaItemModel } from './venta.item';

function item(isbn: string, cantidad: number, precio: number): VentaItemModel {
  const i = new VentaItemModel();
  i.isbn = isbn;
  i.libro = `Libro ${isbn}`;
  i.cantidad = cantidad;
  i.precio = precio;
  return i;
}

describe('VentaModel', () => {

  it('starts empty with a zero total', () => {
    const venta = new VentaModel();
    expect(venta.items.length).toBe(0);
    expect(venta.total).toBe(0);
  });

  it('sums cantidad * precio across the lines', () => {
    const venta = new VentaModel();
    venta.addItem(item('111', 2, 100));
    venta.addItem(item('222', 1, 50.5));
    expect(venta.total).toBe(250.5);
  });

  it('recalculates when a line is removed', () => {
    const venta = new VentaModel();
    const uno = item('111', 2, 100);
    venta.addItem(uno);
    venta.addItem(item('222', 1, 50));
    venta.removeItem(uno);
    expect(venta.items.length).toBe(1);
    expect(venta.total).toBe(50);
  });

  it('finds a line by ISBN so a repeat scan can bump it', () => {
    const venta = new VentaModel();
    venta.addItem(item('111', 1, 100));
    expect(venta.buscarPorIsbn('111')).toBeTruthy();
    expect(venta.buscarPorIsbn('999')).toBeUndefined();
  });
});
