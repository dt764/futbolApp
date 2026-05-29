import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterPage, IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    expect(fixture.componentInstance).to.exist;
  });

  it('should have email and password fields', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.email).to.equal('');
    expect(page.password).to.equal('');
    expect(page.confirmPassword).to.equal('');
  });
});
