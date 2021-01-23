import { PhysicalCharacteristics } from '../../domain/entity/Item';
import { ShipmentCost } from '../../domain/entity/Order';

export type ShipmentCostRequest = {
  originCountry: string;
  destinationCountry: string;
  packages: Array<PhysicalCharacteristics>;
};

export interface ShipmentCostCalculatorPort {
  getRate(request: ShipmentCostRequest): Promise<ShipmentCost>;
}
