export type CamelCase<T> = T extends `${infer A}_${infer B}`
  ? `${A}${Capitalize<CamelCase<B>>}`
  : T;

export type StorageType = 'appearance_mode' | 'linking_social_connector';

export const getStorageKey = <T extends StorageType>(forType: T) =>
  `logto:admin_console:${forType}` as const;

export const storageKeys = Object.freeze({
  appearanceMode: getStorageKey('appearance_mode'),
  linkingSocialConnector: getStorageKey('linking_social_connector'),
} satisfies Record<CamelCase<StorageType>, string>);
