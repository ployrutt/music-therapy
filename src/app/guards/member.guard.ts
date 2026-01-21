import { CanActivateFn } from '@angular/router';

export const memberGuard: CanActivateFn = (route, state) => {
  return true;
};
