import { Component, OnInit } from '@angular/core';
import { PedidoModel } from 'src/app/models/pedido.model';
import { PedidosService } from 'src/app/providers/pedidos.service';
import { PedidoItemModel } from '../../models/pedido.item';
import { ClienteModel } from '../../models/cliente.model';
import { ClientesServiceService } from '../../providers/clientes-service.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { PrintPedidoService } from '../../providers/print-pedido.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {

  forma: FormGroup;
  private pedido: PedidoModel;
  pitems: PedidoItemModel[];
  private clienteSeleccionado: ClienteModel;
  private clientes: any [];

  constructor( private pedidosService: PedidosService,
               private clientesService: ClientesServiceService,
               private printService: PrintPedidoService) {
                this.buildForm();

  }

  private buildForm() {
    this.forma = new FormGroup({
      'cliente': new FormControl('', Validators.required),
      'observaciones': new FormControl(''),
      'senia': new FormControl('' ,
                          [ Validators.required,
                            Validators.pattern('^[0-9]*$')
                            ]),
    });

  }

  generarNuevoPedido(){
    this.pedidosService.generarNuevoPedido();
  }

  onReiniciar(){
    this.forma.reset();
    this.pedidosService.generarNuevoPedido();
  }

  onSubmit(){

    this.pedidosService.asignarDatos(this.clienteSeleccionado, this.forma.controls.senia.value, this.forma.controls.observaciones.value);
    Swal.fire({
      title: 'Espere',
      text: 'Generando el pedido información',
      type: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.pedidosService.grabarPedido().subscribe(
        resp => {
                  Swal.fire({
                  title: 'Pedido',
                  text: `Pedido ingresado!`,
                  type: 'success'
        });
        this.pedido.id = resp['id'];
        console.log(this.pedido.id);
        this.pedidosService.finalizarPedido();
      },
        err => {      Swal.fire({
                      title: 'Pedido',
                      text: 'Error al ingresar el pedido, ud está en el horno',
                      type: 'error'
        }); }

    );
  }

  ngOnInit() {
    // this.pedidosService.currentPedido.subscribe(pedido => this.pedido = pedido);
    this.pedidosService.currentPedido.subscribe(pedido => {this.pedido = pedido;
    });
    this.clientesService.getClientesPorCualquier('')
            .subscribe( (clientes) => {this.clientes = clientes;
                                       this.clientes.forEach(c => c.label = `${c.nombre} - ${c.telefonoMovil}` );
                                      console.log(this.clientes ); });

  }

   borrarItem( pi: PedidoItemModel, i: number){
      this.pedidosService.removePedidoItem(pi);
  }

  onImprimir(){
      this.printService.imprimirPedido(this.pedido.id);
  }

}
