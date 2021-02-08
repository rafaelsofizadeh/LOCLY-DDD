import { Order } from '../../domain/entity/Order';
import {
  ShipmentCostCalculator,
  ShipmentCostRequest,
} from '../port/ShipmentCostCalculator';

export class CalculateShipmentCost implements ShipmentCostCalculator {
  async getRate(costRequest: ShipmentCostRequest) {
    return { amount: 500, currency: 'USD' };
  }
}
