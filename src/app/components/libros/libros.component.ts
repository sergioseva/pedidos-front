import { Component, OnInit } from '@angular/core';
import { LibroModel } from '../../models/libro.model';
import { LibrosService } from '../../providers/libros.service';
import {  LocalDataSource } from 'ng2-smart-table';
import { PedidosService } from '../../providers/pedidos.service';
import { PedidoItemModel } from '../../models/pedido.item';
import { PrintPedidoService } from '../../providers/print-pedido.service';



@Component({
  selector: 'app-libros',
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit {
  libros: LibroModel[];
  cantItemsPedido = 0;

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
  constructor(private librosService: LibrosService,
              private pedidosService: PedidosService,
              private printService: PrintPedidoService) {

   // this.source = new LocalDataSource(this.libros);
   }

  ngOnInit() {
    this.pedidosService.currentPedido.subscribe(pedido => {this.cantItemsPedido = pedido.pedidoItems.length;});
     
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
    const pi = new PedidoItemModel;
    pi.codigoLuongo = event.data.codigoLuongo;
    pi.libro = event.data.descripcion;
    pi.autor = event.data.autor;
    pi.editorial = event.data.editorial;
    pi.precio = event.data.precio;
    pi.isbn = event.data.isbn;
    pi.cantidad = 1;
    this.pedidosService.addPedidoItem(pi);
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
