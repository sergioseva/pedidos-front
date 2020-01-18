import { Component, OnInit } from '@angular/core';
import { LibroModel } from '../../models/libro.model';
import { LibrosService } from '../../providers/libros.service';

@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit {
  libros: LibroModel[];
  constructor(private librosService: LibrosService) { }

  ngOnInit() {
  }

  buscarLibros(termino: string) {
    this.librosService.buscarLibros(termino).subscribe(
      (libros: any) => {
        console.log(libros);
        this.libros = libros;
      }
    );
}

}
