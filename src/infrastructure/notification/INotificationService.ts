import { UUID } from '../../common/domain';
import {
  ConfirmedOrder,
  FinalizedOrder,
  PaidOrder,
} from '../../order/entity/Order';

export enum NotificationType {
  Auth = 'auth',
  CustomerConfirmedOrder = 'customer_confirmed_order',
  HostReceivedItem = 'host_received_item',
  HostUploadedItemPhoto = 'host_uploaded_item_photo',
  HostSubmittedShipmentInfo = 'host_submitted_shipment_info',
  CustomerPaidShipment = 'customer_paid_shipment',
}

// https://stackoverflow.com/a/54312128/6539857
export type Templates = {
  [NotificationType.Auth]: (args: { domain: string; token: string }) => string;
  [NotificationType.CustomerConfirmedOrder]: (args: {
    order: ConfirmedOrder;
  }) => string;
  [NotificationType.HostReceivedItem]: (args: {
    order: ConfirmedOrder;
    receivedItemId: UUID;
  }) => string;
  [NotificationType.HostUploadedItemPhoto]: (args: {
    order: ConfirmedOrder;
    receivedItemId: UUID;
  }) => string;
  [NotificationType.HostSubmittedShipmentInfo]: (args: {
    order: FinalizedOrder;
  }) => string;
  [NotificationType.CustomerPaidShipment]: (args: {
    order: PaidOrder;
  }) => string;
};

export type TemplateArgs<NT extends NotificationType> = Parameters<
  Templates[NT]
>[0];

export interface INotificationService {
  templates: Templates;

  notify<NT extends NotificationType>(
    recipient: string,
    notificationType: NT,
    templateArgs: TemplateArgs<NT>,
  ): Promise<void>;
}

export abstract class INotificationService {}
