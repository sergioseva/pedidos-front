import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PedidoItemModel } from '../../models/pedido.item';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { PedidosService } from '../../providers/pedidos.service';



@Component({
  selector: 'app-pedido-item',
  templateUrl: './pedido-item.component.html',
  styleUrls: ['./pedido-item.component.css']
})
export class PedidoItemComponent implements OnInit {

  @Output() itemAdded = new EventEmitter<void>();
  forma: FormGroup;
  pedidoItem: PedidoItemModel;
  constructor(private pedidosService: PedidosService) {
    this.pedidoItem = new PedidoItemModel();
    this.buildForm();
  }

  ngOnInit() {
  }

  private buildForm() {
    this.forma = new FormGroup({
      'libro': new FormControl(this.pedidoItem.libro, Validators.required),
      'autor': new FormControl(this.pedidoItem.autor),
      'editorial': new FormControl(this.pedidoItem.editorial),
      'precio': new FormControl(this.pedidoItem.precio,
            [Validators.required, Validators.pattern('^[0-9]*$')]
      ),
      'cantidad': new FormControl(this.pedidoItem.cantidad,
        [Validators.required,
          Validators.pattern('^[0-9]*$')
        ]
        ),
    });

    console.log(this.forma);
  }

  onAdd(){
    this.pedidoItem = this.forma.value;
    this.pedidosService.addPedidoItem(this.pedidoItem);
    this.forma.reset();
    this.itemAdded.emit();
  }
  onClear() {
    this.forma.reset();
  }
}
