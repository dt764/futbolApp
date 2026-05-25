import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlayerDetailPage } from './player-detail.page';

describe('PlayerDetailPage', () => {
  let routeMock: { snapshot: { paramMap: { get: () => string } } };

  beforeEach(() => {
    routeMock = { snapshot: { paramMap: { get: () => 'fake-id' } } };
    TestBed.configureTestingModule({
      imports: [PlayerDetailPage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayerDetailPage);
    expect(fixture.componentInstance).to.exist;
    fixture.destroy();
  });

  it('should have playerId from route', () => {
    const fixture = TestBed.createComponent(PlayerDetailPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.playerId).to.equal('fake-id');
    fixture.destroy();
  });
});
