import { TICKET_PRICES } from './pairtest/config.js';
import TicketTypeRequest from './pairtest/lib/TicketTypeRequest.js';
import TicketService from './pairtest/TicketService.js';

/**
 * Demo purposes only.
 * Recalculates totals for output as TicketService intentionally
 * encapsulates payment and reservation details internally.
 */

const service = new TicketService();

const requests = [
  new TicketTypeRequest('ADULT', 2),
  new TicketTypeRequest('CHILD', 2),
  new TicketTypeRequest('INFANT', 1),
];

try {
  service.purchaseTickets(98765, ...requests);

  console.log('Order Summary:');
  requests.forEach((req) => {
    const type = req.getTicketType();
    const count = req.getNoOfTickets();
    const cost = TICKET_PRICES[type] * count;
    console.log(`  ${type}: ${count} x £${TICKET_PRICES[type]} = £${cost}`);
  });

  const total = requests.reduce(
    (sum, req) =>
      sum + TICKET_PRICES[req.getTicketType()] * req.getNoOfTickets(),
    0,
  );
  console.log(`Total: £${total}`);
} catch (e) {
  console.error(e.message);
}
