import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginPage, IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have email and password fields', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.email).to.equal('');
    expect(page.password).to.equal('');
  });
});
