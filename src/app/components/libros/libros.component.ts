import { Component, OnInit } from '@angular/core';
import { LibroModel } from '../../models/libro.model';
import { LibrosService } from '../../providers/libros.service';
import {  LocalDataSource } from 'ng2-smart-table';



@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit {
  libros: LibroModel[];
  source: LocalDataSource;

  settings = {
    noDataMessage: 'no hay registros',
    actions: {columnTitle: 'Acciones',
    custom: [
      {
        name: 'agregarPedido',
        title: '<i  title="Agregar al pedido" class="fa fa-plus-circle "></i> &nbsp;'
      }
    ],
    },
    add: {
      addButtonContent: '<i class="fa fa-plus"></i> Nuevo <br>',
      createButtonContent: '<i class="fa fa-check-square"> Ok </i> <br> ',
      cancelButtonContent: '<i class="fa fa-times"> Cancelar </i> ',
      confirmCreate: true
    },
    edit: {
      editButtonContent: '<i title="Editar" class="fa fa-edit"></i> &nbsp;',
      saveButtonContent: '<i class="fa fa-check-square"> Ok </i> <br> ',
      cancelButtonContent: '<i class="fa fa-times"> Cancel </i> ',
      confirmSave:true
    },
    delete: {
      deleteButtonContent: '<i title="Eliminar" class="fa fa-minus-square"></i>',
      confirmDelete: true
    },
    columns: {
      descripcion: {
        title: 'Nombre',
        // type: 'html',
        // valuePrepareFunction: (valor, registro) => {
        //         let imagen;
        //         if (registro.isbn) {
        //           return `<img src="https://contentv2.tap-commerce.com/cover/small/${registro.isbn}_1.jpg" title=${valor}>`
        //         }; 
        //         return valor;
        //   }
        },
      autor: {
        title: 'Autor'
      },
      precio: {
        title: 'Precio',
         valuePrepareFunction: (value) => Intl.NumberFormat('es-AR',{style:'currency', currency: 'ARS'}).format(value)
      },
      editorial: {
        title: 'Editorial'
      },
      isbn: {
        title: 'ISBN'
      },
      observaciones: {
        title: 'Observaciones'
      },
      // boton: {
      //   title: 'Boton', editable: false,  filter: false, type: 'custom', renderComponent: LibroBotonesRenderComponent,
      //   onComponentInitFunction: (instance) =>{
      //     instance.click.subscribe(row => {
      //       console.log(row);
      //     });
      //   },
      // }
    }
  };
  constructor(private librosService: LibrosService) {

    this.source = new LocalDataSource(this.libros);
   }

  ngOnInit() {
  }

  onCreateConfirm(event: any){
    //const libro: LibroModel = event.newData;
    this.librosService.insertLibro(event.newData)
            .subscribe(
              resp => {event.confirm.resolve(); },
              err => {event.confirm.reject(); }
            );
  }

  onEditConfirm(event: any){
    this.librosService.updateLibro(event.newData)
    .subscribe(
      resp => {event.confirm.resolve(); },
      err => {event.confirm.reject(); }
    );
  }
  onDeleteConfirm(event: any){
    this.librosService.deleteLibro(event.data)
    .subscribe(
      resp => {event.confirm.resolve(); },
      err => {event.confirm.reject(); }
    );
  }

  onCustom(event: any){
    console.log(event);
  }
  buscarLibros(termino: string) {
    this.librosService.buscarLibros(termino).subscribe(
      (libros: any[]) => {
        console.log(libros);
        this.libros = libros;
      }
    );
}



}
