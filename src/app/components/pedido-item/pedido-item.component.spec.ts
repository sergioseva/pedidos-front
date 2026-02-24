import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PedidoItemComponent } from './pedido-item.component';
import { PedidosService } from '../../providers/pedidos.service';

describe('PedidoItemComponent', () => {
  let component: PedidoItemComponent;
  let fixture: ComponentFixture<PedidoItemComponent>;
  let pedidosService: any;

  beforeEach(waitForAsync(() => {
    pedidosService = {
      addPedidoItem: jasmine.createSpy('addPedidoItem')
    };

    TestBed.configureTestingModule({
      declarations: [PedidoItemComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidosService, useValue: pedidosService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with required fields', () => {
    expect(component.forma.controls.libro).toBeTruthy();
    expect(component.forma.controls.precio).toBeTruthy();
    expect(component.forma.controls.cantidad).toBeTruthy();
  });

  it('should require libro', () => {
    component.forma.controls.libro.setValue('');
    expect(component.forma.controls.libro.valid).toBe(false);
  });

  it('should require numeric precio', () => {
    component.forma.controls.precio.setValue('abc');
    expect(component.forma.controls.precio.valid).toBe(false);

    component.forma.controls.precio.setValue('100');
    expect(component.forma.controls.precio.valid).toBe(true);
  });

  describe('onAdd', () => {
    it('should add item via service and reset form', () => {
      component.forma.patchValue({
        libro: 'Test Book',
        autor: 'Author',
        editorial: 'Ed',
        precio: '100',
        cantidad: '2'
      });

      spyOn(component.itemAdded, 'emit');
      component.onAdd();

      expect(pedidosService.addPedidoItem).toHaveBeenCalled();
      expect(component.itemAdded.emit).toHaveBeenCalled();
    });
  });

  describe('onClear', () => {
    it('should reset the form', () => {
      component.forma.patchValue({ libro: 'Test' });
      component.onClear();
      expect(component.forma.controls.libro.value).toBeFalsy();
    });
  });
});
