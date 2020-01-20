import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-libro-botones-render',
  templateUrl: './libro-botones-render.component.html',
  styleUrls: ['./libro-botones-render.component.css']
})
export class LibroBotonesRenderComponent implements ViewCell, OnInit {

  renderValue: any;
  @Input() value: string | number;
  @Input() rowData: any;

  @Output() click: EventEmitter<any> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.renderValue =  this.sanitizer.bypassSecurityTrustHtml(`<div class="col"> <div class="row">
    <button title="Modificar ${this.rowData.descripcion}" (click)="onClick(event)" type="button " class="btn btn-outline-info ">
                    <i class="fa fa-pencil "></i>
        </button>
      </div>
    </div> </span>`);
    this.renderValue =  this.sanitizer.bypassSecurityTrustHtml(`<button (click)="example()">Click me</button>`);
  }


  onClick(row: any) {
    this.click.emit(this.rowData);
  }


}
