import {
  ConnectorError,
  ConnectorErrorCodes,
  SendMessageFunction,
  LogtoConnector,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { defaultMetadata, endpoint } from './constant';
import {
  sendGridMailConfigGuard,
  SendGridMailConfig,
  EmailData,
  Personalization,
  Content,
  PublicParameters,
} from './types';

export { defaultMetadata } from './constant';

export default class SendGridMailConnector extends LogtoConnector<SendGridMailConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<SendGridMailConfig> = (config: unknown) => {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  // eslint-disable-next-line complexity
  public sendMessage: SendMessageFunction = async ({ to, type, payload }, inputConfig) => {
    const config = inputConfig ?? (await this.getConfig(this.metadata.id));
    assert(config, new ConnectorError(ConnectorErrorCodes.InvalidConfig));

    this.validateConfig(config);

    const { apiKey, fromEmail, fromName, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const toEmailData: EmailData[] = [{ email: to }];
    const fromEmailData: EmailData = fromName
      ? { email: fromEmail, name: fromName }
      : { email: fromEmail };
    const personalizations: Personalization = { to: toEmailData };
    const content: Content = {
      type: template.type,
      value:
        typeof payload.code === 'string'
          ? template.content.replace(/{{code}}/g, payload.code)
          : template.content,
    };
    const { subject } = template;

    const parameters: PublicParameters = {
      personalizations: [personalizations],
      from: fromEmailData,
      subject,
      content: [content],
    };

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        json: parameters,
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse)
        );

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };
}
