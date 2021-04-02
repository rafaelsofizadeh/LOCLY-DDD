import { Country } from '../../domain/data/Country';

// TODO: Service availability based on PriceGuide
export const originCountriesAvailable: Country[] = ['GBR'];
export const destinationCountriesAvailable: Country[] = ['AZE', 'ITA', 'CAN'];

export function checkServiceAvailability(
  originCountry: Country,
  destinationCountry: Country,
): boolean {
  return (
    originCountriesAvailable.includes(originCountry) &&
    destinationCountriesAvailable.includes(destinationCountry)
  );
}

export type ServiceAvailabilityFn = (
  originCountry: Country,
  destinationCountry: Country,
) => boolean;
