import type { User } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { parsePhoneNumberWithError } from 'libphonenumber-js/min';

import type { UserDetailsForm } from './types';

export const userDetailsParser = {
  toLocalForm: (data: User): UserDetailsForm => {
    const { primaryEmail, primaryPhone, username, name, avatar, customData } = data;
    const parsedPhoneNumber = trySafe(() =>
      conditional(
        primaryPhone && parsePhoneNumberWithError(`+${primaryPhone}`).formatInternational()
      )
    );

    return {
      primaryEmail: primaryEmail ?? '',
      primaryPhone: parsedPhoneNumber ?? primaryPhone ?? '',
      username: username ?? '',
      name: name ?? '',
      avatar: avatar ?? '',
      customData: JSON.stringify(customData, null, 2),
    };
  },
};
