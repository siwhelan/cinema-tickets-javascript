import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketTypeRequest from './lib/TicketTypeRequest.js';

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

    if (!this.#getTicketType(ticketTypeRequests)) {
      throw new InvalidPurchaseException('Adult ticket must be purchased');
    }
  }

  #getTotalTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) => sum + req.getNoOfTickets(),
      0,
    );
  }

  #getTicketType(ticketTypeRequests) {
    const types = [];
    // iterate through array and call req.getTicketType on each
    // add each type to an array
    ticketTypeRequests.forEach((req) => {
      const type = req.getTicketType();
      if (!types.includes(type)) {
        types.push(type);
      }
    });

    // throw error if any are CHILD or INFANT, and ADULT is not also present
    if (types.includes('CHILD') || types.includes('INFANT')) {
      if (!types.includes('ADULT')) {
        return false;
      }
    }
    return true;
  }
}
