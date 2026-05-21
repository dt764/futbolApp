import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BackendToggleService } from './backend-toggle.service';

@Component({
  selector: 'app-backend-toggle',
  template: `
    <div class="backend-toggle">
      <ion-segment
        [value]="service.current()"
        (ionChange)="service.set($any($event).detail.value)"
      >
        <ion-segment-button *ngFor="let s of service.all" [value]="s.type">
          <ion-icon [name]="s.type === 'trwm' ? 'server-outline' : 'cloud-outline'" slot="start"></ion-icon>
          <ion-label>{{ s.label }}</ion-label>
        </ion-segment-button>
      </ion-segment>
    </div>
  `,
  styles: [`
    .backend-toggle {
      padding: 4px 12px;
      background: var(--ion-background-color, #fff);
      border-bottom: 1px solid var(--ion-border-color, #e0e0e0);
    }
    ion-segment {
      max-width: 300px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class BackendToggleComponent {
  protected service = inject(BackendToggleService);
}
