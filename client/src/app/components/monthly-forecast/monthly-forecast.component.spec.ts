import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { MonthlyForecastComponent } from './monthly-forecast.component';
import { ExchangeRatesService } from 'src/app/services/exchange-rates.service';
import { ExchangeRate } from 'src/app/models/exchange-rate';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DecimalPipe } from '@angular/common';

describe('MonthlyForecastComponent', () => {
    let component: MonthlyForecastComponent;
    let fixture: ComponentFixture<MonthlyForecastComponent>;
    let mockExchangeRatesService: jasmine.SpyObj<ExchangeRatesService>;

    const mockRates: ExchangeRate[] = [
        { _id: '1', year: 2023, month: 1, usd_ils_avg: 3.5 },
        { _id: '2', year: 2023, month: 2, usd_ils_avg: 3.6 },
        { _id: '3', year: 2023, month: 3, usd_ils_avg: 3.7 },
        { _id: '4', year: 2023, month: 4, usd_ils_avg: 3.8 },
        { _id: '5', year: 2023, month: 5, usd_ils_avg: 3.9 },
        { _id: '6', year: 2023, month: 6, usd_ils_avg: 4.0 },
    ];

    beforeEach(waitForAsync(() => {
        mockExchangeRatesService = jasmine.createSpyObj('ExchangeRatesService', ['getRatesFromApi']);
        mockExchangeRatesService.getRatesFromApi.and.returnValue(of(mockRates));

        TestBed.configureTestingModule({
            imports: [MonthlyForecastComponent, TableModule, ButtonModule, InputTextModule, DecimalPipe],
            providers: [
                { provide: ExchangeRatesService, useValue: mockExchangeRatesService }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MonthlyForecastComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch and sort rates on init', () => {
        expect(mockExchangeRatesService.getRatesFromApi).toHaveBeenCalled();
        expect(component.rates.length).toBe(mockRates.length);
        for (let i = 1; i < component.rates.length; i++) {
            const prev = component.rates[i - 1];
            const curr = component.rates[i];
            expect(curr.year > prev.year || (curr.year === prev.year && curr.month > prev.month)).toBeTrue();
        }
    });

    it('should calculate forecastRows correctly', () => {
        component.rates = mockRates;
        component.calculateForecastRows();

        fixture.detectChanges();

        for (let i = 0; i < 3; i++) {
            expect(component.forecastRows[i].forecast).toBeNull();
            expect(component.forecastRows[i].difference).toBeNull();
            expect(component.forecastRows[i].avgDifference3Months).toBeNull();
        }

        const forecast4 = (mockRates[0].usd_ils_avg + mockRates[1].usd_ils_avg + mockRates[2].usd_ils_avg) / 3;
        expect(component.forecastRows[3].forecast).toBeCloseTo(forecast4, 4);
        expect(component.forecastRows[3].difference).toBeCloseTo(mockRates[3].usd_ils_avg - forecast4, 4);
        expect(component.forecastRows[3].avgDifference3Months).toBeNull();

        const diffs = component.forecastRows.slice(1, 4).map(r => r.difference!).filter(d => d !== null);
        if (diffs.length === 3) {
            const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            expect(component.forecastRows[4].avgDifference3Months).toBeCloseTo(avgDiff, 4);
        } else {
            expect(component.forecastRows[4].avgDifference3Months).toBeNull();
        }

        const diffsNext = component.forecastRows.slice(2, 5).map(r => r.difference!).filter(d => d !== null);
        if (diffsNext.length === 3) {
            const avgDiffNext = diffsNext.reduce((a, b) => a + b, 0) / diffsNext.length;
            expect(component.forecastRows[5].avgDifference3Months).toBeCloseTo(avgDiffNext, 4);
        } else {
            expect(component.forecastRows[5].avgDifference3Months).toBeNull();
        }
    });

    it('should calculate matrix product correctly', () => {
        component.calculateForecastRows();
        component.calculateMatrixProduct();
        fixture.detectChanges();

        const forecasts = component.forecastRows.map(r => r.forecast).filter(f => f !== null) as number[];
        const differences = component.forecastRows.map(r => r.difference).filter(d => d !== null) as number[];

        expect(component.matrixProduct.length).toBe(forecasts.length);
        for (let i = 0; i < forecasts.length; i++) {
            for (let j = 0; j < differences.length; j++) {
                expect(component.matrixProduct[i][j]).toBeCloseTo(forecasts[i] * differences[j], 4);
            }
        }
    });

    it('should toggle showMatrix and calculate matrix product when opening', () => {
        expect(component.showMatrix).toBeFalse();
        component.toggleMatrix();
        fixture.detectChanges();
        expect(component.showMatrix).toBeTrue();
        expect(component.matrixProduct.length).toBeGreaterThan(0);
        component.toggleMatrix();
        fixture.detectChanges();
        expect(component.showMatrix).toBeFalse();
    });
});
