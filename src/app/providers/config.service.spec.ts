import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow setting and reading baseUrl', () => {
    service.baseUrl = 'http://test-api';
    expect(service.baseUrl).toBe('http://test-api');
  });

  it('should allow setting and reading nombre', () => {
    service.nombre = 'Test Store';
    expect(service.nombre).toBe('Test Store');
  });

  it('should allow setting and reading direccion', () => {
    service.direccion = 'Test Address';
    expect(service.direccion).toBe('Test Address');
  });

  it('should allow setting and reading telefono', () => {
    service.telefono = '123456';
    expect(service.telefono).toBe('123456');
  });
});
