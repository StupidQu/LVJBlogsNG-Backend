import TencentSDKSES from 'tencentcloud-sdk-nodejs-ses';
import * as Config from '../model/config.js';
import OpLogModel from '../model/oplog.js';

/**
 * Send a mail by Tencent Cloud.
 * @param {string} to The email address to send to.
 * @param {string} subject 
 * @param {number} templateId 
 * @param {any} params 
 */
export default async function SendMail(to, subject, templateId, params) {
    const client = new TencentSDKSES.ses.v20201002.Client({
        credential: {
            secretId: Config.get('tencentKeyId'),
            secretKey: Config.get('tencentSecretKey'),
        },
        region: 'ap-hongkong',
    });
    const { MessageId, RequestId } = await client.SendEmail({
        FromEmailAddress: Config.get('emailSender'),
        Destination: [to],
        Subject: subject,
        Template: {
            TemplateID: templateId,
            TemplateData: JSON.stringify(params),
        },
    });
    await OpLogModel.add('sendMail', 'system', '127.0.0.1', JSON.stringify({
        MessageId,
        RequestId,
        to,
        subject,
        templateId,
        params,
    }));
    return true;
}
