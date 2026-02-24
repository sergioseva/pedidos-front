import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BatchStatisticsService } from './batch-statistics.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';
import { mockCustomHttpClient, mockAuthService, mockConfigService } from '../testing/test-helpers';
import { of } from 'rxjs';

describe('BatchStatisticsService', () => {
  let service: BatchStatisticsService;
  let chttp: any;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    chttp = mockCustomHttpClient();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BatchStatisticsService,
        { provide: CustomHttpClientService, useValue: chttp },
        { provide: AuthService, useValue: mockAuthService() },
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.get(BatchStatisticsService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBatchStatistics', () => {
    it('should call correct URL with pagination', () => {
      chttp.get.and.returnValue(of({ content: [], totalElements: 0 }));

      service.getBatchStatistics(0, 10);

      expect(chttp.get).toHaveBeenCalledWith('http://test-api/batchstatistics?page=0&size=10&sort=id,desc');
    });
  });

  describe('importCatalogo', () => {
    it('should POST file via raw HttpClient', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });

      service.importCatalogo(file).subscribe();

      const req = httpMock.expectOne('http://test-api/catalogos/import');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({});
    });
  });
});
