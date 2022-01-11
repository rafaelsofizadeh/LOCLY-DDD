import { Injectable } from '@nestjs/common';
import { Email } from '../../common/domain';
import { IEmailService } from '../email/IEmailService';
import {
  INotificationService,
  NotificationType,
  TemplateArgs,
  Templates,
} from './INotificationService';

@Injectable()
// TODO: Add notifications to all actions
export class ConsoleNotificationService implements INotificationService {
  constructor() {}

  templates: Templates = {
    [NotificationType.Auth]: ({ domain, token }) => `${domain}/auth/${token}`,
    [NotificationType.CustomerConfirmedOrder]: ({ order }) => 'a',
    [NotificationType.HostReceivedItem]: ({ order, receivedItemId }) => 'a',
    [NotificationType.HostUploadedItemPhoto]: ({ order, receivedItemId }) =>
      'a',
    [NotificationType.HostSubmittedShipmentInfo]: ({ order }) => 'a',
    [NotificationType.CustomerPaidShipment]: ({ order }) => 'a',
  };

  async notify(
    recipient: Email,
    notificationType: NotificationType,
    templateArgs: typeof notificationType extends NotificationType.Auth
      ? TemplateArgs<NotificationType.Auth>
      : typeof notificationType extends NotificationType.CustomerConfirmedOrder
      ? TemplateArgs<NotificationType.CustomerConfirmedOrder>
      : typeof notificationType extends NotificationType.HostReceivedItem
      ? TemplateArgs<NotificationType.HostReceivedItem>
      : typeof notificationType extends NotificationType.HostUploadedItemPhoto
      ? TemplateArgs<NotificationType.HostUploadedItemPhoto>
      : typeof notificationType extends NotificationType.HostSubmittedShipmentInfo
      ? TemplateArgs<NotificationType.HostSubmittedShipmentInfo>
      : typeof notificationType extends NotificationType.CustomerPaidShipment
      ? TemplateArgs<NotificationType.CustomerPaidShipment>
      : never,
  ): Promise<void> {
    const content = this.templates[notificationType](templateArgs);
    console.log(content);
  }
}
