import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminGuard, provideRouter([])],
    }).compileComponents();
  });

  it('should be created', () => {
    const guard = TestBed.inject(AdminGuard);
    expect(guard).to.exist;
  });
});
