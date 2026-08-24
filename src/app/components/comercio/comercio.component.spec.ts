import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComercioComponent } from './comercio.component';
import { ComercioService } from '../../providers/comercio.service';
import { Router, ActivatedRoute } from '@angular/router';
import { mockRouter, mockActivatedRoute } from '../../testing/test-helpers';
import { of, Subject, throwError } from 'rxjs';

describe('ComercioComponent', () => {
  let component: ComercioComponent;
  let fixture: ComponentFixture<ComercioComponent>;
  let comercioService: any;
  let router: any;

  function createComponent(routeParams: any = { id: 'nuevo' }) {
    // El beforeEach ya armo uno: reconfigurar sin resetear rompe.
    TestBed.resetTestingModule();
    comercioService = {
      getComercio: jasmine.createSpy('getComercio').and.returnValue(of({
        descripcion: 'Hotel Costa Azul', comision: 20
      })),
      insertComercio: jasmine.createSpy('insertComercio').and.returnValue(of({})),
      updateComercio: jasmine.createSpy('updateComercio').and.returnValue(of({}))
    };
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [ComercioComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ComercioService, useValue: comercioService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(routeParams) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    createComponent();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should post a new comercio', () => {
    component.forma.patchValue({ descripcion: 'Kiosco', comision: 15 });

    component.onSubmit();

    expect(comercioService.insertComercio).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/comercios']);
  });

  it('should put when editing', () => {
    createComponent({ id: '3' });

    component.onSubmit();

    expect(comercioService.updateComercio).toHaveBeenCalled();
    expect(comercioService.insertComercio).not.toHaveBeenCalled();
  });

  describe('doble envio', () => {
    /**
     * Lo que se reporto desde produccion: dos clics en Guardar creaban dos negocios. La respuesta
     * se demora, asi que el segundo clic entra antes de que vuelva la primera: por eso en local,
     * donde vuelve al instante, no se reproducia.
     */
    it('should not post twice while the first request is still in flight', () => {
      const enVuelo = new Subject<any>();
      comercioService.insertComercio.and.returnValue(enVuelo.asObservable());
      component.forma.patchValue({ descripcion: 'Kiosco' });

      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      expect(comercioService.insertComercio).toHaveBeenCalledTimes(1);
    });

    it('should mark itself as saving so the button can disable', () => {
      comercioService.insertComercio.and.returnValue(new Subject<any>().asObservable());

      component.onSubmit();

      expect(component.guardando).toBe(true);
    });

    it('should release the guard once the request completes', () => {
      const enVuelo = new Subject<any>();
      comercioService.insertComercio.and.returnValue(enVuelo.asObservable());

      component.onSubmit();
      enVuelo.next({});

      expect(component.guardando).toBe(false);
    });

    /** Si el guardado falla hay que poder reintentar, no quedar trabado. */
    it('should release the guard when the request fails', () => {
      comercioService.insertComercio.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();

      expect(component.guardando).toBe(false);
      expect(component.forma).toBeTruthy();
    });

    it('should allow saving again after a failure', () => {
      comercioService.insertComercio.and.returnValue(throwError(() => ({ status: 500 })));
      component.onSubmit();

      comercioService.insertComercio.and.returnValue(of({}));
      component.onSubmit();

      expect(comercioService.insertComercio).toHaveBeenCalledTimes(2);
    });
  });
});
