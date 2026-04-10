import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import { MAX_TICKETS, TICKET_PRICES, TICKET_TYPES } from './config.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketTypeRequest from './lib/TicketTypeRequest.js';

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

  #calculateTotalCost(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) =>
        sum + TICKET_PRICES[req.getTicketType()] * req.getNoOfTickets(),
      0,
    );
  }

  #calculateNoOfSeats(ticketTypeRequests) {
    // Type INFANT = no seat
    return ticketTypeRequests
      .filter((req) => req.getTicketType() !== TICKET_TYPES.INFANT)
      .reduce((sum, req) => sum + req.getNoOfTickets(), 0);
  }

  #validate(accountId, ticketTypeRequests) {
    const totalTickets = this.#getTotalNoOfTickets(ticketTypeRequests);

    const rules = [
      {
        check: () => !Number.isInteger(accountId) || accountId <= 0,
        message: 'Invalid Account ID',
      },
      {
        check: () => ticketTypeRequests.length === 0,
        message: 'No tickets requested',
      },
      {
        check: () =>
          ticketTypeRequests.some((req) => !(req instanceof TicketTypeRequest)),
        message: 'Invalid ticket request',
      },
      {
        check: () => totalTickets > MAX_TICKETS,
        message: `Cannot purchase more than ${MAX_TICKETS} tickets`,
      },
      {
        check: () => totalTickets === 0,
        message: 'No tickets requested',
      },
      {
        check: () => !this.#validTicketSelection(ticketTypeRequests),
        message: 'Adult ticket must be purchased',
      },
    ];

    for (const rule of rules) {
      if (rule.check()) {
        throw new InvalidPurchaseException(rule.message);
      }
    }
  }
}

// #validate(accountId, ticketTypeRequests) {
//     if (!Number.isInteger(accountId) || accountId <= 0) {
//       throw new InvalidPurchaseException('Invalid Account ID');
//     }

//     if (ticketTypeRequests.length === 0) {
//       throw new InvalidPurchaseException('No tickets requested');
//     }

//     if (ticketTypeRequests.some((req) => !(req instanceof TicketTypeRequest))) {
//       throw new InvalidPurchaseException('Invalid ticket request');
//     }

//     const totalTickets = this.#getTotalNoOfTickets(ticketTypeRequests);

//     if (totalTickets > MAX_TICKETS) {
//       throw new InvalidPurchaseException(
//         `Cannot purchase more than ${MAX_TICKETS} tickets`,
//       );
//     }

//     if (totalTickets === 0) {
//       throw new InvalidPurchaseException('No tickets requested');
//     }

//     if (!this.#validTicketSelection(ticketTypeRequests)) {
//       throw new InvalidPurchaseException('Adult ticket must be purchased');
//     }
//   }
