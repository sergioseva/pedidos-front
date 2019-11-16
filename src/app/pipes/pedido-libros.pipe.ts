import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pedidoLibros'
})
export class PedidoLibrosPipe implements PipeTransform {

  transform(pedido: any, args?: any): any {

    let libros:String=" <ul>";
    for (const pi of pedido.pedidoItems){
      libros+="<li> " + pi.cantidad + "-" +pi.libro + "(" + pi.autor +")" + " </li>";
    }
/*     pedido.pedidoItems.forEach(pi => {
      peliculas+=pi.cantidad + " " +pi.libro;
    }); */
    return libros+ " </ul>";
  }

}
