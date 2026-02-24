import { AdminGuard } from './admin.guard';
import { mockAuthService, mockRouter } from '../testing/test-helpers';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: any;
  let router: any;

  beforeEach(() => {
    authService = mockAuthService();
    router = mockRouter();
    guard = new AdminGuard(authService, router);
  });

  it('should return true when authenticated and admin', () => {
    authService.estaAutenticado.and.returnValue(true);
    authService.isAdmin.and.returnValue(true);

    const result = guard.canActivate(null, { url: '/distribuidoras' } as any);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate to /home when authenticated but not admin', () => {
    authService.estaAutenticado.and.returnValue(true);
    authService.isAdmin.and.returnValue(false);

    const result = guard.canActivate(null, { url: '/distribuidoras' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should return false and navigate to /home when not authenticated', () => {
    authService.estaAutenticado.and.returnValue(false);
    authService.isAdmin.and.returnValue(false);

    const result = guard.canActivate(null, { url: '/distribuidoras' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
