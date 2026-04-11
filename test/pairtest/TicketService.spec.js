import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TICKET_PRICES } from '../../src/pairtest/config.js';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js';
import TicketService from '../../src/pairtest/TicketService.js';

const makeRequest = (type, count) => new TicketTypeRequest(type, count);

const mockPayment = { makePayment: vi.fn() };
const mockReservation = { reserveSeat: vi.fn() };
const mockTicketValidator = { validate: vi.fn() };

describe('TicketService', () => {
  let service;
  const accountId = 12345;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TicketService(
      mockPayment,
      mockReservation,
      mockTicketValidator,
    );
  });

  describe('purchaseTickets', () => {
    test('should throw if the validator rejects the request', () => {
      mockTicketValidator.validate.mockImplementationOnce(() => {
        throw new InvalidPurchaseException('Invalid');
      });

      expect(() =>
        service.purchaseTickets(accountId, makeRequest('ADULT', 2)),
      ).toThrow(InvalidPurchaseException);
    });

    test('should call TicketPaymentService with the correct total cost', () => {
      const expectedCost = TICKET_PRICES.ADULT * 2 + TICKET_PRICES.CHILD * 2;

      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', 2),
      );

      expect(mockPayment.makePayment).toHaveBeenCalledWith(
        accountId,
        expectedCost,
      );
    });

    test('should allow two separate requests for the same type with the correct total cost', () => {
      const expectedCost = TICKET_PRICES.ADULT * 4;

      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('ADULT', 2),
      );

      expect(mockPayment.makePayment).toHaveBeenCalledWith(
        accountId,
        expectedCost,
      );
    });

    test('should call SeatReservationService with the correct number of seats', () => {
      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', 1),
        makeRequest('INFANT', 1),
      );
      expect(mockReservation.reserveSeat).toHaveBeenCalledWith(
        accountId,
        3, // infants don't require seats. Note there is no rule regarding a limit of 1 infant per adult
      );
    });

    test('should successfully purchase a mix of ticket types and reserve relevant seats', () => {
      service.purchaseTickets(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', 2),
        makeRequest('INFANT', 1),
      );

      const expectedOrderCost =
        TICKET_PRICES.ADULT * 2 + TICKET_PRICES.CHILD * 2;

      expect(mockPayment.makePayment).toHaveBeenCalledWith(
        accountId,
        expectedOrderCost,
      );
      expect(mockTicketValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockReservation.reserveSeat).toHaveBeenCalledWith(accountId, 4); // 5 tickets but 4 seats
      expect(mockPayment.makePayment).toHaveBeenCalledTimes(1);
      expect(mockReservation.reserveSeat).toHaveBeenCalledTimes(1);
    });

    // End to end - no mocks
    test('end-to-end: processes a valid purchase without mocks', () => {
      const realService = new TicketService();
      expect(() =>
        realService.purchaseTickets(
          12345,
          new TicketTypeRequest('ADULT', 2),
          new TicketTypeRequest('CHILD', 1),
          new TicketTypeRequest('INFANT', 1),
        ),
      ).not.toThrow();
    });
  });
});
