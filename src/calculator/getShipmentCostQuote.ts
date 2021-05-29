import { HttpStatus } from '@nestjs/common';
import { throwCustomException } from '../common/error-handling';
import { Country } from '../order/entity/Country';
import { Currency } from '../order/entity/Currency';
import { Gram, PhysicalItem } from '../order/entity/Item';
import { priceGuide } from './data/PriceGuide';

type PriceTableSpecification = {
  rowsName: string;
  colsName: string;
  deliveryZoneNames: string[];
  weightIntervals: Gram[];
  currency: Currency;
};

export type ShipmentCostSpecification = {
  // Should've been type Country: https://github.com/microsoft/TypeScript/issues/37448
  [countryIsoCode: string]: {
    postalServiceName: string;
    priceTableSpecification: PriceTableSpecification;
    deliveryZones: { [key: string]: Country[] };
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

function determineDeliveryZone(
  deliveryZones: { [key: string]: Country[] },
  country: Country,
) {
  return Object.keys(deliveryZones).find(zone =>
    deliveryZones[zone].includes(country),
  );
}

function validateOriginCountry(originCountry: Country): void {
  if (!priceGuide.hasOwnProperty(originCountry)) {
    throw new Error(
      `Origin country ${originCountry} is not supported by the calculator.`,
    );
  }
}

function validatePackageDimensions(
  weightIntervals: Gram[],
  packages: PhysicalItem[],
): Index {
  const totalWeight = packages
    .map(pkg => pkg.weight)
    .reduce((totalWeight, weight) => totalWeight + weight, 0);

  const maxWeight = weightIntervals.slice(-1)[0];

  if (totalWeight > maxWeight) {
    throw new Error(
      `Weight ${totalWeight} exceeds max specified weight ${maxWeight}.`,
    );
  }

  const weightIntervalIndex = getNumericInterval(weightIntervals, totalWeight);

  return weightIntervalIndex;
}

export function getShipmentCostQuote(
  originCountry: Country,
  destinationCountry: Country,
  packages: PhysicalItem[],
): ShipmentCostQuote {
  try {
    validateOriginCountry(originCountry);

    const {
      postalServiceName,
      priceTableSpecification: { weightIntervals, deliveryZoneNames, currency },
      deliveryZones,
      deliveryServices,
    } = priceGuide[originCountry];

    const weightIntervalIndex: Index = validatePackageDimensions(
      weightIntervals,
      packages,
    );

    const deliveryZone = determineDeliveryZone(
      deliveryZones,
      destinationCountry,
    );

    if (!deliveryZone) {
      throw new Error(
        `Destination country ${destinationCountry} is not supported by ${postalServiceName} of ${originCountry}.`,
      );
    }

    const deliveryZoneTableIndex = deliveryZoneNames.indexOf(deliveryZone);

    const availableDeliveryServices = deliveryServices.filter(
      ({ serviceAvailability }) =>
        serviceAvailability.includes(destinationCountry) ||
        serviceAvailability.includes('all'),
    );

    if (!availableDeliveryServices.length) {
      throw new Error(
        `Destination country ${destinationCountry} is not supported by ${postalServiceName}.`,
      );
    }

    const services = availableDeliveryServices.map(service => {
      const { name, tracked, priceTable } = service;

      const price = getTableEntry(
        priceTable,
        weightIntervalIndex,
        deliveryZoneTableIndex,
      );

      if (isNaN(price)) {
        throw new Error('Unexpected error occurred');
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
  } catch (error) {
    throwCustomException(
      error.message,
      { originCountry, destinationCountry, packages },
      HttpStatus.SERVICE_UNAVAILABLE,
    )(error);
  }
}

export type ShipmentCostQuoteFn = (
  originCountry: Country,
  destinationCountry: Country,
  packages: Array<{ weight: Gram }>,
) => ShipmentCostQuote;
