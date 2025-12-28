import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ExchangeRatesPageComponent } from './exchange-rates-page.component';
import { ExchangeRatesService } from '../../services/exchange-rates.service';
import { ExchangeRate } from '../../models/exchange-rate';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

describe('ExchangeRatesPageComponent', () => {
    let component: ExchangeRatesPageComponent;
    let fixture: ComponentFixture<ExchangeRatesPageComponent>;
    let mockService: jasmine.SpyObj<ExchangeRatesService>;

    const mockRates: ExchangeRate[] = [
        { _id: '1', year: 2023, month: 1, usd_ils_avg: 3.5 },
        { _id: '2', year: 2023, month: 2, usd_ils_avg: 3.6 },
        { _id: '3', year: 2023, month: 3, usd_ils_avg: 3.7 },
        { _id: '4', year: 2023, month: 4, usd_ils_avg: 3.8 },
    ];

    beforeEach(waitForAsync(() => {
        mockService = jasmine.createSpyObj('ExchangeRatesService', ['getRatesFromApi', 'setRates']);
        mockService.getRatesFromApi.and.returnValue(of(mockRates));

        TestBed.configureTestingModule({
            imports: [ExchangeRatesPageComponent, CommonModule, TableModule, FormsModule, InputTextModule, HttpClientModule, RouterModule.forRoot([])],
            providers: [
                { provide: ExchangeRatesService, useValue: mockService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExchangeRatesPageComponent);
        component = fixture.componentInstance;

        component.dt2 = jasmine.createSpyObj('Table', ['filter']);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch rates and set min/max/forecast on init', () => {
        expect(mockService.getRatesFromApi).toHaveBeenCalled();
        expect(component.rates).toEqual(mockRates);
        expect(component.minRate).toBe(3.5);
        expect(component.maxRate).toBe(3.8);
        expect(component.forecast).toBeCloseTo((3.5 + 3.6 + 3.7) / 3);
        expect(mockService.setRates).toHaveBeenCalledWith(mockRates);
    });

    it('should return correct rate class', () => {
        component.minRate = 3.5;
        component.maxRate = 3.8;
        expect(component.getRateClass(3.8)).toBe('rate-highest');
        expect(component.getRateClass(3.5)).toBe('rate-lowest');
        expect(component.getRateClass(3.6)).toBe('');
    });

    it('should filter column using dt2', () => {
        component.dt2 = { filter: jasmine.createSpy('filter') } as unknown as Table;

        const event = { target: { value: '3.6' } } as unknown as Event;
        component.filterColumn(event, 'usd_ils_avg');

        expect(component.dt2.filter).toHaveBeenCalledWith('3.6', 'usd_ils_avg', 'contains');
    });

    it('should calculate forecast correctly', () => {
        component.rates = [
            { _id: '1', year: 2023, month: 1, usd_ils_avg: 3.5 },
            { _id: '2', year: 2023, month: 2, usd_ils_avg: 3.6 },
            { _id: '3', year: 2023, month: 3, usd_ils_avg: 3.7 },
            { _id: '4', year: 2023, month: 4, usd_ils_avg: 3.8 },
        ];
        component.calculateForecast();
        expect(component.forecast).toBeCloseTo((3.5 + 3.6 + 3.7) / 3);
    });

    it('should handle error from service', () => {
        mockService.getRatesFromApi.and.returnValue(throwError(() => new Error('API error')));
        const consoleSpy = spyOn(console, 'error');
        component.ngOnInit();
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching rates:', jasmine.any(Error));
    });
});
