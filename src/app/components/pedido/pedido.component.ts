import { Component, OnInit, TemplateRef, ViewChild, ApplicationRef } from '@angular/core';
import { PedidoModel } from 'src/app/models/pedido.model';
import { PedidosService } from 'src/app/providers/pedidos.service';
import { PedidoItemModel } from '../../models/pedido.item';
import { ClienteModel } from '../../models/cliente.model';
import { ClientesServiceService } from '../../providers/clientes-service.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { PrintPedidoService } from '../../providers/print-pedido.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {

  forma: FormGroup;
  pedido: PedidoModel;
  pitems: PedidoItemModel[];
  clienteSeleccionado: ClienteModel;
  clientes: any [];
  modalRef: BsModalRef;
  itemModalRef: BsModalRef;
  showNuevoCliente = false;
  nuevoCliente: ClienteModel = new ClienteModel();

  constructor( private pedidosService: PedidosService,
               private clientesService: ClientesServiceService,
               private printService: PrintPedidoService,
               private modalService: BsModalService,
               private appRef: ApplicationRef) {
                this.buildForm();

  }

  private buildForm() {
    this.forma = new FormGroup({
      'cliente': new FormControl('', Validators.required),
      'observaciones': new FormControl(''),
      'senia': new FormControl(0 ,
                          [ Validators.required,
                            Validators.pattern('^[0-9]*$')
                            ]),
    });

  }

  get seniaExceedsTotal(): boolean {
    const senia = Number(this.forma.controls.senia.value);
    return senia > 0 && this.pedido && senia > this.pedido.total;
  }

  generarNuevoPedido(){
    this.pedidosService.generarNuevoPedido();
  }

  onReiniciar(){
    this.forma.reset();
    this.pedidosService.generarNuevoPedido();
  }

  onSubmit(){
    Swal.fire({
      title: 'Confirmar',
      text: 'Esta seguro que desea finalizar el pedido? No podra modificarlo despues.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.guardarPedido();
      }
    });
  }

  private guardarPedido() {
    this.pedidosService.asignarDatos(this.clienteSeleccionado, this.forma.controls.senia.value, this.forma.controls.observaciones.value);
    Swal.fire({
      title: 'Espere',
      text: 'Generando el pedido',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.pedidosService.grabarPedido().subscribe(
        resp => {
                  Swal.fire({
                  title: 'Pedido',
                  text: `Pedido ingresado!`,
                  icon: 'success'
        });
        this.pedido.id = resp['id'];
        console.log(this.pedido.id);
        this.pedidosService.finalizarPedido();
      },
        err => {      Swal.fire({
                      title: 'Pedido',
                      text: 'Error al ingresar el pedido, ud está en el horno',
                      icon: 'error'
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
      this.closeModal();
      setTimeout(() => {
        this.printService.imprimirPedido(this.pedido.id);
      }, 300);
  }

  toggleNuevoCliente() {
    this.showNuevoCliente = !this.showNuevoCliente;
    if (this.showNuevoCliente) {
      this.nuevoCliente = new ClienteModel();
    }
  }

  guardarNuevoCliente() {
    Swal.fire({
      title: 'Espere',
      text: 'Guardando cliente...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.clientesService.insertCliente(this.nuevoCliente).subscribe(
      (resp: any) => {
        Swal.close();
        const saved: any = resp;
        saved.label = `${saved.nombre} - ${saved.telefonoMovil}`;
        this.clientes.push(saved);
        this.clienteSeleccionado = saved;
        this.forma.controls.cliente.setValue(saved);
        this.showNuevoCliente = false;
      },
      err => {
        Swal.fire({
          title: 'Cliente',
          text: 'Error al guardar el cliente',
          icon: 'error'
        });
      }
    );
  }

  openItemModal(template: TemplateRef<any>) {
    this.itemModalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  closeItemModal() {
    if (this.itemModalRef) {
      this.itemModalRef.hide();
    }
  }

  onItemAdded() {
    // Keep modal open for adding more items — user closes when done
  }

  openDetalleModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      this.clientes = [...this.clientes];
      this.appRef.tick();
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

}
