import { Routes } from '@angular/router';
import { ExchangeRatesPageComponent } from './components/exchange-rates/exchange-rates-page.component';
import { MonthlyAverageChartComponent } from './components/monthly-average-chart/monthly-average-chart.component';
import { MonthlyForecastComponent } from './components/monthly-forecast/monthly-forecast.component';

export const routes: Routes = [
    { path: '', component: ExchangeRatesPageComponent },
    { path: 'monthly-graph', component: MonthlyAverageChartComponent },
    { path: 'monthly-forecast', component: MonthlyForecastComponent },
    { path: '**', redirectTo: '' }
];
