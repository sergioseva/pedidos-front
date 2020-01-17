import { Component, OnInit } from '@angular/core';
import { ClientesServiceService } from 'src/app/providers/clientes-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteModel } from 'src/app/models/cliente.model';
import Swal from 'sweetalert2';
import { promise } from 'protractor';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes:any[];
  pages:number[];
  total:number;
  totalPages:number;
  first:string;
  prev:string;
  next:string;
  last:string;
  currentPage:number;
  pagina:number;
  currentIndex: number;
  
  constructor(private _activadedRoute:ActivatedRoute,private clientesService:ClientesServiceService) {
    this._activadedRoute.params.subscribe(params => {
      this.pagina=params['page'];
    });
   }

  ngOnInit() {
    this.clientesService.getClientes().subscribe(
      (cs:any)=>{
        console.log(cs);
        this.totalPages=cs.page.totalPages;
        this.pages=new Array(this.totalPages);
        this.clientes=cs._embedded.clientes;
        this.total=cs.page.totalElements;
        this.first=cs.page.first;
        this.prev=cs.page.prev;
        this.next=cs.page.next;
        this.last=cs.page.last;
        this.currentPage=1;
      }
    )
  }

  setPage(p:number){
    this.clientesService.getClientesPage(p).subscribe(
      (cs:any)=>{
        console.log(cs);
        this.totalPages=cs.page.totalPages;
        this.pages=new Array(this.totalPages);
        this.clientes=cs._embedded.clientes;
        this.total=cs.page.totalElements;
        this.first=cs.page.first;
        this.prev=cs.page.prev;
        this.next=cs.page.next;
        this.last=cs.page.last;
        this.currentPage=p;
      }
    )
  }
  /* setPageF(inc:number){

    this.clientesService.getClientesPage(this.currentPage+inc).subscribe(
      (cs:any)=>{
        console.log(cs);
        this.totalPages=cs.page.totalPages;
        this.pages=new Array(this.totalPages);
        this.clientes=cs._embedded.clientes;
        this.total=cs.page.totalElements;
        this.first=cs.page.first;
        this.prev=cs.page.prev;
        this.next=cs.page.next;
        this.last=cs.page.last;
        this.currentPage=this.currentPage + inc;
      }
    )
  } */


  pageChanged(event: any): void {
    this.setPage(event.page);
  }

  buscarCliente(termino: string) {
      this.clientesService.getClientesPorCualquier(termino).subscribe(
        (cs: any) => {
          console.log(cs);
          this.clientes = cs;
        }
      );
  }

  validaryBorrarCliente( cliente: ClienteModel , i: number){
    const promiseTienePedidos= new Promise<ClienteModel>((resolve, reject) => {
          this.clientesService.checkPedidos(cliente.id)
          .subscribe(
            (valor: Boolean) => {
                       if (valor) {
                            reject(cliente);
                        } else {
                            this.currentIndex = i;
                            resolve(cliente);
                      }
            }
          );
    });

    promiseTienePedidos.then( (clientePromise: ClienteModel) => this.borrarCliente(clientePromise))
                          .catch( idCliente => Swal.fire({
                                                    title: 'Cliente',
                                                    text: `El cliente tiene pedidos, no se puede eliminar` ,
                                                    type: 'error'
                                 }));
}

borrarCliente(cliente: ClienteModel) {
      Swal.fire({
        title: '¿Está seguro?',
        text: `Está seguro que desea borrar a ${ cliente.nombre }`,
        type: 'question',
        showConfirmButton: true,
        showCancelButton: true
      }).then( resp => {
          if ( resp.value ) {
            this.clientesService.deleteCliente(cliente.id).subscribe(
                resp => {this.clientes.splice(this.currentIndex, 1); },
                err => {Swal.fire({
                  title: 'Cliente',
                  text: `Error al procesar la operacion` ,
                  type: 'error'
                });}
            );
          }
      });
}

}
