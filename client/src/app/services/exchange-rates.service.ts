import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExchangeRate } from '../models/exchange-rate';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRatesService {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;
  private rates$ = new BehaviorSubject<ExchangeRate[]>([]);

  getRatesFromApi(): Observable<ExchangeRate[]> {
    return this.http.get<ExchangeRate[]>(`${this.apiUrl}/rates`);
  }

  setRates(rates: ExchangeRate[]) {
    this.rates$.next(rates);
  }

  getRates() {
    return this.rates$.asObservable();
  }
}
