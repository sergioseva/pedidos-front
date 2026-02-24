import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DistribuidoraComponent } from './distribuidora.component';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { Router, ActivatedRoute } from '@angular/router';
import { mockRouter, mockActivatedRoute } from '../../testing/test-helpers';
import { of } from 'rxjs';

describe('DistribuidoraComponent', () => {
  let component: DistribuidoraComponent;
  let fixture: ComponentFixture<DistribuidoraComponent>;
  let distribuidoraService: any;
  let router: any;

  function createComponent(routeParams: any = { id: 'nuevo' }) {
    distribuidoraService = {
      getDistribuidora: jasmine.createSpy('getDistribuidora').and.returnValue(of({
        descripcion: 'Existing', nroCuenta: '123'
      })),
      insertDistribuidora: jasmine.createSpy('insertDistribuidora').and.returnValue(of({})),
      updateDistribuidora: jasmine.createSpy('updateDistribuidora').and.returnValue(of({}))
    };
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [DistribuidoraComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DistribuidoraService, useValue: distribuidoraService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(routeParams) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DistribuidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    if (fixture) { fixture.destroy(); }
    TestBed.resetTestingModule();
  });

  describe('new mode', () => {
    beforeEach(async(() => {
      createComponent({ id: 'nuevo' });
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.headerText).toBe('Nueva Distribuidora');
    });

    it('should require descripcion', () => {
      component.forma.controls.descripcion.setValue('');
      expect(component.forma.controls.descripcion.valid).toBe(false);
    });

    it('should call insertDistribuidora on submit', () => {
      component.forma.patchValue({ descripcion: 'New Dist' });
      component.onSubmit();
      expect(distribuidoraService.insertDistribuidora).toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    beforeEach(async(() => {
      createComponent({ id: '1' });
    }));

    it('should load existing data', () => {
      expect(distribuidoraService.getDistribuidora).toHaveBeenCalledWith('1');
    });

    it('should call updateDistribuidora on submit', () => {
      component.forma.patchValue({ descripcion: 'Updated' });
      component.onSubmit();
      expect(distribuidoraService.updateDistribuidora).toHaveBeenCalledWith('1', jasmine.any(Object));
    });
  });
});
