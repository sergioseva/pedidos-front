import { Component, OnInit } from '@angular/core';
import { LibroModel } from '../../models/libro.model';
import { LibrosService } from '../../providers/libros.service';
import { Ng2SmartTableModule, LocalDataSource } from 'ng2-smart-table';
import { LibroBotonesRenderComponent } from '../libro-botones-render/libro-botones-render.component';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit {
  libros: LibroModel[];
  source: LocalDataSource;

  settings = {
    columns: {
      descripcion: {
        title: 'Nombre'
      },
      autor: {
        title: 'Autor'
      },
      precio: {
        title: 'Precio'
      },
      boton: {
        title: 'Boton',  filter: false, type: 'custom', renderComponent: LibroBotonesRenderComponent,
        onComponentInitFunction: (instance) =>{
          instance.click.subscribe(row => {
            console.log(row);
          });
        }
      }
    }
  };
  constructor(private librosService: LibrosService, private sanitizer: DomSanitizer) {

    this.source = new LocalDataSource(this.libros);
   }

  ngOnInit() {
  }

  buscarLibros(termino: string) {
    this.librosService.buscarLibros(termino).subscribe(
      (libros: any[]) => {
        console.log(libros);
        libros.map(libro => libro.boton = this.sanitizer.bypassSecurityTrustHtml( `<button title="Modificar ${libro.titulo}" 
        [routerLink]="[ '/libro', libro.id] " type="button " class="btn btn-outline-info ">
        <i class="fa fa-pencil "></i></button>`));
        this.libros = libros;
      }
    );
}



}
