import { Pipe, PipeTransform } from '@angular/core';
import { LibroModel } from '../models/libro.model';

@Pipe({
  name: 'libroImagen'
})
export class LibroImagenPipe implements PipeTransform {

  transform(libro: LibroModel, args?: any): any {

    const noimage = 'assets/img/no-image.gif';

    if (libro.isbn) {
      return `http://covers.openlibrary.org/b/isbn/${libro.isbn}-M.jpg`
    } else {
      return noimage;
    }
  }

}
