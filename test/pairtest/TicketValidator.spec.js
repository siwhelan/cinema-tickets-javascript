import { beforeEach, describe, expect, test } from 'vitest';
import { MAX_TICKETS } from '../../src/pairtest/config.js';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest.js';
import TicketValidator from '../../src/pairtest/TicketValidator';

const makeRequest = (type, count) => new TicketTypeRequest(type, count);

describe('TicketValidator', () => {
  let validator;
  const accountId = 12345;

  beforeEach(() => {
    validator = new TicketValidator();
  });

  test('should throw InvalidPurchaseException if accountId is not valid', () => {
    expect(() => validator.validate(null, makeRequest('ADULT', 2))).toThrow(
      InvalidPurchaseException,
    );

    expect(() => validator.validate(0, makeRequest('ADULT', 2))).toThrow(
      InvalidPurchaseException,
    );

    expect(() => validator.validate(-1, makeRequest('ADULT', 2))).toThrow(
      InvalidPurchaseException,
    );

    expect(() => validator.validate(null, makeRequest('ADULT', 2))).toThrow(
      'Invalid Account ID',
    );
  });

  test('should throw InvalidPurchaseException if the ticketTypeRequest is not an instance of TicketTypeRequest', () => {
    const fakeRequest = {
      getTicketType: () => 'ADULT',
      getNoOfTickets: () => 1,
    };

    expect(() => validator.validate(accountId, fakeRequest)).toThrow(
      InvalidPurchaseException,
    );
  });

  test('should throw InvalidPurchaseException if no tickets are requested', () => {
    expect(() => validator.validate(accountId)).toThrow(
      InvalidPurchaseException,
    );

    expect(() =>
      validator.validate(accountId, makeRequest('ADULT', 0)),
    ).toThrow(InvalidPurchaseException);
  });

  test('should throw InvalidPurchaseException if a negative number of tickets is requested', () => {
    expect(() =>
      validator.validate(accountId, makeRequest('ADULT', -1)),
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      validator.validate(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('CHILD', -1),
      ),
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      validator.validate(
        accountId,
        makeRequest('ADULT', 2),
        makeRequest('INFANT', -1),
      ),
    ).toThrow('Ticket quantities must be greater than zero');
  });

  test(`should throw InvalidPurchaseException if more than ${MAX_TICKETS} tickets are requested`, () => {
    expect(() =>
      validator.validate(accountId, makeRequest('ADULT', MAX_TICKETS + 1)),
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      validator.validate(
        accountId,
        makeRequest('ADULT', MAX_TICKETS),
        makeRequest('CHILD', 1),
      ),
    ).toThrow('Cannot purchase more than 25 tickets');

    expect(() =>
      validator.validate(accountId, makeRequest('ADULT', MAX_TICKETS)),
    ).not.toThrow();
  });

  test('should throw InvalidPurchaseException if a child or infant ticket is purchased without an adult', () => {
    expect(() =>
      validator.validate(
        accountId,
        makeRequest('ADULT', 0),
        makeRequest('CHILD', 2),
      ),
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      validator.validate(accountId, makeRequest('CHILD', 2)),
    ).toThrow(InvalidPurchaseException);

    expect(() =>
      validator.validate(accountId, makeRequest('INFANT', 2)),
    ).toThrow('Adult ticket must be purchased');

    expect(() =>
      validator.validate(
        accountId,
        makeRequest('CHILD', 2),
        makeRequest('ADULT', 1),
      ),
    ).not.toThrow();
  });

  test('should not throw if only adult tickets are purchased', () => {
    expect(() =>
      validator.validate(accountId, makeRequest('ADULT', 1)),
    ).not.toThrow();
  });
});
