jest.mock('../src/integrations/telegram/telegramBot', () => ({
    launch: jest.fn(),
  }));
  