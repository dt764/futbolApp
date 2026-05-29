import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomePage, IonicModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the page', () => {
    const fixture = TestBed.createComponent(HomePage);
    const page = fixture.componentInstance;
    expect(page).to.exist;
    fixture.destroy();
  });
});
