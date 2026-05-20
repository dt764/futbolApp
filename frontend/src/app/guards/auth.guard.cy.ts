import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  it('allows access when user is logged in', () => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: true } },
      ],
    });

    const guard = TestBed.inject(AuthGuard);
    expect(guard.canActivate()).to.equal(true);
  });

  it('redirects to /login when user is not logged in', () => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: false } },
      ],
    });

    const guard = TestBed.inject(AuthGuard);
    const result = guard.canActivate();
    expect(result).to.not.equal(true);
  });
});
