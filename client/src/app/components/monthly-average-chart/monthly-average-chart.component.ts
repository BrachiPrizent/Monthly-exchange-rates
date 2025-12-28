import { Component, inject, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ExchangeRate } from 'src/app/models/exchange-rate';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { ExchangeRatesService } from 'src/app/services/exchange-rates.service';

@Component({
  selector: 'app-monthly-average-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  templateUrl: './monthly-average-chart.component.html',
  styleUrl: './monthly-average-chart.component.scss'
})

export class MonthlyAverageChartComponent implements OnInit {

  private exchangeRatesService = inject(ExchangeRatesService);

  rates: ExchangeRate[] = [];

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Rate'
        },
        beginAtZero: false
      }
    }
  };

  ngOnInit(): void {
    this.exchangeRatesService.getRates().subscribe(rates => {
      if (!rates.length) return;

      this.rates = rates;
      this.prepareChartData();
    });
  }

  prepareChartData(): void {
    const sortedRates = [...this.rates]
      .filter(r => r.year >= 2023)
      .sort((a, b) => a.year - b.year || a.month - b.month);

    this.chartData = {
      labels: sortedRates.map(r => `${this.getMonthName(r.month)} ${r.year}`),
      datasets: [
        {
          data: sortedRates.map(r => r.usd_ils_avg),
          label: 'Average USD to ILS',
          fill: true,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.3)',
          tension: 0.4,
        }
      ]
    };
  }

  getMonthName(monthNumber: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || '';
  }
}
