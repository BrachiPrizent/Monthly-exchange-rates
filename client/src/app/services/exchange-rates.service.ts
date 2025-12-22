import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExchangeRate } from '../models/exchange-rate';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRatesService {

  private apiUrl = 'http://127.0.0.1:5000/api';
  private rates$ = new BehaviorSubject<ExchangeRate[]>([]);

  constructor(private http: HttpClient) { }

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
