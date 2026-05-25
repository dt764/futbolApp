import { TestBed } from '@angular/core/testing';
import { PlayerEditPage } from './player-edit.page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('PlayerEditPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PlayerEditPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerEditPage);
    expect(fixture.componentInstance).to.exist;
    fixture.destroy();
  });
});
