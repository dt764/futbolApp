import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { PlayersPage } from './players.page';

describe('PlayersPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlayersPage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayersPage);
    expect(fixture.componentInstance).to.exist;
    fixture.destroy();
  });

  it('should have empty filters initially', () => {
    const fixture = TestBed.createComponent(PlayersPage);
    const page = fixture.componentInstance;
    const f = page.filters();
    expect(f.name).to.equal('');
    expect(f.team).to.equal('');
    expect(f.league).to.equal('');
    fixture.destroy();
  });
});
