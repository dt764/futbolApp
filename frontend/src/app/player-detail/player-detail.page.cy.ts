import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlayerDetailPage } from './player-detail.page';

describe('PlayerDetailPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlayerDetailPage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'fake-id' } } },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerDetailPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have playerId from route', () => {
    const fixture = TestBed.createComponent(PlayerDetailPage);
    const page = fixture.componentInstance;
    expect(page.playerId).to.equal('fake-id');
  });
});
