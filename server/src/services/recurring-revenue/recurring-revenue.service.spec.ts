import { Test, TestingModule } from '@nestjs/testing';
import { RecurringRevenueService } from './recurring-revenue.service';
import { CommonService } from '../common/common.service';

describe('RecurringRevenueService', () => {
  let service: RecurringRevenueService;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringRevenueService, CommonService],
    }).compile();

    service = module.get<RecurringRevenueService>(RecurringRevenueService);
    commonService = module.get<CommonService>(CommonService);
  });

  describe('getYearlyRecurringRevenue', () => {
    it('should return an array of RevenueResponse objects', () => {
      jest
        .spyOn(commonService, 'callMonthlyCalculationsPerYear')
        .mockImplementation(() => [
          {
            relatesTo: '01-2020',
            revenue: 1300,
          },
        ]);

      const response = service.getYearlyRecurringRevenue([]);

      expect(commonService.callMonthlyCalculationsPerYear).toHaveBeenCalled();
      expect(response).toEqual({
        data: [
          {
            relatesTo: '01-2020',
            revenue: 1300,
          },
        ],
        total: {
          relatesTo: 'Total',
          revenue: 1300,
        },
      });
    });
  });

  describe('getMonthlyRecurringRevenue', () => {
    it('should count active subscriptions as revenue', () => {
      jest
        .spyOn(commonService, 'sortSubscriptionsByMonth')
        .mockImplementation(() => [
          {
            index: 0,
            chargeFrequencyInDays: 30,
            status: 'Active',
            startDate: new Date('2020-01-01 00:00:00'),
            statusDate: new Date('2020-01-01 00:00:00'),
            nextCycle: new Date('2020-01-31 00:00:00'),
            cancellationDate: null,
            chargeAmount: 1,
            valueCharged: 100,
            userId: 1,
          },
          {
            index: 1,
            chargeFrequencyInDays: 30,
            status: 'Canceled', // should be skipped
            startDate: new Date('2020-01-01 00:00:00'),
            statusDate: new Date('2020-01-01 00:00:00'),
            nextCycle: new Date('2020-01-31 00:00:00'),
            cancellationDate: new Date('2020-01-12 00:00:00'),
            chargeAmount: 1,
            valueCharged: 100,
            userId: 2,
          },

          {
            index: 1,
            chargeFrequencyInDays: 30,
            status: 'Canceled', // should be counted
            startDate: new Date('2020-01-01 00:00:00'),
            statusDate: new Date('2020-03-01 00:00:00'),
            nextCycle: new Date('2020-04-31 00:00:00'),
            cancellationDate: new Date('2020-03-12 00:00:00'),
            chargeAmount: 3,
            valueCharged: 100,
            userId: 2,
          },
          {
            index: 2,
            chargeFrequencyInDays: 30,
            status: 'Late', // should be counted
            startDate: new Date('2020-01-01 00:00:00'),
            statusDate: new Date('2020-03-01 00:00:00'),
            nextCycle: new Date('2020-04-31 00:00:00'),
            cancellationDate: null,
            chargeAmount: 3,
            valueCharged: 100,
            userId: 3,
          },
          {
            index: 3,
            chargeFrequencyInDays: 365,
            status: 'Canceled', // should be counted
            startDate: new Date('2020-01-01 00:00:00'),
            statusDate: new Date('2020-01-01 00:00:00'),
            nextCycle: new Date('2021-01-10 00:00:00'),
            cancellationDate: null,
            chargeAmount: 1,
            valueCharged: 1000,
            userId: 4,
          },
        ]);

      const response = service.getMonthlyRecurringRevenue([], 0, 2020);

      expect(commonService.sortSubscriptionsByMonth).toHaveBeenCalled();
      expect(response).toEqual({
        relatesTo: '01-2020',
        revenue: 1300,
      });
    });
  });
});
