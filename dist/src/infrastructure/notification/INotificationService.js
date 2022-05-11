"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INotificationService = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["Auth"] = "auth";
    NotificationType["CustomerConfirmedOrder"] = "customer_confirmed_order";
    NotificationType["HostReceivedItem"] = "host_received_item";
    NotificationType["HostUploadedItemPhoto"] = "host_uploaded_item_photo";
    NotificationType["HostSubmittedShipmentInfo"] = "host_submitted_shipment_info";
    NotificationType["CustomerPaidShipment"] = "customer_paid_shipment";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
class INotificationService {
}
exports.INotificationService = INotificationService;
//# sourceMappingURL=INotificationService.js.map