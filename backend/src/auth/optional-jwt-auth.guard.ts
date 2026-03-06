import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = super.canActivate(context);
      if (result instanceof Observable) {
        const value = await firstValueFrom(result.pipe(catchError(() => of(true))));
        return value === true;
      }
      return (await result) === true;
    } catch {
      return true;
    }
  }

  handleRequest<TUser>(err: any, user: TUser): TUser {
    if (err || !user) {
      return undefined as TUser;
    }
    return user;
  }
}
