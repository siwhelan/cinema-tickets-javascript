import TicketPaymentService from '../../../src/thirdparty/paymentgateway/TicketPaymentService.js';

describe('TicketPaymentService', () => {
  let service;

  beforeEach(() => {
    service = new TicketPaymentService();
  });

  describe('makePayment', () => {
    test('should return a TypeError if the accountId is not an integer', () => {
      expect(() => service.makePayment('12345', 2)).toThrow(TypeError);
      expect(() => service.makePayment(true, 2)).toThrow(
        'accountId must be an integer',
      );
    });

    test('should return a TypeError if the totalAmountToPay is not an integer', () => {
      expect(() => service.makePayment(12345, true)).toThrow(TypeError);
      expect(() => service.makePayment(12345, '5')).toThrow(
        'totalAmountToPay must be an integer',
      );
    });
  });
});
