import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RemitoItemModel } from '../../models/remito-item.model';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { RemitosService } from '../../providers/remitos.service';

@Component({
  selector: 'app-remito-item',
  templateUrl: './remito-item.component.html',
  styleUrls: ['./remito-item.component.css']
})
export class RemitoItemComponent implements OnInit {

  @Output() itemAdded = new EventEmitter<void>();
  forma: FormGroup;
  remitoItem: RemitoItemModel;

  constructor(private remitosService: RemitosService) {
    this.remitoItem = new RemitoItemModel();
    this.buildForm();
  }

  ngOnInit() {
  }

  private buildForm() {
    this.forma = new FormGroup({
      'ri_nombre_libro': new FormControl(this.remitoItem.ri_nombre_libro, Validators.required),
      'ri_autor': new FormControl(this.remitoItem.ri_autor),
      'ri_editorial': new FormControl(this.remitoItem.ri_editorial),
      'ri_isbn': new FormControl(this.remitoItem.ri_isbn),
      'ri_precio': new FormControl(this.remitoItem.ri_precio,
            Validators.pattern('^[0-9]*\\.?[0-9]*$')
      ),
      'ri_cantidad': new FormControl(1,
        Validators.pattern('^[0-9]*$')
      ),
      'ri_factura': new FormControl(this.remitoItem.ri_factura),
      'ri_motivo': new FormControl(this.remitoItem.ri_motivo),
    });
  }

  onAdd() {
    this.remitoItem = this.forma.value;
    this.remitosService.addRemitoItem(this.remitoItem);
    this.forma.reset({ ri_cantidad: 1 });
    this.itemAdded.emit();
  }

  onClear() {
    this.forma.reset({ ri_cantidad: 1 });
  }
}
