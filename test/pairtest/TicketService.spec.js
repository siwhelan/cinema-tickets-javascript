import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../src/thirdparty/paymentgateway/TicketPaymentService.js');
vi.mock('../../src/thirdparty/seatbooking/SeatReservationService.js');

import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js';
import TicketService from '../../src/pairtest/TicketService.js';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService.js';

const makeRequest = (type, count) => new TicketTypeRequest(type, count);

describe('TicketService', () => {
  let service;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new TicketService();
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
      expect(() => service.purchaseTickets(12345)).toThrow(
        InvalidPurchaseException,
      );
    });

    test('should throw InvalidPurchaseException if more than 25 tickets are requested', () => {
      expect(() =>
        service.purchaseTickets(12345, makeRequest('ADULT', 26)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(
          12345,
          makeRequest('ADULT', 12),
          makeRequest('CHILD', 13),
          makeRequest('INFANT', 1),
        ),
      ).toThrow(InvalidPurchaseException);
    });

    test('should thrown InvalidPurchaseException if a child or infant ticket is purchased without an adult', () => {
      expect(() =>
        service.purchaseTickets(12345, makeRequest('CHILD', 2)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(12345, makeRequest('INFANT', 2)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(
          12345,
          makeRequest('CHILD', 2),
          makeRequest('ADULT', 1),
        ),
      ).not.toThrow();
    });

    test('should call TicketPaymentService with the correct total cost', () => {
      service.purchaseTickets(
        12345,
        makeRequest('ADULT', 2), // 50
        makeRequest('CHILD', 1), // 15
      );
      expect(TicketPaymentService.prototype.makePayment).toHaveBeenCalledWith(
        12345,
        65,
      );
    });

    test('should call SeatReservationService with the correct number of seats', () => {
      service.purchaseTickets(
        12345,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', 1),
      );
      expect(SeatReservationService.prototype.reserveSeat).toHaveBeenCalledWith(
        12345,
        3,
      );
    });
  });
});
