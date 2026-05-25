import { TestBed } from '@angular/core/testing';
import { PlayerCreatePage } from './player-create.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PlayerCreatePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PlayerCreatePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerCreatePage);
    expect(fixture.componentInstance).to.exist;
    fixture.destroy();
  });

  it('should have form fields', () => {
    const fixture = TestBed.createComponent(PlayerCreatePage);
    expect(fixture.componentInstance.form.name).to.equal('');
    expect(fixture.componentInstance.form.position).to.equal('');
    fixture.destroy();
  });
});
