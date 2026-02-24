import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RemitoItemComponent } from './remito-item.component';
import { RemitosService } from '../../providers/remitos.service';

describe('RemitoItemComponent', () => {
  let component: RemitoItemComponent;
  let fixture: ComponentFixture<RemitoItemComponent>;
  let remitosService: any;

  beforeEach(waitForAsync(() => {
    remitosService = {
      addRemitoItem: jasmine.createSpy('addRemitoItem')
    };

    TestBed.configureTestingModule({
      declarations: [RemitoItemComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemitoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with required ri_nombre_libro', () => {
    component.forma.controls.ri_nombre_libro.setValue('');
    expect(component.forma.controls.ri_nombre_libro.valid).toBe(false);
  });

  it('should default ri_cantidad to 1', () => {
    expect(component.forma.controls.ri_cantidad.value).toBe(1);
  });

  describe('onAdd', () => {
    it('should add item via service and reset form', () => {
      component.forma.patchValue({
        ri_nombre_libro: 'Book',
        ri_precio: '100',
        ri_cantidad: '2'
      });

      spyOn(component.itemAdded, 'emit');
      component.onAdd();

      expect(remitosService.addRemitoItem).toHaveBeenCalled();
      expect(component.itemAdded.emit).toHaveBeenCalled();
    });
  });

  describe('onClear', () => {
    it('should reset the form with default cantidad', () => {
      component.forma.patchValue({ ri_nombre_libro: 'Test' });
      component.onClear();
      expect(component.forma.controls.ri_nombre_libro.value).toBeFalsy();
      expect(component.forma.controls.ri_cantidad.value).toBe(1);
    });
  });
});
