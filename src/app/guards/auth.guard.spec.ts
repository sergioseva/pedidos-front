import { AuthGuard } from './auth.guard';
import { mockAuthService, mockRouter } from '../testing/test-helpers';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: any;
  let router: any;

  beforeEach(() => {
    authService = mockAuthService();
    router = mockRouter();
    guard = new AuthGuard(authService, router);
  });

  it('should return true when authenticated', () => {
    authService.estaAutenticado.and.returnValue(true);

    const result = guard.canActivate(null, { url: '/pedidos' } as any);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate to /login when not authenticated', () => {
    authService.estaAutenticado.and.returnValue(false);

    const result = guard.canActivate(null, { url: '/pedidos' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { return: '/pedidos' }
    });
  });

  it('should pass the current URL as return param', () => {
    authService.estaAutenticado.and.returnValue(false);

    guard.canActivate(null, { url: '/clientes' } as any);

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { return: '/clientes' }
    });
  });
});
