import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonGrid, IonRow, IonCol, IonCardSubtitle } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
  imports: [CommonModule, HttpClientModule, IonCardSubtitle, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonGrid, IonRow, IonCol],
})
export class GamePage {
  numbers: string[] = [];
  lockedIndex: number | null = null;
  constructor(private router: Router, private http: HttpClient) {
    this.generateNumbers();
  }

  generateNumbers() {
    this.numbers = Array.from({ length: 4 }, () => this.random10Digits());
    this.lockedIndex = null;
  }

  random10Digits() {
    let s = '';
    while (s.length < 10) {
      s += Math.floor(Math.random() * 10).toString();
    }
    return s;
  }

  startGame() {
    // kept for compatibility with previous button
    this.generateNumbers();
  }

  lockCard(i: number) {
    this.lockedIndex = i;
  }

  async pay() {
    if (this.lockedIndex === null) return;
    const token = localStorage.getItem('token') || '';
    if (!token) {
      // redirect to auth page and return here
      this.router.navigate(['/auth'], { queryParams: { return: '/tabs/game' } });
      return;
    }
    const amount = 1500; // paise
    const selectedNumber = this.numbers[this.lockedIndex];

    try {
      const BACKEND = 'http://localhost:4000';
      const order: any = await firstValueFrom(this.http.post(`${BACKEND}/api/orders/order`, { amount, selectedNumber }, { headers: { Authorization: `Bearer ${token}` } }));

      const options: any = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'amuzenPlay',
        description: 'Lock number purchase',
        order_id: order.id,
        handler: async (response: any) => {
            try {
              await firstValueFrom(this.http.post(`${BACKEND}/api/orders/verify`, response, { headers: { Authorization: `Bearer ${token}` } }));
              alert('Payment successful! Number added to your account.');
              this.goBack();
            } catch (e) {
            console.error('verify error', e);
            alert('Payment verification failed on server.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Checkout dismissed');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error('order creation error', e);
      alert('Unable to create order. Try again.');
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }
}
