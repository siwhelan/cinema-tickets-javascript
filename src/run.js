import TicketTypeRequest from './pairtest/lib/TicketTypeRequest.js';
import TicketService from './pairtest/TicketService.js';

const service = new TicketService();

try {
  service.purchaseTickets(
    12345,
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 1),
    new TicketTypeRequest('INFANT', 1),
  );
  console.log('Tickets purchased successfully');
} catch (e) {
  console.error(e.message);
}
