import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import { MAX_TICKETS, TICKET_PRICES, TICKET_TYPES } from './config.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validate(accountId, ticketTypeRequests);

    const totalCost = this.#calculateTotalCost(ticketTypeRequests);
    new TicketPaymentService().makePayment(accountId, totalCost);

    const totalSeats = this.#calculateNoOfSeats(ticketTypeRequests);
    new SeatReservationService().reserveSeat(accountId, totalSeats);
  }

  #getTotalNoOfTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) => sum + req.getNoOfTickets(),
      0,
    );
  }

  #validTicketSelection(ticketTypeRequests) {
    const types = ticketTypeRequests.map((req) => req.getTicketType());
    const hasAdult = types.includes(TICKET_TYPES.ADULT);
    const hasChildOrInfant =
      types.includes(TICKET_TYPES.CHILD) || types.includes(TICKET_TYPES.INFANT);

    return hasAdult || !hasChildOrInfant;
  }

  // TODO Refactor this
  #calculateTotalCost(ticketTypeRequests) {
    // start a counter
    let total = 0;
    // loop through ticketTypeRequests and multiply type price by no of tickets
    for (const req of ticketTypeRequests) {
      total += TICKET_PRICES[req.getTicketType()] * req.getNoOfTickets();
    }
    return total;
  }

  #calculateNoOfSeats(ticketTypeRequests) {
    // Type INFANT = no seat
    return ticketTypeRequests
      .filter((req) => req.getTicketType() !== TICKET_TYPES.INFANT)
      .reduce((sum, req) => sum + req.getNoOfTickets(), 0);
  }

  #validate(accountId, ticketTypeRequests) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid Account ID');
    }

    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('No tickets requested');
    }

    if (this.#getTotalNoOfTickets(ticketTypeRequests) > MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `Cannot purchase more than ${MAX_TICKETS} tickets`,
      );
    }

    if (!this.#validTicketSelection(ticketTypeRequests)) {
      throw new InvalidPurchaseException('Adult ticket must be purchased');
    }
  }
}
