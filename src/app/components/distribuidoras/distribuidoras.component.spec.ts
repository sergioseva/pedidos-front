import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DistribuidorasComponent } from './distribuidoras.component';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { of } from 'rxjs';

describe('DistribuidorasComponent', () => {
  let component: DistribuidorasComponent;
  let fixture: ComponentFixture<DistribuidorasComponent>;
  let distribuidoraService: any;

  beforeEach(waitForAsync(() => {
    distribuidoraService = {
      getDistribuidoras: jasmine.createSpy('getDistribuidoras').and.returnValue(of([
        { id: 1, descripcion: 'Dist A' },
        { id: 2, descripcion: 'Dist B' }
      ])),
      buscarDistribuidoras: jasmine.createSpy('buscarDistribuidoras').and.returnValue(of([])),
      deleteDistribuidora: jasmine.createSpy('deleteDistribuidora').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      declarations: [DistribuidorasComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DistribuidoraService, useValue: distribuidoraService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistribuidorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load distribuidoras on init', () => {
    expect(component.distribuidoras.length).toBe(2);
  });

  describe('buscarDistribuidora', () => {
    it('should search by term', () => {
      component.buscarDistribuidora('test');
      expect(distribuidoraService.buscarDistribuidoras).toHaveBeenCalledWith('test');
    });

    it('should reload all when term is empty', () => {
      distribuidoraService.getDistribuidoras.calls.reset();
      component.buscarDistribuidora('');
      expect(distribuidoraService.getDistribuidoras).toHaveBeenCalled();
    });
  });
});
