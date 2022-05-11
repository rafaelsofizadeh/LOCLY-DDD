import { Country } from '../order/entity/Country';
import { Currency } from '../order/entity/Currency';
import { Gram } from '../order/entity/Item';
declare type PriceTableSpecification = {
    deliveryZoneNames: string[];
    weightIntervals: Gram[];
    currency: Currency;
};
declare type CountryWeight = {
    iso3: Country;
    maxWeight: Gram;
};
declare type DeliveryZone = Country[] | CountryWeight[];
export declare type ShipmentCostSpecification = {
    [countryIsoCode: string]: {
        postalServiceName: string;
        priceTableSpecification: PriceTableSpecification;
        deliveryZones: {
            [key: string]: DeliveryZone;
        };
        deliveryServices: Array<{
            name: string;
            tracked: boolean;
            serviceAvailability: Array<Country | 'all'>;
            priceTable: number[][];
        }>;
    };
};
export declare type ShipmentCostQuote = {
    postalServiceName: string;
    currency: Currency;
    deliveryZone: string;
    services: Array<{
        name: string;
        tracked: boolean;
        price: number;
    }>;
};
export declare function getShipmentCostQuote(originCountry: Country, destinationCountry: Country, totalWeight: Gram): ShipmentCostQuote;
export declare type ShipmentCostQuoteFn = (originCountry: Country, destinationCountry: Country, totalWeight: Gram) => ShipmentCostQuote;
export {};
