import { Address } from 'cluster';
import { Dimensions } from '../../domain/entity/Item';
import { ShipmentCost } from '../../domain/entity/Order';

export type ShipmentCostRequest = {
  originCountry: string;
  destinationCountry: string;
  packages: Array<{ weight: number; dimensions: Dimensions }>;
};

export interface ShipmentCostCalculatorPort {
  getRate(request: ShipmentCostRequest): Promise<ShipmentCost>;
}
