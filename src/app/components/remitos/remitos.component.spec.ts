import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RemitosComponent } from './remitos.component';
import { RemitosService } from '../../providers/remitos.service';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { of, throwError } from 'rxjs';

describe('RemitosComponent', () => {
  let component: RemitosComponent;
  let fixture: ComponentFixture<RemitosComponent>;
  let remitosService: any;
  let printService: any;

  beforeEach(waitForAsync(() => {
    remitosService = {
      buscarRemitos: jasmine.createSpy('buscarRemitos').and.returnValue(of([]))
    };
    printService = {
      imprimirRemito: jasmine.createSpy('imprimirRemito'),
      isPrinting: false
    };

    TestBed.configureTestingModule({
      declarations: [RemitosComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: PrintRemitoService, useValue: printService },
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search on init', () => {
    expect(remitosService.buscarRemitos).toHaveBeenCalled();
  });

  describe('buscarTermino', () => {
    it('should set results and update state', () => {
      const mockRemitos = [{ re_remito_k: 1 }];
      remitosService.buscarRemitos.and.returnValue(of(mockRemitos));

      component.buscarTermino('test');

      expect(component.remitos).toEqual(mockRemitos as any);
      expect(component.loading).toBe(false);
    });

    it('should handle error', () => {
      remitosService.buscarRemitos.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));

      component.buscarTermino('test');

      expect(component.error).toBe(true);
    });
  });

  describe('imprimir', () => {
    it('should call printService', () => {
      component.imprimir({ re_remito_k: 5 } as any);
      expect(printService.imprimirRemito).toHaveBeenCalledWith(5);
    });
  });
});
