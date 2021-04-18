import { Country } from '../../../domain/data/Country';
import {
  Gram,
  PackagePhysicalCharacteristics,
} from '../../../domain/entity/PhysicalItem';
import countryIsoList from './data/CountryIsoCodes';
import priceGuide from './data/PriceGuide';

// TODO: POST PRICE COVERAGE. Check Royal Mail PDF Bottom, VAT and "add 2.5GBP to prices in the table"
type PriceTableSpecification = {
  rowsName: string;
  colsName: string;
  deliveryZoneNames: string[];
  weightIntervals: Gram[];
  // TODO: Type alias for currency
  currency: string;
};

export type ShipmentCostSpecification = {
  // TODO: should've been type Country: https://github.com/microsoft/TypeScript/issues/37448
  [countryIsoCode: string]: {
    postalServiceName: string;
    priceTableSpecification: PriceTableSpecification;
    // key: PriceTableSpecification.deliveryZoneNames
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
  currency: string;
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

function validateCountry(country: Country): void {
  if (!countryIsoList.includes(country)) {
    throw new Error(`No such country ${country}.`);
  }
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
  packages: PackagePhysicalCharacteristics[],
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
  packages: PackagePhysicalCharacteristics[],
): ShipmentCostQuote {
  validateCountry(originCountry);
  validateCountry(destinationCountry);
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

  const deliveryZone = determineDeliveryZone(deliveryZones, destinationCountry);

  if (!deliveryZone) {
    throw new Error(
      `Destination country ${originCountry} is not supported by ${postalServiceName}.`,
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
}

export type ShipmentCostQuoteFn = (
  originCountry: Country,
  destinationCountry: Country,
  packages: PackagePhysicalCharacteristics[],
) => ShipmentCostQuote;
