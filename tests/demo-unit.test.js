const DemoDataService = require('../src/services/demoData.service');

describe('Demo Data Service Unit Tests', () => {
  it('should return demo credentials', () => {
    const credentials = DemoDataService.getDemoCredentials();
    
    expect(credentials.username).toBe('demo_admin');
    expect(credentials.password).toBe('demo123');
    expect(credentials.pin).toBe('999999');
  });

  it('should return demo instructions for all sections', () => {
    const instructions = DemoDataService.getDemoInstructions();
    
    expect(instructions.welcome).toBeDefined();
    expect(instructions.welcome.title).toBe("Welcome to Demo Mode! 🎉");
    expect(instructions.orders).toBeDefined();
    expect(instructions.inventory).toBeDefined();
    expect(instructions.menu).toBeDefined();
    expect(instructions.analytics).toBeDefined();
  });

  it('should return specific section instructions', () => {
    const instructions = DemoDataService.getDemoInstructions();
    const ordersInstructions = instructions.orders;
    
    expect(ordersInstructions.title).toBe("Managing Orders 📋");
    expect(ordersInstructions.tips).toBeDefined();
    expect(ordersInstructions.tips.length).toBeGreaterThan(0);
  });

  it('should have complete instruction sets for each section', () => {
    const instructions = DemoDataService.getDemoInstructions();
    const sections = ['welcome', 'orders', 'inventory', 'menu', 'analytics'];
    
    sections.forEach(section => {
      expect(instructions[section]).toBeDefined();
      expect(instructions[section].title).toBeDefined();
      expect(instructions[section].message).toBeDefined();
    });
  });
});