import { Country } from '../../entity/Country';
import { Gram } from '../../entity/Item';
export declare class EstimateShipmentCostRequest {
    originCountry: Country;
    destinationCountry: Country;
    totalWeight: Gram;
}
