import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';
import { IdealTeamPage } from './ideal-team.page';

describe('IdealTeamPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IdealTeamPage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(IdealTeamPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have default source as database', () => {
    const fixture = TestBed.createComponent(IdealTeamPage);
    const page = fixture.componentInstance;
    expect(page.source).to.equal('database');
  });

  it('should have 6 formations available', () => {
    const fixture = TestBed.createComponent(IdealTeamPage);
    const page = fixture.componentInstance;
    expect(page.formations.length).to.equal(6);
  });
});
