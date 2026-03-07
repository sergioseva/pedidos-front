import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pedidoLibros'
})
export class PedidoLibrosPipe implements PipeTransform {

  transform(pedido: any, args?: any): any {
    const groups = new Map<string, { cantidad: number; libro: string; autor: string }>();
    for (const pi of pedido.pedidoItems) {
      const key = `${pi.libro}||${pi.autor}||${pi.editorial}||${pi.precio}`;
      if (groups.has(key)) {
        groups.get(key).cantidad += pi.cantidad;
      } else {
        groups.set(key, { cantidad: pi.cantidad, libro: pi.libro, autor: pi.autor });
      }
    }
    let libros = ' <ul>';
    for (const g of groups.values()) {
      libros += '<li> ' + g.cantidad + '-' + g.libro + '(' + g.autor + ')' + ' </li>';
    }
    return libros + ' </ul>';
  }

}
