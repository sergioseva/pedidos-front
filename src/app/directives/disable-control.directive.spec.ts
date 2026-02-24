import { DisableControlDirective } from './disable-control.directive';
import { FormControl, NgControl } from '@angular/forms';

describe('DisableControlDirective', () => {
  it('should create an instance', () => {
    const mockNgControl = { control: new FormControl() } as unknown as NgControl;
    const directive = new DisableControlDirective(mockNgControl);
    expect(directive).toBeTruthy();
  });

  it('should disable control when condition is true', () => {
    const control = new FormControl();
    const mockNgControl = { control } as unknown as NgControl;
    const directive = new DisableControlDirective(mockNgControl);

    directive.disableControl = true;

    expect(control.disabled).toBe(true);
  });

  it('should enable control when condition is false', () => {
    const control = new FormControl();
    control.disable();
    const mockNgControl = { control } as unknown as NgControl;
    const directive = new DisableControlDirective(mockNgControl);

    directive.disableControl = false;

    expect(control.enabled).toBe(true);
  });
});
