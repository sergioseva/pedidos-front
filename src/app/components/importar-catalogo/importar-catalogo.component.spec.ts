import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ImportarCatalogoComponent } from './importar-catalogo.component';
import { BatchStatisticsService } from '../../providers/batch-statistics.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ImportarCatalogoComponent', () => {
  let component: ImportarCatalogoComponent;
  let fixture: ComponentFixture<ImportarCatalogoComponent>;
  let batchService: any;

  beforeEach(waitForAsync(() => {
    batchService = {
      getBatchStatistics: jasmine.createSpy('getBatchStatistics').and.returnValue(of({
        content: [{ id: 1, proceso: 'import' }],
        totalElements: 1
      })),
      importCatalogo: jasmine.createSpy('importCatalogo').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      declarations: [ImportarCatalogoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BatchStatisticsService, useValue: batchService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportarCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load statistics on init', () => {
    expect(component.statistics.length).toBe(1);
    expect(component.totalItems).toBe(1);
  });

  describe('importar', () => {
    it('should not call service when no file selected', () => {
      component.selectedFile = null;
      component.importar();
      expect(batchService.importCatalogo).not.toHaveBeenCalled();
    });

    it('should call service with selected file', () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({} as any));
      spyOn(Swal, 'showLoading');
      const file = new File([''], 'test.csv');
      component.selectedFile = file;
      component.importar();
      expect(batchService.importCatalogo).toHaveBeenCalledWith(file);
    });
  });

  describe('calcularDuracion', () => {
    it('should calculate duration in seconds', () => {
      const result = component.calcularDuracion('2024-01-01T00:00:00', '2024-01-01T00:00:30');
      expect(result).toBe('30s');
    });

    it('should calculate duration in minutes and seconds', () => {
      const result = component.calcularDuracion('2024-01-01T00:00:00', '2024-01-01T00:02:30');
      expect(result).toBe('2m 30s');
    });
  });

  describe('loadPage', () => {
    it('should call service with correct page', () => {
      batchService.getBatchStatistics.calls.reset();
      component.loadPage(2);
      expect(batchService.getBatchStatistics).toHaveBeenCalledWith(1, 10);
      expect(component.currentPage).toBe(2);
    });
  });
});
