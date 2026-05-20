import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePage, IonicModule.forRoot()],
    }).compileComponents();
  });

  it('should create the page', () => {
    const fixture = TestBed.createComponent(HomePage);
    const page = fixture.componentInstance;
    expect(page).to.exist;
  });
});
