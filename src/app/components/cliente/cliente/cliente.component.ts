import { Component, OnInit } from '@angular/core';
import { ClienteModel } from '../../../models/cliente.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  cliente: ClienteModel; 
  forma: FormGroup;
  constructor() { 
    this.cliente = new ClienteModel();
    this.buildForm();
  }

  ngOnInit() {
  }


  private buildForm() {
    this.forma = new FormGroup({
      'nombre': new FormControl(this.cliente.nombre, Validators.required),
      'direccion': new FormControl(this.cliente.direccion , Validators.required),
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
    console.log(this.forma.controls['telefonoFijo']);
  }

}
