import { Component, OnInit } from '@angular/core';
import { ClientesServiceService } from 'src/app/providers/clientes-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteModel } from 'src/app/models/cliente.model';
import Swal from 'sweetalert2';


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

  // Sorting. The list is paginated on the server, so the sort has to go to the server too (a
  // client-side sort would only reorder the 20 rows on screen). SDR sorts by entity property name.
  sortField = 'id';
  sortDir: 'asc' | 'desc' = 'desc';
  searchTermino = '';

  constructor(private _activadedRoute:ActivatedRoute,private clientesService:ClientesServiceService) {
    this._activadedRoute.params.subscribe(params => {
      this.pagina=params['page'];
    });
   }

  ngOnInit() {
    this.load();
  }

  private load() {
    this.clientesService.getClientes(this.sortParam()).subscribe(
      (cs:any)=>{
        this.aplicarPagina(cs, 1);
      }
    )
  }

  setPage(p:number){
    this.clientesService.getClientesPage(p, this.sortParam()).subscribe(
      (cs:any)=>{
        this.aplicarPagina(cs, p);
      }
    )
  }

  private aplicarPagina(cs: any, page: number) {
    this.totalPages=cs.page.totalPages;
    this.pages=new Array(this.totalPages);
    this.clientes=cs._embedded ? cs._embedded.clientes : [];
    this.total=cs.page.totalElements;
    this.first=cs.page.first;
    this.prev=cs.page.prev;
    this.next=cs.page.next;
    this.last=cs.page.last;
    this.currentPage=page;
  }

  private sortParam(): string {
    return `${this.sortField},${this.sortDir}`;
  }

  toggleSort(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    if (this.searchTermino) {
      // Search results come back as a plain array; sort those in place.
      this.ordenarLocal();
    } else {
      // Sorting resets to the first page, so you don't land mid-list in a new order.
      this.load();
    }
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-asc' : 'fa-sort-desc';
  }

  private ordenarLocal() {
    const field = this.sortField;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.clientes = [...(this.clientes || [])].sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (va == null) { return 1; }
      if (vb == null) { return -1; }
      return va > vb ? dir : va < vb ? -dir : 0;
    });
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
      if (!termino || termino.trim() === '') {
        this.searchTermino = '';
        this.load();
        return;
      }
      this.searchTermino = termino;
      this.clientesService.getClientesPorCualquier(termino).subscribe(
        (cs: any) => {
          this.clientes = cs;
          this.total = cs.length;
          this.totalPages = 1;
          this.currentPage = 1;
          this.pages = new Array(1);
          this.ordenarLocal();
        }
      );
  }

  validaryBorrarCliente( cliente: ClienteModel ){
    const promiseTienePedidos= new Promise<ClienteModel>((resolve, reject) => {
          this.clientesService.checkPedidos(cliente.id)
          .subscribe(
            (valor: Boolean) => {
                       if (valor) {
                            reject(cliente);
                        } else {
                            resolve(cliente);
                      }
            }
          );
    });

    promiseTienePedidos.then( (clientePromise: ClienteModel) => this.borrarCliente(clientePromise))
                          .catch( idCliente => Swal.fire({
                                                    title: 'Cliente',
                                                    text: `El cliente tiene pedidos, no se puede eliminar` ,
                                                    icon: 'error'
                                 }));
}

borrarCliente(cliente: ClienteModel) {
      Swal.fire({
        title: '¿Está seguro?',
        text: `Está seguro que desea borrar a ${ cliente.nombre }`,
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true
      }).then( resp => {
          if ( resp.value ) {
            this.clientesService.deleteCliente(cliente.id).subscribe(
                resp => { this.clientes = this.clientes.filter(c => c.id !== cliente.id); },
                err => {Swal.fire({
                  title: 'Cliente',
                  text: `Error al procesar la operacion` ,
                  icon: 'error'
                });}
            );
          }
      });
}

}
