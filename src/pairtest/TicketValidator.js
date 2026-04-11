import { MAX_TICKETS, TICKET_TYPES } from './config.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketTypeRequest from './lib/TicketTypeRequest.js';

export default class TicketValidator {
  validate(accountId, ...ticketTypeRequests) {
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
        check: () =>
          this.#getTotalNoOfTickets(ticketTypeRequests) > MAX_TICKETS,
        message: `Cannot purchase more than ${MAX_TICKETS} tickets`,
      },
      {
        check: () =>
          ticketTypeRequests.some((req) => req.getNoOfTickets() <= 0),
        message: 'Ticket quantities must be greater than zero',
      },
      {
        check: () => !this.#adultRequirementMet(ticketTypeRequests),
        message: 'Adult ticket must be purchased',
      },
    ];

    for (const rule of rules) {
      if (rule.check()) {
        throw new InvalidPurchaseException(rule.message);
      }
    }
  }

  #getTotalNoOfTickets(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) => sum + req.getNoOfTickets(),
      0,
    );
  }

  #adultRequirementMet(ticketTypeRequests) {
    const types = ticketTypeRequests.map((req) => req.getTicketType());

    const adultCount = ticketTypeRequests
      .filter((req) => req.getTicketType() === TICKET_TYPES.ADULT)
      .reduce((sum, req) => sum + req.getNoOfTickets(), 0);

    const hasChildOrInfant =
      types.includes(TICKET_TYPES.CHILD) || types.includes(TICKET_TYPES.INFANT);

    return !hasChildOrInfant || adultCount > 0;
  }
}
