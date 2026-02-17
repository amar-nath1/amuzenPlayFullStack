
import { ActivatedRouteSnapshot, MaybeAsync, RedirectCommand, Resolve, RouterStateSnapshot } from '@angular/router'
import { ApiService } from '../shared/services/api/api-service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CardResolver implements Resolve<any> {

    constructor(private apiService: ApiService){

    }
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any | RedirectCommand> {
        
        return this.apiService.loadUserData()
    }

    }