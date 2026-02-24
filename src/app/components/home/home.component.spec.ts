import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home.component';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { mockConfiguracionService } from '../../testing/test-helpers';
import { of } from 'rxjs';
import { ConfiguracionModel } from '../../models/configuracion.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let configuracionService: any;

  beforeEach(waitForAsync(() => {
    configuracionService = mockConfiguracionService();

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConfiguracionService, useValue: configuracionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default nombre to Libros Mario', () => {
    expect(component.nombre).toBe('Libros Mario');
  });

  it('should update nombre from configuracion', () => {
    const config = new ConfiguracionModel();
    config.nombre = 'Custom Store';
    configuracionService.getConfiguracion.and.returnValue(of(config));

    component.ngOnInit();

    expect(component.nombre).toBe('Custom Store');
  });
});
