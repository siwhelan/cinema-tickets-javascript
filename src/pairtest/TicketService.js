import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import { TICKET_PRICES, TICKET_TYPES } from './config.js';
import TicketValidator from './TicketValidator.js';

/**
 * Handles ticket purchasing, delegating payment,
 * seat reservation and validation to injected dependencies.
 */
export default class TicketService {
  #paymentService;
  #reservationService;
  #validationService;

  constructor(
    paymentService = new TicketPaymentService(),
    reservationService = new SeatReservationService(),
    validationService = new TicketValidator(),
  ) {
    this.#paymentService = paymentService;
    this.#reservationService = reservationService;
    this.#validationService = validationService;
  }

  /**
   * As per the assumptions we know this will never fail.
   * In practice this would be async/await and wrapped in a try/catch
   * with appropriate logging and error handling, with the logger
   * injected as a separate dependency. It would also return a success response
   * and/or order summary.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validationService.validate(accountId, ...ticketTypeRequests);

    const totalCost = this.#calculateTotalCost(ticketTypeRequests);
    this.#paymentService.makePayment(accountId, totalCost);

    const totalSeats = this.#calculateNoOfSeats(ticketTypeRequests);
    this.#reservationService.reserveSeat(accountId, totalSeats);
  }

  #calculateTotalCost(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (sum, req) =>
        sum + TICKET_PRICES[req.getTicketType()] * req.getNoOfTickets(),
      0,
    );
  }

  #calculateNoOfSeats(ticketTypeRequests) {
    return ticketTypeRequests
      .filter((req) => req.getTicketType() !== TICKET_TYPES.INFANT)
      .reduce((sum, req) => sum + req.getNoOfTickets(), 0);
  }
}
