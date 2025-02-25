import type { AdminConsoleKey } from '@logto/phrases';
import type { User } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Eye from '@/assets/images/eye.svg';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  password: string;
  title: AdminConsoleKey;
  onClose: () => void;
  onConfirm?: () => void;
  passwordLabel?: string;
  confirmButtonTitle?: AdminConsoleKey;
};

function UserAccountInformation({
  user,
  password,
  title,
  onClose,
  onConfirm,
  passwordLabel,
  confirmButtonTitle,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { primaryEmail, primaryPhone, username } = user;

  const handleCopy = async () => {
    if (!password) {
      return null;
    }

    const content = conditionalArray(
      primaryEmail && `${t('user_details.created_email')} ${primaryEmail}`,
      primaryPhone && `${t('user_details.created_phone')} ${primaryPhone}`,
      username && `${t('user_details.created_username')} ${username}`,
      `${passwordLabel ?? t('user_details.created_password')} ${password}`
    ).join('\n');

    await navigator.clipboard.writeText(content);
    toast.success(t('general.copied'));
  };

  if (!password) {
    return null;
  }

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title={title}
        footer={
          <>
            <Button title={confirmButtonTitle ?? 'general.done'} onClick={onConfirm ?? onClose} />
            <Button type="primary" title="general.copy" onClick={handleCopy} />
          </>
        }
        className={styles.content}
        onClose={onClose}
      >
        <div>{t('user_details.created_guide')}</div>
        <div className={styles.info}>
          {username && (
            <div className={styles.infoLine}>
              <div>{t('user_details.created_username')}</div>
              <div className={styles.infoContent}>{username}</div>
            </div>
          )}
          {primaryEmail && (
            <div className={styles.infoLine}>
              <div>{t('user_details.created_email')}</div>
              <div className={styles.infoContent}>{primaryEmail}</div>
            </div>
          )}
          {primaryPhone && (
            <div className={styles.infoLine}>
              <div>{t('user_details.created_phone')}</div>
              <div className={styles.infoContent}>{primaryPhone}</div>
            </div>
          )}
          <div className={styles.infoLine}>
            <div>{passwordLabel ?? t('user_details.created_password')}</div>
            <div className={styles.infoContent}>
              {passwordVisible ? password : password.replace(/./g, '*')}
            </div>
            <div className={styles.operation}>
              <IconButton
                onClick={() => {
                  setPasswordVisible((previous) => !previous);
                }}
              >
                <Eye className={styles.eyeIcon} />
              </IconButton>
            </div>
          </div>
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default UserAccountInformation;
