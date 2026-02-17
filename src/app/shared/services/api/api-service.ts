import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private http: HttpClient){

  }

  loadUserData(){
    return this.http.get(`${environment.apiUrl}/user/cards`)
  }
  
}
