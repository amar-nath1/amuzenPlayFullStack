import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonNote, IonInput, IonTextarea, IonButton, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  standalone: true,
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [CommonModule, HttpClientModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonNote, IonInput, IonTextarea, IonButton, IonGrid, IonRow, IonCol],
})
export class Tab3Page implements OnInit {
  user: any = null;
  private BACKEND = 'http://localhost:4000';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadProfile();
    document.getElementById('save-profile')?.addEventListener('click', () => this.saveProfile());
    document.getElementById('logout')?.addEventListener('click', () => this.logout());
  }

  async loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res: any = await lastValueFrom(this.http.get(`${this.BACKEND}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } }));
      this.user = res;
      const nameEl = document.getElementById('profile-name');
      const emailEl = document.getElementById('profile-email');
      const mobileEl = document.getElementById('profile-mobile') as HTMLInputElement | null;
      const addressEl = document.getElementById('profile-address') as HTMLTextAreaElement | null;

      if (nameEl) nameEl.innerText = this.user.name || '-';
      if (emailEl) emailEl.innerText = this.user.email || '-';
      if (mobileEl) mobileEl.value = this.user.mobile || '';
      if (addressEl) addressEl.value = this.user.address || '';
    } catch (e) {
      console.error('load profile error', e);
    }
  }

  async saveProfile() {
    const token = localStorage.getItem('token');
    if (!token) { alert('Please sign in'); return; }
    const mobileEl = document.getElementById('profile-mobile') as HTMLInputElement | null;
    const addressEl = document.getElementById('profile-address') as HTMLTextAreaElement | null;
    const mobile = mobileEl?.value ?? '';
    const address = addressEl?.value ?? '';
    try {
      await lastValueFrom(this.http.post(`${this.BACKEND}/api/user/update`, { mobile, address }, { headers: { Authorization: `Bearer ${token}` } }));
      alert('Profile updated');
      this.loadProfile();
    } catch (e) {
      console.error('save profile error', e);
      alert('Unable to save profile');
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.user = null;
    this.router.navigateByUrl('/auth');
  }
}
