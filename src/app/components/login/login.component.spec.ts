import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { mockAuthService, mockRouter, mockActivatedRoute, mockConfiguracionService } from '../../testing/test-helpers';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: any;
  let configuracionService: any;

  beforeEach(waitForAsync(() => {
    authService = mockAuthService();
    router = mockRouter();
    configuracionService = mockConfiguracionService();

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute({}, { return: '/pedidos' }) },
        { provide: ConfiguracionService, useValue: configuracionService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read return URL from query params', () => {
    expect(component.return).toBe('/pedidos');
  });

  it('should populate email from localStorage when remember me was set', () => {
    localStorage.setItem('email', 'saved@test.com');
    component.ngOnInit();
    expect(component.usuario.email).toBe('saved@test.com');
    expect(component.recordarme).toBe(true);
  });

  describe('login', () => {
    it('should call auth.login and navigate on success', () => {
      authService.login.and.returnValue(of({ accessToken: 'token' }));

      const form = { invalid: false } as any;
      component.usuario.username = 'test';
      component.usuario.password = 'pass';
      component.login(form);

      expect(authService.login).toHaveBeenCalledWith(component.usuario);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/pedidos');
    });

    it('should not call login when form is invalid', () => {
      const form = { invalid: true } as any;
      component.login(form);

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should save email to localStorage when recordarme is true', () => {
      authService.login.and.returnValue(of({ accessToken: 'token' }));
      component.recordarme = true;
      component.usuario.email = 'remember@test.com';

      const form = { invalid: false } as any;
      component.login(form);

      expect(localStorage.getItem('email')).toBe('remember@test.com');
    });
  });
});
