import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ConfiguracionService } from '../../../providers/configuracion.service';
import { mockAuthService, mockRouter, mockConfiguracionService } from '../../../testing/test-helpers';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: any;
  let router: any;

  beforeEach(async(() => {
    authService = mockAuthService();
    router = mockRouter();

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ConfiguracionService, useValue: mockConfiguracionService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to isLoggedIn$', () => {
    expect(component.isLoggedIn$).toBeTruthy();
  });

  it('should subscribe to isAdmin$', () => {
    expect(component.isAdmin$).toBeTruthy();
  });

  it('should subscribe to userName$', () => {
    expect(component.userName$).toBeTruthy();
  });

  describe('logout', () => {
    it('should call auth.logout and navigate to /login', () => {
      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });
});
