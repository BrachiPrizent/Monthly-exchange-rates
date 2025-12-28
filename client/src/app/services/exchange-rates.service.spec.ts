import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRate } from '../models/exchange-rate';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;
  let httpMock: HttpTestingController;

  const mockRates: ExchangeRate[] = [
    { _id: '1', year: 2023, month: 1, usd_ils_avg: 3.5 },
    { _id: '2', year: 2023, month: 2, usd_ils_avg: 3.6 },
    { _id: '3', year: 2023, month: 3, usd_ils_avg: 3.7 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExchangeRatesService]
    });

    service = TestBed.inject(ExchangeRatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch rates from API', () => {
    service.getRatesFromApi().subscribe(rates => {
      expect(rates).toEqual(mockRates);
    });

    const req = httpMock.expectOne('http://127.0.0.1:5000/api/rates');
    expect(req.request.method).toBe('GET');
    req.flush(mockRates);
  });

  it('should set and get rates using BehaviorSubject', () => {
    let emittedRates: ExchangeRate[] | undefined;

    service.getRates().subscribe(rates => {
      emittedRates = rates;
    });

    service.setRates(mockRates);
    expect(emittedRates).toEqual(mockRates);
  });
});
