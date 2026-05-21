import { TestBed } from '@angular/core/testing';
import { PlayerCreatePage } from './player-create.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlayerCreatePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PlayerCreatePage],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerCreatePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have form fields', () => {
    const fixture = TestBed.createComponent(PlayerCreatePage);
    expect(fixture.componentInstance.form.name).toBe('');
    expect(fixture.componentInstance.form.position).toBe('');
  });
});
