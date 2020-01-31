import { Component, OnInit } from '@angular/core';
import { ClienteModel } from '../../../models/cliente.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientesServiceService } from '../../../providers/clientes-service.service';
import Swal from 'sweetalert2';
import { provideForRootGuard } from '@angular/router/src/router_module';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  cliente: ClienteModel; 
  forma: FormGroup;
  id: any;
  href: string;
  headerText = 'Nuevo Cliente';
  constructor(private router: Router,
              private route: ActivatedRoute,
              private cs: ClientesServiceService,
    ) {
      this.cliente = new ClienteModel();
      this.buildForm();
      this.retrieveData();
  }

  ngOnInit() {
  }

  private retrieveData(): void {
    this.route.params
    .subscribe( parametros=>{
      this.id = parametros['id']
      if( this.id !== 'nuevo' ){
        this.cs.getCliente( this.id )
              .subscribe( (cliente: any) =>
                          { this.cliente = cliente;
                            this.headerText = cliente.nombre;
                            this.href = cliente._links.self.href;
                            this.forma.patchValue(cliente);
                            } );
      }
    });
}


  private buildForm() {
    this.forma = new FormGroup({
      'nombre': new FormControl(this.cliente.nombre, Validators.required),
      'direccion': new FormControl(this.cliente.direccion),
      'email': new FormControl(this.cliente.email ,  [
        Validators.required,
        Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
      ] // this.existeEmail.bind(this)
      ),
      'telefonoMovil': new FormControl(this.cliente.telefonoMovil , 
                          [ Validators.required,
                            Validators.pattern('^[0-9]*$'),
                            Validators.maxLength(10),
                            Validators.minLength(10)]),
      'telefonoFijo': new FormControl(this.cliente.telefonoFijo , 
                              [ Validators.pattern('^[0-9]*$'),
                                Validators.maxLength(10),
                                Validators.minLength(10)])
    });

    console.log(this.forma);
  }

  onSubmit(){
    this.cliente = this.forma.value;
    let peticion: Observable<any>;

    if( this.id !== 'nuevo' ){
      peticion = this.cs.updateCliente( this.href , this.cliente);
    } else {
      peticion = this.cs.insertCliente(this.cliente);
    }

    peticion.subscribe( resp => {
      Swal.fire({
        title: 'CLiente',
        text: `Se procesó correctamente`,
        type: 'success'
      });
      this.router.navigate(['/clientes']);
    },
    errr=> {
      Swal.fire({
        title: 'Cliente',
        text: `Error al procesar la operacion`,
        type: 'error'
      });
    });


  }

}
