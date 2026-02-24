import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RemitoImpresoComponent } from './remito-impreso.component';
import { RemitosService } from '../../../providers/remitos.service';
import { PrintRemitoService } from '../../../providers/print-remito.service';
import { ConfiguracionRemitoService } from '../../../providers/configuracion-remito.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RemitoModel } from '../../../models/remito.model';

describe('RemitoImpresoComponent', () => {
  let component: RemitoImpresoComponent;
  let fixture: ComponentFixture<RemitoImpresoComponent>;
  let printService: any;

  beforeEach(async(() => {
    const mockRemito = new RemitoModel();
    mockRemito.re_remito_k = 1;

    printService = {
      onDataReady: jasmine.createSpy('onDataReady'),
      isPrinting: true
    };

    TestBed.configureTestingModule({
      declarations: [RemitoImpresoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { remitoId: 1 } } } },
        { provide: RemitosService, useValue: { getRemito: jasmine.createSpy().and.returnValue(of(mockRemito)) } },
        { provide: PrintRemitoService, useValue: printService },
        { provide: ConfiguracionRemitoService, useValue: {
          getConfiguracion: jasmine.createSpy().and.returnValue(of({ remitente: 'Test Sender' }))
        }}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemitoImpresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load remito data', () => {
    expect(component.remito).toBeTruthy();
    expect(component.remito.re_remito_k).toBe(1);
  });

  it('should load remitente', () => {
    expect(component.remitente).toBe('Test Sender');
  });

  it('should call onDataReady when both loads complete', () => {
    expect(printService.onDataReady).toHaveBeenCalled();
  });
});
