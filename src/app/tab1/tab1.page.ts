import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCol, IonButton, IonCardSubtitle, IonRow, IonGrid, IonList, IonItem, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [HttpClientModule, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge
    , CommonModule
  ],
})
export class Tab1Page {
  userCards: Array<{ number: string; purchasedAt?: string; orderId?: string }> = [];
  investedValue = 0; // in rupees
  isLoggedIn = false;
  winners: Array<{ number: string; name?: string | null }> = [];

  constructor(private router: Router, private http: HttpClient) {
    this.isLoggedIn = !!localStorage.getItem('token');
    if (this.isLoggedIn) this.loadUserData();
    this.loadWinners();
  }

  startGame() {
    this.router.navigate(['/tabs/game']);
  }

  async loadUserData() {
    const token = localStorage.getItem('token') || '';
    if (!token) {
      this.isLoggedIn = false;
      return;
    }
    this.isLoggedIn = true;
    const BACKEND = 'http://localhost:4000';
    try {
      const res: any = await firstValueFrom(this.http.get(`${BACKEND}/api/user/cards`, { headers: { Authorization: `Bearer ${token}` } }));
      this.userCards = res.cards || [];
      this.investedValue = (this.userCards.length || 0) * 9; // Rs.9 invested per purchase
    } catch (e) {
      console.error('loadUserData error', e);
    }
  }

  async loadWinners() {
    const BACKEND = 'http://localhost:4000';
    try {
        const res: any = await firstValueFrom(this.http.get(`${BACKEND}/api/user/winners`));
      this.winners = res.winners || [];
    } catch (e) {
      console.error('loadWinners error', e);
      this.winners = [];
    }
  }

  login() {
    this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
  }

  signup() {
    this.router.navigate(['/auth'], { queryParams: { mode: 'signup' } });
  }
}
