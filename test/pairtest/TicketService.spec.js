import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../src/thirdparty/paymentgateway/TicketPaymentService.js');
vi.mock('../../src/thirdparty/seatbooking/SeatReservationService.js');

import { MAX_TICKETS } from '../../src/pairtest/config.js';

import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js';
import TicketService from '../../src/pairtest/TicketService.js';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService.js';

const makeRequest = (type, count) => new TicketTypeRequest(type, count);

describe('TicketService', () => {
  let service;
  let accountId;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TicketService();
    accountId = 12345;
  });

  describe('purchaseTickets', () => {
    test('should throw InvalidPurchaseException if accountId is not valid', () => {
      expect(() => service.purchaseTickets(makeRequest('ADULT', 2))).toThrow(
        InvalidPurchaseException,
      );
      expect(() => service.purchaseTickets(0, makeRequest('ADULT', 2))).toThrow(
        InvalidPurchaseException,
      );
      expect(() =>
        service.purchaseTickets(-1, makeRequest('ADULT', 2)),
      ).toThrow(InvalidPurchaseException);
    });

    test('should throw InvalidPurchaseException if no tickets are requested', () => {
      expect(() => service.purchaseTickets(accountId)).toThrow(
        InvalidPurchaseException,
      );
    });

    test(`should throw InvalidPurchaseException if more than ${MAX_TICKETS} tickets are requested`, () => {
      expect(() =>
        service.purchaseTickets(
          accountId,
          makeRequest('ADULT', MAX_TICKETS + 1),
        ),
      ).toThrow(InvalidPurchaseException);

      expect(
        () =>
          service.purchaseTickets(
            accountId,
            makeRequest('ADULT', 12),
            makeRequest('CHILD', 13),
            makeRequest('INFANT', 1),
          ), // 12 + 13 + 1 = 26, one over the current limit of 25
      ).toThrow(InvalidPurchaseException);
    });

    test('should throw InvalidPurchaseException if a child or infant ticket is purchased without an adult', () => {
      expect(() =>
        service.purchaseTickets(accountId, makeRequest('CHILD', 2)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(accountId, makeRequest('INFANT', 2)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(
          accountId,
          makeRequest('CHILD', 2),
          makeRequest('ADULT', 1),
        ),
      ).not.toThrow();
    });

    test('should call TicketPaymentService with the correct total cost', () => {
      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2), // 50
        makeRequest('CHILD', 1), // 15
      );
      expect(TicketPaymentService.prototype.makePayment).toHaveBeenCalledWith(
        accountId,
        65,
      );
    });

    test('should call SeatReservationService with the correct number of seats', () => {
      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', 1),
      );
      expect(SeatReservationService.prototype.reserveSeat).toHaveBeenCalledWith(
        accountId,
        3,
      );
    });
  });
});
