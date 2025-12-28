import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { MonthlyAverageChartComponent } from './monthly-average-chart.component';
import { ExchangeRatesService } from 'src/app/services/exchange-rates.service';
import { ExchangeRate } from 'src/app/models/exchange-rate';
import { NgChartsModule } from 'ng2-charts';

describe('MonthlyAverageChartComponent', () => {
    let component: MonthlyAverageChartComponent;
    let fixture: ComponentFixture<MonthlyAverageChartComponent>;
    let mockExchangeRatesService: jasmine.SpyObj<ExchangeRatesService>;

    const mockRates: ExchangeRate[] = [
        { _id: '1', year: 2023, month: 1, usd_ils_avg: 3.5 },
        { _id: '2', year: 2023, month: 3, usd_ils_avg: 3.7 },
        { _id: '3', year: 2023, month: 2, usd_ils_avg: 3.6 },
        { _id: '4', year: 2024, month: 1, usd_ils_avg: 3.8 },
    ];

    beforeEach(waitForAsync(() => {
        mockExchangeRatesService = jasmine.createSpyObj('ExchangeRatesService', ['getRates']);
        mockExchangeRatesService.getRates.and.returnValue(of(mockRates));

        TestBed.configureTestingModule({
            imports: [MonthlyAverageChartComponent, NgChartsModule],
            providers: [
                { provide: ExchangeRatesService, useValue: mockExchangeRatesService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MonthlyAverageChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getRates on init', () => {
        expect(mockExchangeRatesService.getRates).toHaveBeenCalled();
    });

    it('should prepare chartData correctly', () => {
        const labels = component.chartData.labels;
        const data = component.chartData.datasets[0].data;

        expect(labels).toEqual([
            'Jan 2023',
            'Feb 2023',
            'Mar 2023',
            'Jan 2024'
        ]);

        expect(data).toEqual([3.5, 3.6, 3.7, 3.8]);
    });

    it('should get correct month names', () => {
        expect(component.getMonthName(1)).toBe('Jan');
        expect(component.getMonthName(12)).toBe('Dec');
        expect(component.getMonthName(0)).toBe('');
        expect(component.getMonthName(13)).toBe('');
    });

    it('should not prepare chartData if rates array is empty', () => {
        mockExchangeRatesService.getRates.and.returnValue(of([]));
        const newFixture = TestBed.createComponent(MonthlyAverageChartComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.chartData.labels?.length ?? 0).toBe(0);
        expect(newComponent.chartData.datasets?.length ?? 0).toBe(0);
    });
});
