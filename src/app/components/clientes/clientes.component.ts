import { Component, OnInit } from '@angular/core';
import { ClientesServiceService } from 'src/app/providers/clientes-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';


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
  
  constructor(private _activadedRoute:ActivatedRoute,private clientesService:ClientesServiceService) {
    this._activadedRoute.params.subscribe(params => {
      //this.heroes=_heroesService.buscarHeroes(params['termino'])
      console.log(params);
      this.pagina=params['page'];
      console.log(this.pagina);
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

}
