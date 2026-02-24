import { PedidoLibrosPipe } from './pedido-libros.pipe';

describe('PedidoLibrosPipe', () => {
  let pipe: PedidoLibrosPipe;

  beforeEach(() => {
    pipe = new PedidoLibrosPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a single item as ul/li', () => {
    const pedido = {
      pedidoItems: [
        { cantidad: 2, libro: 'El Quijote', autor: 'Cervantes' }
      ]
    };

    const result = pipe.transform(pedido);

    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('2-El Quijote(Cervantes)');
    expect(result).toContain('</ul>');
  });

  it('should format multiple items', () => {
    const pedido = {
      pedidoItems: [
        { cantidad: 1, libro: 'Book A', autor: 'Author A' },
        { cantidad: 3, libro: 'Book B', autor: 'Author B' }
      ]
    };

    const result = pipe.transform(pedido);

    expect(result).toContain('1-Book A(Author A)');
    expect(result).toContain('3-Book B(Author B)');
  });

  it('should handle empty items array', () => {
    const pedido = { pedidoItems: [] };

    const result = pipe.transform(pedido);

    expect(result).toContain('<ul>');
    expect(result).toContain('</ul>');
    expect(result).not.toContain('<li>');
  });
});
