import {
  ShipmentCostCalculator,
  ShipmentCostRequest,
} from '../port/ShipmentCostCalculator';

export class ShipmentCostCalculatorService implements ShipmentCostCalculator {
  // TODO: Add implementation
  async getRate(costRequest: ShipmentCostRequest) {
    return { amount: 500, currency: 'USD' };
  }
}
