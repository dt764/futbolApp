import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  it('allows access when user is logged in', async () => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: true, ready: Promise.resolve() } },
      ],
    });

    const guard = TestBed.inject(AuthGuard);
    expect(await guard.canActivate()).to.equal(true);
  });

  it('redirects to /login when user is not logged in', async () => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: false, ready: Promise.resolve() } },
      ],
    });

    const guard = TestBed.inject(AuthGuard);
    const result = await guard.canActivate();
    expect(result).to.not.equal(true);
  });
});
