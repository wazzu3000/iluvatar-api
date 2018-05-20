import * as nodemailer from 'nodemailer';
import { Config, EmailModel } from '@wazzu/iluvatar-core';
import { create } from 'domain';

export class EmailService {

    private emailConfig: EmailModel;

    private constructor(private receivers: string[], private subject: string, private body: string) {
        this.emailConfig = Config.getInstance().getConfig('email') as EmailModel;
    }

    public static send(receivers: string[], subject: string, body: string): Promise<void> {
        return (new EmailService(receivers, subject, body).startService());
    }

    private startService(): Promise<void> {
        if (!this.emailConfig.debug) {
            let self = this;
            return this.useDefaultAccount().then(() => {
                return self.sendEmails()
            });
        }
        return this.sendEmails();
    }

    private useDefaultAccount(): Promise<void> {
        console.warn('You\'re using a test account of email, please use your company email');
        let emailConfig = this.emailConfig;
        return new Promise<void>((resolve, reject) => {
            nodemailer.createTestAccount((err, testAccount) => {
                if (err) {
                    reject(err);
                }
                emailConfig.host = 'smtp.ethereal.email';
                emailConfig.port = 587;
                emailConfig.secureProtocol = '';
                emailConfig.user = testAccount.user;
                emailConfig.password = testAccount.pass;
                resolve();
            });
        });
    }

    private sendEmails(): Promise<void> {
        let emailConfig = this.emailConfig;
        let receivers = this.receivers;
        let subject = this.subject;
        let body = this.body
        let transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secureProtocol ? true : false,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.password
            }
        });

        return transporter.sendMail({
            from: emailConfig.user,
            to: receivers,
            subject: subject,
            html: body
        })
    }
}