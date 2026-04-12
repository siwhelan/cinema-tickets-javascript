import { describe, expect, test } from 'vitest';
import TicketTypeRequest from '../../../src/pairtest/lib/TicketTypeRequest.js';

describe('TicketTypeRequest', () => {
  test('throws a TypeError if the type is not ADULT, CHILD, or INFANT', () => {
    expect(() => new TicketTypeRequest('BABY', 2)).toThrow(TypeError);
    expect(() => new TicketTypeRequest('FAMILY', 3)).toThrow(
      'type must be ADULT, CHILD, or INFANT',
    );
    expect(() => new TicketTypeRequest(12345, 2)).toThrow(TypeError);
  });

  test('throws a TypeError if the noOfTickets is not an integer', () => {
    expect(() => new TicketTypeRequest('ADULT', '5')).toThrow(TypeError);
  });

  test('getNoOfTickets returns the correct number of tickets', () => {
    const request = new TicketTypeRequest('ADULT', 2);
    expect(request.getNoOfTickets()).toBe(2);
  });

  test('getTicketType returns the correct type', () => {
    const request = new TicketTypeRequest('ADULT', 2);
    expect(request.getTicketType()).toBe('ADULT');
  });
});
