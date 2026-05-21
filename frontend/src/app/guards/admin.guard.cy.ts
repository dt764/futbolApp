import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should be created', () => {
    const guard = TestBed.inject(AdminGuard);
    expect(guard).toBeTruthy();
  });
});
