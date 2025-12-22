import { Component, ViewChild } from '@angular/core';
import { ExchangeRatesService } from '../../services/exchange-rates.service';
import { ExchangeRate } from '../../models/exchange-rate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-exchange-rates-page',
  standalone: true,
  imports: [CommonModule, TableModule, HttpClientModule, FormsModule, RouterModule, InputTextModule],
  templateUrl: './exchange-rates-page.component.html',
  styleUrl: './exchange-rates-page.component.scss',
})
export class ExchangeRatesPageComponent {
  @ViewChild('dt2') dt2!: Table;
  rates: ExchangeRate[] = [];
  selectedRate: ExchangeRate | null = null;
  minRate = 0;
  maxRate = 0;
  forecast: number | null = null;

  constructor(private exchangeRatesService: ExchangeRatesService) { }

  ngOnInit(): void {
    debugger
    this.exchangeRatesService.getRatesFromApi().subscribe({
      next: data => {
        debugger
        console.log('Rates received:', data);
        this.rates = data;
        this.exchangeRatesService.setRates(data);
        this.minRate = Math.min(...data.map(r => r.usd_ils_avg));
        this.maxRate = Math.max(...data.map(r => r.usd_ils_avg));
        this.calculateForecast()
      },
      error: err => {
        console.error('Error fetching rates:', err);
      }
    });
  }

  getRateClass(value: number): string {
    if (value === this.maxRate) return 'rate-highest';
    if (value === this.minRate) return 'rate-lowest';
    return '';
  }

  filterColumn(event: Event, field: string) {
    const value = (event.target as HTMLInputElement).value;
     this.dt2?.filter(value.toString(), field, 'contains');
  }

  calculateForecast() {
    this.rates.sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
    const lastRate = this.rates[this.rates.length - 1];
    const lastYear = lastRate.year;
    const lastMonth = lastRate.month;
    const previousMonths = [];
    for(let i = 1; i <= 3; i++) {
      let month = lastMonth - i;
      let year = lastYear;
      if(month <= 0) {
        month += 12;
        year -= 1;
      }
      const rate = this.rates.find(r => r.year === year && r.month === month);
      if(rate) previousMonths.push(rate.usd_ils_avg);
    }
    if(previousMonths.length === 3) {
      this.forecast = previousMonths.reduce((a, b) => a + b, 0) / 3;
    } else {
      this.forecast = null;
    }
  }
}
