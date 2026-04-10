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
      throw new InvalidPurchaseException('Cannot purchase more than 25 tickets')
    }
  }

  #getTotalTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce((sum, req) => sum + req.getNoOfTickets(), 0);
  }

}
