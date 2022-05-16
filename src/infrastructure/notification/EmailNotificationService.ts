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
export class EmailNotificationService implements INotificationService {
  constructor(private readonly emailService: IEmailService) {}

  templates: Templates = {
    [NotificationType.Auth]: ({ domain, token }) =>
      `<a href="${domain}/auth/${token}">Vercel log-in</a><br/><a href="https://locly.netlify.app/auth/${token}">Netlify log-in</a>`,
    [NotificationType.CustomerConfirmedOrder]: ({ order }) => 'a',
    [NotificationType.HostReceivedItem]: ({ order, receivedItemId }) => 'a',
    [NotificationType.HostUploadedItemPhoto]: ({ order, receivedItemId }) =>
      'a',
    [NotificationType.HostSubmittedShipmentInfo]: ({ order }) => 'a',
    [NotificationType.CustomerPaidShipment]: ({ order }) => 'a',
  };

  subjects: Record<NotificationType, string> = {
    [NotificationType.Auth]: 'Your Locly log-in link',
    [NotificationType.CustomerConfirmedOrder]:
      'You have created and confirmed a new order',
    [NotificationType.HostReceivedItem]:
      'Your host has received an item from your order',
    [NotificationType.HostUploadedItemPhoto]:
      'Your host has uploaded a photo for an item from your order',
    [NotificationType.HostSubmittedShipmentInfo]:
      "Your host submitted your order's shipment info",
    [NotificationType.CustomerPaidShipment]: 'Your order payment receipt',
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
    // Property access creates an intersection type instead of union:
    // https://github.com/microsoft/TypeScript/issues/31694
    // https://stackoverflow.com/questions/57389826/typescript-union-of-type-is-resolved-as-intersection-of-types
    const html = this.templates[notificationType](templateArgs);
    const subject = this.subjects[notificationType];

    this.emailService.sendEmail({
      to: recipient,
      subject,
      html,
    });
  }
}
