import { EmailData, IEmailService } from './IEmailService';
export declare class EtherealPseudoEmailService implements IEmailService {
    private readonly nodemailerTransportConfig;
    private readonly transporter;
    constructor();
    sendEmail(options: EmailData): Promise<void>;
}
