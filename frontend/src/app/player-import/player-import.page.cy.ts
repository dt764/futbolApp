import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { PlayerImportPage } from './player-import.page';

describe('PlayerImportPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlayerImportPage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerImportPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have empty search fields initially', () => {
    const fixture = TestBed.createComponent(PlayerImportPage);
    const page = fixture.componentInstance;
    expect(page.search.name).to.equal('');
    expect(page.search.team).to.equal('');
    expect(page.search.league).to.equal('');
  });
});
