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

  it('should have empty comment form initially', () => {
    const fixture = TestBed.createComponent(PlayerDetailPage);
    const page = fixture.componentInstance;
    expect(page.commentForm.author).to.equal('');
    expect(page.commentForm.text).to.equal('');
    expect(page.commentForm.rating).to.equal(5);
  });
});
