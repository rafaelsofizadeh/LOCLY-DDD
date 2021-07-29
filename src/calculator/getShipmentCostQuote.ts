import { HttpStatus } from '@nestjs/common';
import { throwCustomException } from '../common/error-handling';
import { Country } from '../order/entity/Country';
import { Currency } from '../order/entity/Currency';
import { Gram, PhysicalItem } from '../order/entity/Item';
import { priceGuide } from './data/PriceGuide';

type PriceTableSpecification = {
  deliveryZoneNames: string[];
  weightIntervals: Gram[];
  currency: Currency;
};

type CountryWeight = { iso3: Country; maxWeight: Gram };
type DeliveryZone = Country[] | CountryWeight[];

export type ShipmentCostSpecification = {
  // Should've been type Country: https://github.com/microsoft/TypeScript/issues/37448
  [countryIsoCode: string]: {
    postalServiceName: string;
    priceTableSpecification: PriceTableSpecification;
    deliveryZones: { [key: string]: DeliveryZone };
    deliveryServices: Array<{
      id: string;
      name: string;
      tracked: boolean;
      serviceAvailability: Array<Country | 'all'>;
      priceTable: number[][];
    }>;
  };
};

export type ShipmentCostQuote = {
  postalServiceName: string;
  currency: Currency;
  services: { name: string; tracked: boolean; price: number }[];
};

type Index = number;

function getTableEntry<T extends any[][]>(
  data: T,
  row: Index,
  col: Index,
): T extends (infer U)[][] ? U : never {
  return data[row][col];
}

// numericIntervals: [0.1, 0.25, 0.5, 1, 1.25. 1.5, 2]
// point: 0.75
// result: 3
function getNumericInterval(numericIntervals: number[], point: number): Index {
  return numericIntervals.findIndex(
    (upperBound: number) => point <= upperBound,
  );
}

// TODO: Overload by DeliveryZone subtype
function determineDeliveryZone(
  deliveryZones: {
    [key: string]: DeliveryZone;
  },
  country: Country,
): [[string, DeliveryZone], Country | CountryWeight] {
  let countryEntry: Country | CountryWeight;

  const determinedZone = Object.entries(deliveryZones).find(([name, zone]) => {
    if (Array.isArray(zone)) {
      if (typeof zone[0] === 'string') {
        return (zone as Country[]).includes(country);
      }

      if (typeof zone[0] === 'object') {
        countryEntry = (zone as Array<{
          iso3: Country;
          maxWeight: Gram;
        }>).find(({ iso3 }) => iso3 === country);

        return Boolean(countryEntry);
      }
    }

    return false;
  });

  return [determinedZone, countryEntry];
}

function validateOriginCountry(originCountry: Country): void {
  if (!priceGuide.hasOwnProperty(originCountry)) {
    throw `Origin country ${originCountry} is not supported by Locly.`;
  }
}

function validateWeight(weightIntervals: Gram[], totalWeight: Gram): Index {
  const maxWeight = weightIntervals.slice(-1)[0];

  if (totalWeight > maxWeight) {
    throw `Weight ${totalWeight} exceeds max specified weight ${maxWeight}.`;
  }

  const weightIntervalIndex = getNumericInterval(weightIntervals, totalWeight);

  return weightIntervalIndex;
}

// TODO: weight or measurement-based results
export function getShipmentCostQuote(
  originCountry: Country,
  destinationCountry: Country,
  totalWeight: Gram,
): ShipmentCostQuote {
  try {
    validateOriginCountry(originCountry);

    if (originCountry === destinationCountry) {
      throw "Origin country can't be equal to destination country";
    }

    const {
      postalServiceName,
      priceTableSpecification: { weightIntervals, deliveryZoneNames, currency },
      deliveryZones,
      deliveryServices,
    } = priceGuide[originCountry];

    const weightIntervalIndex: Index = validateWeight(
      weightIntervals,
      totalWeight,
    );

    const [
      [deliveryZoneName, deliveryZone],
      countryEntry,
    ] = determineDeliveryZone(deliveryZones, destinationCountry);

    if (!deliveryZone) {
      throw `Destination country ${destinationCountry} is not supported by ${postalServiceName} postal service of ${originCountry}.`;
    }

    if (
      typeof countryEntry === 'object' &&
      totalWeight > countryEntry.maxWeight
    ) {
      throw `Weight ${totalWeight} exceeds max specified weight ${countryEntry.maxWeight}.`;
    }

    const deliveryZoneTableIndex = deliveryZoneNames.indexOf(deliveryZoneName);

    const availableDeliveryServices = deliveryServices.filter(
      ({ serviceAvailability }) =>
        serviceAvailability.includes(destinationCountry) ||
        serviceAvailability.includes('all'),
    );

    if (!availableDeliveryServices.length) {
      throw `Destination country ${destinationCountry} is not supported by ${postalServiceName} of ${originCountry}.`;
    }

    const services = availableDeliveryServices.map(service => {
      const { name, tracked, priceTable } = service;

      const price = getTableEntry(
        priceTable,
        weightIntervalIndex,
        deliveryZoneTableIndex,
      );

      if (isNaN(price)) {
        throw 'Unexpected error occurred';
      }

      return {
        name,
        tracked,
        price: Math.round((price + Number.EPSILON) * 100) / 100,
      };
    });

    return {
      postalServiceName,
      currency,
      services,
    };
  } catch (message) {
    throwCustomException(
      message,
      { originCountry, destinationCountry, totalWeight },
      HttpStatus.SERVICE_UNAVAILABLE,
    )();
  }
}

export type ShipmentCostQuoteFn = (
  originCountry: Country,
  destinationCountry: Country,
  totalWeight: Gram,
) => ShipmentCostQuote;
