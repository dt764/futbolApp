import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { PlayersPage } from './players.page';

describe('PlayersPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlayersPage, IonicModule.forRoot(), HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayersPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have empty filters initially', () => {
    const fixture = TestBed.createComponent(PlayersPage);
    const page = fixture.componentInstance;
    expect(page.filters.name).to.equal('');
    expect(page.filters.team).to.equal('');
    expect(page.filters.league).to.equal('');
  });
});
