import { Country } from '../../order/entity/Country';
import { ShipmentCostSpecification } from '../getShipmentCostQuote';
export declare const priceGuide: ShipmentCostSpecification;
export declare const originCountriesAvailable: Country[];
export declare const getDestinationCountriesAvailable: (originCountry: Country) => any[];
