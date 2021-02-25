import { Country } from '../../domain/data/Country';
import { PhysicalCharacteristics } from '../../domain/entity/Item';
import { ShipmentCost } from '../../domain/entity/Order';

export type ShipmentCostRequest = {
  originCountry: Country;
  destinationCountry: Country;
  packages: Array<PhysicalCharacteristics>;
};

export abstract class ShipmentCostCalculator {
  // TODO(NOW): Interface method signature as VAGUE as possible or as SPECIFIC as possible
  // https://softwareengineering.stackexchange.com/a/402253/378209
  abstract getRate(costRequest: ShipmentCostRequest): Promise<ShipmentCost>;
}
