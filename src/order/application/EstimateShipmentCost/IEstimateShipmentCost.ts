import { IsInt, IsISO31661Alpha3, IsNumber, IsPositive } from 'class-validator';
import { Country } from '../../entity/Country';
import { Gram } from '../../entity/Item';

export class EstimateShipmentCostRequest {
  @IsISO31661Alpha3()
  originCountry: Country;

  @IsISO31661Alpha3()
  destinationCountry: Country;

  @IsInt()
  @IsPositive()
  @IsNumber()
  totalWeight: Gram;
}
