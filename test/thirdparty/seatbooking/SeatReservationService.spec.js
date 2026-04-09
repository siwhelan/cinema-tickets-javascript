import SeatReservationService from '../../../src/thirdparty/seatbooking/SeatReservationService.js';

describe('SeatReservationService', () => {
  let service;

  beforeEach(() => {
    service = new SeatReservationService();
  });

  describe('reserveSeat', () => {
    test('should return a TypeError if the accountId is not an integer', () => {
      expect(() => service.reserveSeat('12345', 2)).toThrow(TypeError);
      expect(() => service.reserveSeat(true, 2)).toThrow(
        'accountId must be an integer',
      );
    });

    test('should return a TypeError if the totalSeatsToAllocate is not an integer', () => {
      expect(() => service.reserveSeat(12345, true)).toThrow(TypeError);
      expect(() => service.reserveSeat(12345, '5')).toThrow(
        'totalSeatsToAllocate must be an integer',
      );
    });
  });
});
