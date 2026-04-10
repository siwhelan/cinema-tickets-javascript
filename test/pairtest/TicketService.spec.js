import { beforeEach, describe, expect, test } from 'vitest';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';
import TicketService from '../../src/pairtest/TicketService';

const makeRequest = (type, count) => new TicketTypeRequest(type, count);

describe('TicketService', () => {
  let service;
  beforeEach(() => {
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

    test('throw InvalidPurchaseException if more than 25 tickets are requested', () => {
      expect(() =>
        service.purchaseTickets(12345, makeRequest('ADULT', 26)),
      ).toThrow(InvalidPurchaseException);

      expect(() =>
        service.purchaseTickets(
          12345,
          makeRequest('ADULT', 13),
          makeRequest('CHILD', 13),
        ),
      ).toThrow(InvalidPurchaseException);
    });
  });
});
