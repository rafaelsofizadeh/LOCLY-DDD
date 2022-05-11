import { Email } from '../../common/domain';
import { INotificationService, NotificationType, TemplateArgs, Templates } from './INotificationService';
export declare class ConsoleNotificationService implements INotificationService {
    constructor();
    templates: Templates;
    notify(recipient: Email, notificationType: NotificationType, templateArgs: typeof notificationType extends NotificationType.Auth ? TemplateArgs<NotificationType.Auth> : typeof notificationType extends NotificationType.CustomerConfirmedOrder ? TemplateArgs<NotificationType.CustomerConfirmedOrder> : typeof notificationType extends NotificationType.HostReceivedItem ? TemplateArgs<NotificationType.HostReceivedItem> : typeof notificationType extends NotificationType.HostUploadedItemPhoto ? TemplateArgs<NotificationType.HostUploadedItemPhoto> : typeof notificationType extends NotificationType.HostSubmittedShipmentInfo ? TemplateArgs<NotificationType.HostSubmittedShipmentInfo> : typeof notificationType extends NotificationType.CustomerPaidShipment ? TemplateArgs<NotificationType.CustomerPaidShipment> : never): Promise<void>;
}
