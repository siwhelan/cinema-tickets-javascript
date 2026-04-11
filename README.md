# Cinema Tickets

A JavaScript implementation of the DWP's "Cinema Tickets" coding exercise.

## Requirements

- Node.js >= 20.9.0

## Installation

```bash
npm install
```

## Usage

### Run the demo

```bash
node src/demo.js
```
The requests in `demo.js` and prices in `config.js` can be adjusted to observe different calculations and validation error messages.

### Run tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run linter

```bash
npm run lint
```

## Technical Decisions

### Vitest over Jest

Jest was the initial choice given its presence on the DWP tech radar. As the test suite grew to require mocking, Jest's ESM limitations became a concern. ESM support requires the `--experimental-vm-modules` flag, and ESM mocking relies on `jest.unstable_mockModule`, an API explicitly marked as a work in progress. Vitest was chosen as a replacement given its identical API, native ESM support, and stable mocking via `vi.mock`, with mocks cleared before each test runs to avoid mutation risks. 

### Dependency Injection

`TicketService` uses constructor injection for its third-party dependencies. Default values mean existing usage is unaffected, whilst allowing mock instances to be passed in tests without module-level mocking. DI is introduced via the constructor rather than `purchaseTickets` to respect the constraint of not altering the public interface.

### Centralised Configuration

Business rule constants (`TICKET_PRICES`, `TICKET_TYPES`, `MAX_TICKETS`) are defined in `config.js` and exported as frozen objects. This provides a single source of truth for values referenced in both `TicketService` and the test suite — if prices or limits change, tests will continue to pass without modification as assertions are derived from the same constants.

### Validation Rules Pattern

Rather than a series of sequential `if` statements, validation is implemented as an array of rule objects, each with a `check` function and an associated error message. The rules are iterated and the first failing check throws an `InvalidPurchaseException`. This approach is declarative, easy to extend, and follows a pattern similar to schema validation libraries such as Zod, without the overhead of additional packages.

### Private Methods

All methods other than `purchaseTickets` are private (`#`), following the intent of the original stub. This enforces a clear public interface and ensures implementation details are encapsulated within the class.

### Object.freeze

Constants are frozen with `Object.freeze` to prevent accidental mutation at runtime, consistent with the immutability theme established by `TicketTypeRequest`.