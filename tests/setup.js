jest.mock('../src/integrations/telegram/telegramBot', () => ({
    launch: jest.fn(),
  }));

jest.mock('../websocket', () => ({
  init: jest.fn(),
  getIO: () => ({ emit: jest.fn() }),
}));
