import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '../providers/config.service';
import { mockConfigService } from '../testing/test-helpers';

function createTestJwt(payload: any, expiredOffset?: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  if (expiredOffset !== undefined) {
    payload.exp = Math.floor(Date.now() / 1000) + expiredOffset;
  }
  const body = btoa(JSON.stringify(payload));
  const signature = 'test-signature';
  return `${header}.${body}.${signature}`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService() }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('leerToken', () => {
    it('should return empty string when no token in localStorage', () => {
      expect(service.leerToken()).toBe('');
    });

    it('should return stored token', () => {
      localStorage.setItem('token', 'stored-token');

      const result = service.leerToken();

      expect(result).toBe('stored-token');
    });
  });

  describe('estaAutenticado', () => {
    it('should return false for empty token', () => {
      service.userToken = '';

      expect(service.estaAutenticado()).toBe(false);
    });

    it('should return false for short token (length < 2)', () => {
      service.userToken = 'x';

      expect(service.estaAutenticado()).toBe(false);
    });

    it('should return true for non-expired JWT', () => {
      const token = createTestJwt({ sub: 'user', name: 'Test' }, 3600);
      service.userToken = token;

      expect(service.estaAutenticado()).toBe(true);
    });

    it('should return false for expired JWT', () => {
      const token = createTestJwt({ sub: 'user', name: 'Test' }, -3600);
      service.userToken = token;

      expect(service.estaAutenticado()).toBe(false);
    });

    it('should update loggedIn BehaviorSubject', () => {
      let loggedInValue: boolean;
      service.isLoggedIn.subscribe(v => loggedInValue = v);

      const token = createTestJwt({ sub: 'user' }, 3600);
      service.userToken = token;
      service.estaAutenticado();

      expect(loggedInValue).toBe(true);
    });
  });

  describe('login', () => {
    it('should POST to /auth/login', () => {
      const usuario = { username: 'testuser', password: 'pass123' } as any;
      const token = createTestJwt({ sub: 'testuser', name: 'Test', roles: [] }, 3600);

      service.login(usuario).subscribe();

      const req = httpMock.expectOne('http://test-api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ usernameOrEmail: 'testuser', password: 'pass123' });
      req.flush({ accessToken: token });
    });

    it('should store token and set loggedIn to true', () => {
      let loggedInValue: boolean;
      service.isLoggedIn.subscribe(v => loggedInValue = v);

      const usuario = { username: 'testuser', password: 'pass123' } as any;
      const token = createTestJwt({ sub: 'testuser', name: 'Test', roles: [] }, 3600);

      service.login(usuario).subscribe();
      httpMock.expectOne('http://test-api/auth/login').flush({ accessToken: token });

      expect(localStorage.getItem('token')).toBe(token);
      expect(loggedInValue).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear localStorage keys and reset subjects', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('userRole', 'ROLE_ADMIN');
      localStorage.setItem('userName', 'Test');

      let loggedInValue: boolean;
      let adminValue: boolean;
      let nameValue: string;
      service.isLoggedIn.subscribe(v => loggedInValue = v);
      service.isAdmin$.subscribe(v => adminValue = v);
      service.userName$.subscribe(v => nameValue = v);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
      expect(localStorage.getItem('userName')).toBeNull();
      expect(loggedInValue).toBe(false);
      expect(adminValue).toBe(false);
      expect(nameValue).toBe('');
    });
  });

  describe('isAdmin', () => {
    it('should return true when userRole is ROLE_ADMIN', () => {
      localStorage.setItem('userRole', 'ROLE_ADMIN');

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when userRole is ROLE_USER', () => {
      localStorage.setItem('userRole', 'ROLE_USER');

      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when no userRole', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('extractUserFromToken', () => {
    it('should decode JWT and store name and role in localStorage', () => {
      const token = createTestJwt({ sub: 'testuser', name: 'Test User', roles: ['ROLE_ADMIN'] }, 3600);
      service.userToken = token;

      service.extractUserFromToken();

      expect(localStorage.getItem('userName')).toBe('Test User');
      expect(localStorage.getItem('userRole')).toBe('ROLE_ADMIN');
    });

    it('should update BehaviorSubjects', () => {
      let nameValue: string;
      let adminValue: boolean;
      service.userName$.subscribe(v => nameValue = v);
      service.isAdmin$.subscribe(v => adminValue = v);

      const token = createTestJwt({ sub: 'testuser', name: 'Admin', roles: ['ROLE_ADMIN'] }, 3600);
      service.userToken = token;
      service.extractUserFromToken();

      expect(nameValue).toBe('Admin');
      expect(adminValue).toBe(true);
    });

    it('should use sub as name when name is not in token', () => {
      const token = createTestJwt({ sub: 'testuser', roles: [] }, 3600);
      service.userToken = token;

      service.extractUserFromToken();

      expect(localStorage.getItem('userName')).toBe('testuser');
    });

    it('should set ROLE_USER when roles do not include ROLE_ADMIN', () => {
      const token = createTestJwt({ sub: 'user', name: 'User', roles: ['ROLE_USER'] }, 3600);
      service.userToken = token;

      service.extractUserFromToken();

      expect(localStorage.getItem('userRole')).toBe('ROLE_USER');
    });
  });

  describe('getTokenExpirationDate', () => {
    it('should extract exp claim as Date', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createTestJwt({ exp: futureTime });

      const date = service.getTokenExpirationDate(token);

      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).toBe(futureTime * 1000);
    });

    it('should return null when exp is missing', () => {
      const token = createTestJwt({ sub: 'user' });

      const date = service.getTokenExpirationDate(token);

      expect(date).toBeNull();
    });
  });
});
