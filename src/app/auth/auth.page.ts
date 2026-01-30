import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
  imports: [CommonModule, FormsModule, HttpClientModule, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonLabel, IonButton, IonList],
})
export class AuthPage {
  mode: 'signin' | 'signup' = 'signin';
  name = '';
  email = '';
  password = '';
  returnUrl = '/tabs/game';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    const q = this.route.snapshot.queryParamMap.get('return');
    if (q) this.returnUrl = q;
  }

  toggle() {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin';
  }

  async submit() {
    const BACKEND = 'http://localhost:4000';
    try {
      if (this.mode === 'signup') {
        const res: any = await this.http.post(`${BACKEND}/api/auth/signup`, { name: this.name, email: this.email, password: this.password }).toPromise();
        localStorage.setItem('token', res.token);
      } else {
        const res: any = await this.http.post(`${BACKEND}/api/auth/signin`, { email: this.email, password: this.password }).toPromise();
        localStorage.setItem('token', res.token);
      }
      // navigate back
      this.router.navigateByUrl(this.returnUrl);
    } catch (e: any) {
      console.error('auth error', e);
      alert(e?.error?.error || 'Auth failed');
    }
  }
}
