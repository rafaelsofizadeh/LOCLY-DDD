"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShipmentCostQuote = void 0;
const common_1 = require("@nestjs/common");
const error_handling_1 = require("../common/error-handling");
const PriceGuide_1 = require("./data/PriceGuide");
function getTableEntry(data, row, col) {
    return data[row][col];
}
function getNumericInterval(numericIntervals, point) {
    return numericIntervals.findIndex((upperBound) => point <= upperBound);
}
function determineDeliveryZone(deliveryZones, country) {
    let countryEntry;
    const determinedZone = Object.entries(deliveryZones).find(([name, zone]) => {
        if (Array.isArray(zone)) {
            if (typeof zone[0] === 'string') {
                return zone.includes(country);
            }
            if (typeof zone[0] === 'object') {
                countryEntry = zone.find(({ iso3 }) => iso3 === country);
                return Boolean(countryEntry);
            }
        }
        return false;
    });
    return [determinedZone, countryEntry];
}
function validateOriginCountry(originCountry) {
    if (!PriceGuide_1.priceGuide.hasOwnProperty(originCountry)) {
        throw `Origin country ${originCountry} is not supported by Locly.`;
    }
}
function validateWeight(weightIntervals, totalWeight) {
    const maxWeight = weightIntervals.slice(-1)[0];
    if (totalWeight > maxWeight) {
        throw `Weight ${totalWeight} exceeds max specified weight ${maxWeight}.`;
    }
    const weightIntervalIndex = getNumericInterval(weightIntervals, totalWeight);
    return weightIntervalIndex;
}
function getShipmentCostQuote(originCountry, destinationCountry, totalWeight) {
    try {
        validateOriginCountry(originCountry);
        if (originCountry === destinationCountry) {
            throw "Origin country can't be equal to destination country";
        }
        const { postalServiceName, priceTableSpecification: { weightIntervals, deliveryZoneNames, currency }, deliveryZones, deliveryServices, } = PriceGuide_1.priceGuide[originCountry];
        const weightIntervalIndex = validateWeight(weightIntervals, totalWeight);
        let deliveryZoneName, deliveryZone, countryEntry;
        try {
            [[deliveryZoneName, deliveryZone], countryEntry] = determineDeliveryZone(deliveryZones, destinationCountry);
        }
        catch (err) {
            throw `Destination country ${destinationCountry} is not supported by ${postalServiceName} postal service of ${originCountry}.`;
        }
        if (typeof countryEntry === 'object' &&
            totalWeight > countryEntry.maxWeight) {
            throw `Weight ${totalWeight} exceeds max specified weight ${countryEntry.maxWeight}.`;
        }
        const deliveryZoneTableIndex = deliveryZoneNames.indexOf(deliveryZoneName);
        const availableDeliveryServices = deliveryServices.filter(({ serviceAvailability }) => serviceAvailability.includes(destinationCountry) ||
            serviceAvailability.includes('all'));
        if (!availableDeliveryServices.length) {
            throw `Destination country ${destinationCountry} is not supported by ${postalServiceName} of ${originCountry}.`;
        }
        const services = availableDeliveryServices.map(service => {
            const { name, tracked, priceTable } = service;
            const price = getTableEntry(priceTable, weightIntervalIndex, deliveryZoneTableIndex);
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
            deliveryZone: deliveryZoneName,
            services,
        };
    }
    catch (message) {
        (0, error_handling_1.throwCustomException)(message, { originCountry, destinationCountry, totalWeight }, common_1.HttpStatus.SERVICE_UNAVAILABLE)();
    }
}
exports.getShipmentCostQuote = getShipmentCostQuote;
//# sourceMappingURL=getShipmentCostQuote.js.map