import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { validateEmail, validatePasswordStrength, mapFirebaseError } from '../app/validators';
import { BackendFactory } from '../app/patterns/backend-factory';
import { TrwmBackendStrategy } from '../app/patterns/trwm-backend.strategy';
import { DwscBackendStrategy } from '../app/patterns/dwsc-backend.strategy';
import { BackendToggleService } from '../app/patterns/backend-toggle.service';
import { ApiService } from '../app/services/api.service';
import { tokenInterceptor } from '../app/services/token.interceptor';
import { PlayerState } from '../app/services/player.state';
import { AuthService } from '../app/services/auth.service';
import { of, throwError } from 'rxjs';
import { Player } from '../app/models/player.models';
import { environment } from '../environments/environment';

const apiUrl = environment.apiUrl;
const dwscApiUrl = environment.dwscApiUrl;
const trwmApiUrl = environment.trwmApiUrl;

// ─── Pure functions (no DI) ───────────────────────────────────────
describe('validateEmail', () => {
  it('rejects empty', () => expect(validateEmail('')).to.equal('El email es obligatorio'));
  it('accepts valid', () => expect(validateEmail('a@b.co')).to.be.null);
});
describe('validatePasswordStrength', () => {
  it('strong', () => {
    const r = validatePasswordStrength('Str0ng!x1');
    expect(r.valid).to.be.true;
  });
});
describe('mapFirebaseError', () => {
  it('known', () => expect(mapFirebaseError({ code: 'auth/invalid-email' })).to.equal('Email no válido'));
  it('unknown', () => expect(mapFirebaseError({ code: 'x' })).to.equal('Error desconocido'));
});

// ─── Strategy classes (no DI) ─────────────────────────────────────
describe('TrwmBackendStrategy', () => {
  it('works', () => {
    const s = new TrwmBackendStrategy();
    expect(s.type).to.equal('trwm');
    expect(s.getBaseUrl()).to.equal(apiUrl);
  });
});
describe('DwscBackendStrategy', () => {
  it('works', () => {
    const s = new DwscBackendStrategy();
    expect(s.type).to.equal('dwsc');
    expect(s.getBaseUrl()).to.equal(dwscApiUrl);
  });
});

// ─── BackendFactory (TestBed) ─────────────────────────────────────
describe('BackendFactory', () => {
  let factory: BackendFactory;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BackendFactory, TrwmBackendStrategy, DwscBackendStrategy] });
    factory = TestBed.inject(BackendFactory);
  });
  it('TRWM', () => expect(factory.getStrategy('trwm').getBaseUrl()).to.equal(trwmApiUrl));
  it('DWSC', () => expect(factory.getStrategy('dwsc').getBaseUrl()).to.equal(dwscApiUrl));
  it('unknown', () => expect(() => factory.getStrategy('x' as any)).to.throw());
  it('all', () => expect(factory.getAll()).to.have.length(2));
});

// ─── BackendToggleService (TestBed + localStorage) ────────────────
describe('BackendToggleService', () => {
  function make() {
    TestBed.configureTestingModule({ providers: [BackendToggleService, BackendFactory, TrwmBackendStrategy, DwscBackendStrategy] });
    return TestBed.inject(BackendToggleService);
  }
  beforeEach(() => { localStorage.clear(); });
  it('default trwm', () => expect(make().current()).to.equal('trwm'));
  it('load dwsc', () => {
    localStorage.setItem('futbolapp_backend', 'dwsc');
    expect(make().current()).to.equal('dwsc');
  });
  it('toggle', () => { const s = make(); s.toggle(); expect(s.current()).to.equal('dwsc'); });
  it('persist', () => { const s = make(); s.set('dwsc'); expect(localStorage.getItem('futbolapp_backend')).to.equal('dwsc'); });
  it('bad default', () => {
    localStorage.setItem('futbolapp_backend', 'x');
    expect(make().current()).to.equal('trwm');
  });
});

// ─── ApiService (HttpClient testing) ──────────────────────────────
describe('ApiService', () => {
  let service: ApiService;
  let httpCtrl: HttpTestingController;
  let toggle: BackendToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService, BackendToggleService, BackendFactory, TrwmBackendStrategy, DwscBackendStrategy,
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpCtrl = TestBed.inject(HttpTestingController);
    toggle = TestBed.inject(BackendToggleService);
    toggle.set('trwm');
  });
  afterEach(() => httpCtrl.verify());

  it('GET', () => {
    service.get<{ ok: boolean }>('/health').subscribe((r) => expect(r.ok).to.be.true);
    const req = httpCtrl.expectOne(`${apiUrl}/health`);
    expect(req.request.method).to.equal('GET');
    req.flush({ ok: true });
  });
  it('POST', () => {
    service.post<{ id: number }>('/players', { name: 'test' }).subscribe((r) => expect(r.id).to.equal(1));
    const req = httpCtrl.expectOne(`${apiUrl}/players`);
    expect(req.request.method).to.equal('POST');
    expect(req.request.body).to.deep.equal({ name: 'test' });
    req.flush({ id: 1 });
  });
  it('PUT', () => {
    service.put<{ ok: boolean }>('/players/1', { name: 'x' }).subscribe((r) => expect(r.ok).to.be.true);
    const req = httpCtrl.expectOne(`${apiUrl}/players/1`);
    expect(req.request.method).to.equal('PUT');
    req.flush({ ok: true });
  });
  it('DELETE', () => {
    service.delete<{ message: string }>('/players/1').subscribe((r) => expect(r.message).to.equal('ok'));
    const req = httpCtrl.expectOne(`${apiUrl}/players/1`);
    expect(req.request.method).to.equal('DELETE');
    req.flush({ message: 'ok' });
  });
  it('uses baseUrl from toggle', () => {
    toggle.set('dwsc');
    service.get('/health').subscribe();
    httpCtrl.expectOne(`${dwscApiUrl}/health`);
  });
  it('sends auth header with token', () => {
    service.get('/health', 'mytoken').subscribe();
    const req = httpCtrl.expectOne(`${apiUrl}/health`);
    expect(req.request.headers.get('Authorization')).to.equal('Bearer mytoken');
    req.flush({});
  });
});

// ─── Token Interceptor (needs mock AuthService) ───────────────────
describe('tokenInterceptor', () => {
  let httpCtrl: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: () => 'test-token', isLoggedIn: () => true } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpCtrl = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpCtrl.verify());

  it('adds Bearer token', () => {
    http.get('/api/test').subscribe();
    const req = httpCtrl.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).to.equal('Bearer test-token');
    req.flush({});
  });
  it('passes through when no token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token: () => null, isLoggedIn: () => false } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpCtrl = TestBed.inject(HttpTestingController);
    http.get('/api/test').subscribe();
    const req = httpCtrl.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).to.be.false;
    req.flush({});
  });
});

// ─── PlayerState (mocked ApiService) ──────────────────────────────
describe('PlayerState', () => {
  let state: PlayerState;
  let mockApi: any;
  const fakePlayers: Player[] = [
    { _id: '1', name: 'Leo', team: 'FCB', league: 'LaLiga', photo: '', createdBy: 'u1', createdAt: new Date().toISOString() },
    { _id: '2', name: 'Cristiano', team: 'ALU', league: 'SSL', photo: '', createdBy: 'u1', createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    mockApi = {
      get: cy.stub(),
      post: cy.stub(),
      put: cy.stub(),
      delete: cy.stub(),
    };
    TestBed.configureTestingModule({
      providers: [
        PlayerState,
        { provide: ApiService, useValue: mockApi },
      ],
    });
    state = TestBed.inject(PlayerState);
  });

  it('loadPlayers sets players', () => {
    mockApi.get.returns(of({ players: fakePlayers, page: 1, pages: 2, total: 4 }));
    state.loadPlayers();
    expect(state.loading()).to.be.false;
    expect(state.players()).to.have.length(2);
    expect(state.players()[0].name).to.equal('Leo');
    expect(state.page()).to.equal(1);
    expect(state.total()).to.equal(4);
  });

  it('loadPlayers handles error', () => {
    mockApi.get.returns(throwError(() => new Error('fail')));
    state.loadPlayers();
    expect(state.loading()).to.be.false;
    expect(state.error()).to.equal('fail');
  });

  it('loadPlayers with append=true keeps previous', () => {
    mockApi.get.returns(of({ players: fakePlayers, page: 1, pages: 2, total: 4 }));
    state.loadPlayers();
    const more: Player[] = [
      { _id: '3', name: 'Neymar', team: 'SAN', league: 'BRL', photo: '', createdBy: 'u1', createdAt: new Date().toISOString() },
    ];
    mockApi.get.returns(of({ players: more, page: 2, pages: 2, total: 4 }));
    state.loadPlayers(true);
    expect(state.players()).to.have.length(3);
  });

  it('setFilters updates filters', () => {
    state.setFilters({ name: 'Leo', team: 'FCB', league: '' });
    expect(state.filters().name).to.equal('Leo');
    expect(state.filters().team).to.equal('FCB');
  });

  it('getPlayerById calls api.get', () => {
    mockApi.get.returns(of({ player: fakePlayers[0] }));
    state.getPlayerById('1').subscribe((r: any) => expect(r.player.name).to.equal('Leo'));
    expect(mockApi.get).to.be.calledWith('/api/players/1');
  });

  it('createPlayer calls api.post', () => {
    mockApi.post.returns(of({ player: fakePlayers[0] }));
    state.createPlayer({ name: 'New' }).subscribe();
    expect(mockApi.post).to.be.calledWith('/api/players/manual', { name: 'New' });
  });

  it('updatePlayer calls api.put', () => {
    mockApi.put.returns(of({ player: fakePlayers[0] }));
    state.updatePlayer('1', { name: 'Updated' }).subscribe();
    expect(mockApi.put).to.be.calledWith('/api/players/1', { name: 'Updated' });
  });

  it('deletePlayer calls api.delete', () => {
    mockApi.delete.returns(of({ message: 'deleted' }));
    state.deletePlayer('1').subscribe();
    expect(mockApi.delete).to.be.calledWith('/api/players/1');
  });

  it('selectedPlayer', () => {
    expect(state.selectedPlayer()).to.be.null;
    state.setSelectedPlayer(fakePlayers[0]);
    expect(state.selectedPlayer()?.name).to.equal('Leo');
  });

  it('loadSelectedPlayer loads by id', () => {
    mockApi.get.returns(of({ player: fakePlayers[0] }));
    state.loadSelectedPlayer('1');
    expect(state.selectedPlayer()?.name).to.equal('Leo');
  });
});
