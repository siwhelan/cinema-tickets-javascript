import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketTypeRequest from './lib/TicketTypeRequest.js';

/**
 * @typedef {'ADULT' | 'CHILD' | 'INFANT'} TicketType
 */

/**
 * @type {Record<TicketType, number>}
 */
const TICKET_PRICES = Object.freeze({
  ADULT: 25,
  CHILD: 15,
  INFANT: 0,
});

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid Account ID');
    }

    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('No tickets requested');
    }

    if (this.#getTotalTickets(ticketTypeRequests) > 25) {
      throw new InvalidPurchaseException(
        'Cannot purchase more than 25 tickets',
      );
    }

    if (!this.#validTicketSelection(ticketTypeRequests)) {
      throw new InvalidPurchaseException('Adult ticket must be purchased');
    }

    const totalCost = this.#calculateTotalCost(ticketTypeRequests);
    new TicketPaymentService().makePayment(accountId, totalCost);
  }

  #getTotalTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) => sum + req.getNoOfTickets(),
      0,
    );
  }

  #validTicketSelection(ticketTypeRequests) {
    const types = ticketTypeRequests.map((req) => req.getTicketType());
    const hasAdult = types.includes('ADULT');
    const hasChildOrInfant =
      types.includes('CHILD') || types.includes('INFANT');

    return hasAdult || !hasChildOrInfant;
  }

  #calculateTotalCost(ticketTypeRequests) {
    // Adults £25, Children £15, Infants £0
    // start a counter
    let total = 0;

    // loop through ticketTypeRequests and multiply type price by no of tickets
    for (const req of ticketTypeRequests) {
      total += TICKET_PRICES[req.getTicketType()] * req.getNoOfTickets();
    }
    return total;
  }
}
