import { Component, OnInit, TemplateRef } from '@angular/core';
import { RemitoModel } from 'src/app/models/remito.model';
import { RemitosService } from 'src/app/providers/remitos.service';
import { RemitoItemModel } from '../../models/remito-item.model';
import { DistribuidoraModel } from '../../models/distribuidora.model';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { LibrosService } from '../../providers/libros.service';
import { LibroModel } from '../../models/libro.model';
import { PedidoItemModel } from '../../models/pedido.item';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-remito',
  templateUrl: './remito.component.html',
  styleUrls: ['./remito.component.css']
})
export class RemitoComponent implements OnInit {

  forma: FormGroup;
  remito: RemitoModel;
  distribuidoras: DistribuidoraModel[];
  distribuidoraSeleccionada: DistribuidoraModel;
  libros: LibroModel[];
  cantItemsRemito = 0;
  loading = false;
  searchPerformed = false;
  modalRef: BsModalRef;
  itemModalRef: BsModalRef;

  settings = {
    noDataMessage: 'Busque un libro para agregarlo al remito',
    actions: {
      columnTitle: 'Acciones',
      custom: [
        {
          name: 'agregarRemito',
          title: '<i title="Agregar al remito" class="fa fa-plus-circle"></i> &nbsp;'
        }
      ],
      add: false,
      edit: false,
      delete: false
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
        valuePrepareFunction: (value) => '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value)
      },
      editorial: {
        title: 'Editorial'
      },
      isbn: {
        title: 'ISBN'
      }
    }
  };

  constructor(private remitosService: RemitosService,
              private distribuidoraService: DistribuidoraService,
              private librosService: LibrosService,
              public printService: PrintRemitoService,
              private modalService: BsModalService) {
    this.buildForm();
  }

  private buildForm() {
    this.forma = new FormGroup({
      'distribuidora': new FormControl(null, Validators.required),
      'observaciones': new FormControl(''),
    });
  }

  ngOnInit() {
    this.remitosService.currentRemito.subscribe(remito => {
      this.remito = remito;
      this.cantItemsRemito = remito.items.length;
    });
    this.distribuidoraService.getDistribuidoras()
      .subscribe((distribuidoras) => {
        this.distribuidoras = distribuidoras;
      });
  }

  onReiniciar() {
    this.forma.reset();
    this.remitosService.generarNuevoRemito();
  }

  onSubmit() {
    Swal.fire({
      title: 'Confirmar',
      text: 'Esta seguro que desea finalizar el remito? No podra modificarlo despues.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.guardarRemito();
      }
    });
  }

  private guardarRemito() {
    this.remitosService.asignarDatos(this.distribuidoraSeleccionada, this.forma.controls.observaciones.value);
    Swal.fire({
      title: 'Espere',
      text: 'Generando el remito',
      type: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.remitosService.grabarRemito().subscribe(
      resp => {
        Swal.fire({
          title: 'Remito',
          text: 'Remito ingresado!',
          type: 'success'
        });
        this.remito.re_remito_k = resp['re_remito_k'];
        this.remitosService.finalizarRemito();
      },
      err => {
        Swal.fire({
          title: 'Remito',
          text: 'Error al ingresar el remito',
          type: 'error'
        });
      }
    );
  }

  borrarItem(item: RemitoItemModel) {
    this.remitosService.removeRemitoItem(item);
  }

  onImprimir() {
    this.closeModal();
    setTimeout(() => {
      this.printService.imprimirRemito(this.remito.re_remito_k);
    }, 300);
  }

  onCustom(event: any) {
    if (this.remito.finalizado) {
      Swal.fire({
        title: 'Remito Finalizado',
        text: 'El remito ya fue finalizado. Pulse Reiniciar para generar uno nuevo.',
        type: 'warning'
      });
      return;
    }
    const item = new RemitoItemModel();
    item.ri_nombre_libro = event.data.descripcion;
    item.ri_autor = event.data.autor;
    item.ri_editorial = event.data.editorial;
    item.ri_precio = event.data.precio;
    item.ri_isbn = event.data.isbn;
    item.ri_cantidad = 1;
    this.remitosService.addRemitoItem(item);
    Swal.fire({
      toast: true,
      position: 'top-end',
      type: 'success',
      title: 'Libro agregado al remito',
      showConfirmButton: false,
      timer: 1500
    });
  }

  buscarLibros(termino: string) {
    this.loading = true;
    this.librosService.buscarLibros(termino).subscribe(
      (libros: any[]) => {
        this.libros = libros;
        this.loading = false;
        this.searchPerformed = true;
      },
      () => {
        this.loading = false;
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
  }

  openDetalleModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

}
