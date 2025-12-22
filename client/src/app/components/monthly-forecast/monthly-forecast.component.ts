import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ExchangeRate } from 'src/app/models/exchange-rate';
import { ExchangeRatesService } from 'src/app/services/exchange-rates.service';

interface ForecastRow {
  year: number;
  month: number;
  actual: number;
  forecast: number | null;
  difference: number | null;
  avgDifference3Months?: number | null;
}

@Component({
  selector: 'app-monthly-forecast',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TableModule, InputTextModule, ButtonModule],
  templateUrl: './monthly-forecast.component.html',
  styleUrl: './monthly-forecast.component.scss'
})
export class MonthlyForecastComponent implements OnInit {
  rates: ExchangeRate[] = [];
  forecastRows: ForecastRow[] = [];
  matrixProduct: number[][] = [];
  showMatrix = false;

  constructor(private exchangeRatesService: ExchangeRatesService) { }

  ngOnInit() {
    this.exchangeRatesService.getRatesFromApi().subscribe(data => {
      this.rates = data.sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
      this.calculateForecastRows();
    });
  }

  calculateForecastRows() {
    this.forecastRows = this.rates.map((rate, index) => {
      let forecast: number | null = null;
      let difference: number | null = null;
      if (index >= 3) {
        const prev3Rates = this.rates.slice(index - 3, index);
        forecast = prev3Rates.reduce((sum, r) => sum + r.usd_ils_avg, 0) / 3;
        difference = rate.usd_ils_avg - forecast;
      }
      return {
        year: rate.year,
        month: rate.month,
        actual: rate.usd_ils_avg,
        forecast,
        difference,
        avgDifference3Months: null
      };
    });
    this.forecastRows.forEach((row, index) => {
      if (index >= 3) {
        const prev3Diffs = this.forecastRows.slice(index - 3, index).map(r => r.difference!).filter(d => d !== null);
        if (prev3Diffs.length === 3) {
          row.avgDifference3Months = prev3Diffs.reduce((sum, d) => sum + d, 0) / 3;
        }
      }
    });
  }

  calculateMatrixProduct() {
    const forecasts = this.forecastRows.map(r => r.forecast).filter(f => f !== null) as number[];
    const differences = this.forecastRows.map(r => r.difference).filter(d => d !== null) as number[];
    this.matrixProduct = [];
    for (let i = 0; i < forecasts.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < differences.length; j++) {
        row.push(forecasts[i] * differences[j]);
      }
      this.matrixProduct.push(row);
    }
  }

  toggleMatrix() {
    this.showMatrix = !this.showMatrix;
    if (this.showMatrix) {
      this.calculateMatrixProduct();
    }
  }
}
