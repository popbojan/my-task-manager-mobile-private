import { useCallback, useState } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit } from '@/api/authClient';
import { ResponseError } from '@/api/generated/runtime';
import { resolveDeleteAccountErrorMessage } from '@/account/resolveDeleteAccountErrorMessage';
import { useApiLanguage, useLanguage } from '@/i18n/LanguageProvider';
import { markAccountDeletedNotice } from '@/pages/login/accountDeletedNotice';
import type { DeleteAccountModalStep } from '@/pages/profile/DeleteAccountModal';
import {
  isDeleteAccountOtpComplete,
  normalizeDeleteAccountOtp,
} from '@/pages/profile/deleteAccountOtp';
import { clearUserSession } from '@/session/clearUserSession';
import { useCurrentUser } from '@/user/useCurrentUser';

type UseDeleteAccountFlowOptions = {
  queryClient: QueryClient;
  setAccessToken: (token: string | null) => void;
};

export function useDeleteAccountFlow({
  queryClient,
  setAccessToken,
}: UseDeleteAccountFlowOptions) {
  const { t } = useLanguage();
  const apiLanguage = useApiLanguage();
  const currentUserQuery = useCurrentUser();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [isSendingDeleteOtp, setIsSendingDeleteOtp] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState<DeleteAccountModalStep>('info');

  const accountEmail = currentUserQuery.data?.email?.trim() ?? null;

  const resetDeleteVerificationState = useCallback(() => {
    setDeleteAccountError(null);
    setDeleteOtp('');
    setDeleteOtpSent(false);
    setIsSendingDeleteOtp(false);
  }, []);

  const resetDeleteModalState = useCallback(() => {
    resetDeleteVerificationState();
    setDeleteModalStep('info');
  }, [resetDeleteVerificationState]);

  const openDeleteModal = useCallback(() => {
    resetDeleteModalState();
    setIsDeleteModalOpen(true);
  }, [resetDeleteModalState]);

  const closeDeleteModal = useCallback(() => {
    if (isDeletingAccount) {
      return;
    }
    setIsDeleteModalOpen(false);
    resetDeleteModalState();
  }, [isDeletingAccount, resetDeleteModalState]);

  const continueDeleteToVerify = useCallback(() => {
    setDeleteAccountError(null);
    setDeleteModalStep('verify');
  }, []);

  const backDeleteToInfo = useCallback(() => {
    if (isDeletingAccount) {
      return;
    }
    resetDeleteVerificationState();
    setDeleteModalStep('info');
  }, [isDeletingAccount, resetDeleteVerificationState]);

  const completeAccountDeletion = useCallback(async () => {
    await authApi.deleteCurrentUser();
    setIsDeleteModalOpen(false);
    resetDeleteModalState();
    await markAccountDeletedNotice();
    await clearUserSession({
      queryClient,
      setAccessToken,
      callBackendLogout: false,
    });
    setAccessToken(null);
  }, [queryClient, resetDeleteModalState, setAccessToken]);

  const requestDeleteOtp = useCallback(async () => {
    if (!accountEmail) {
      setDeleteAccountError(t('profile.emailUnavailable'));
      return;
    }

    setIsSendingDeleteOtp(true);
    setDeleteAccountError(null);

    try {
      await authApi.requestOtp({
        oTPRequest: { email: accountEmail, language: apiLanguage },
      });
      setDeleteOtpSent(true);
    } catch {
      setDeleteAccountError(t('login.errorOtpRequest'));
    } finally {
      setIsSendingDeleteOtp(false);
    }
  }, [accountEmail, apiLanguage, t]);

  const handleDeleteOtpChange = useCallback((value: string) => {
    setDeleteOtp(normalizeDeleteAccountOtp(value));
  }, []);

  const confirmDeleteAccount = useCallback(async () => {
    const otp = normalizeDeleteAccountOtp(deleteOtp);
    if (!accountEmail || !isDeleteAccountOtpComplete(otp)) {
      return;
    }

    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      const loginResponse = await authApi.loginWithOtp(
        {
          loginRequest: {
            email: accountEmail,
            otp,
            language: apiLanguage,
          },
        },
        authRequestInit,
      );

      if (!loginResponse.accessToken) {
        setDeleteAccountError(t('login.errorLogin'));
        return;
      }

      setAccessToken(loginResponse.accessToken);
      await completeAccountDeletion();
    } catch (error) {
      if (error instanceof ResponseError && error.response.status === 401) {
        setDeleteAccountError(t('login.errorLogin'));
        return;
      }

      setDeleteAccountError(await resolveDeleteAccountErrorMessage(error, t));
    } finally {
      setIsDeletingAccount(false);
    }
  }, [
    accountEmail,
    apiLanguage,
    completeAccountDeletion,
    deleteOtp,
    setAccessToken,
    t,
  ]);

  return {
    accountEmail,
    isDeleteModalOpen,
    deleteModalStep,
    isDeletingAccount,
    deleteAccountError,
    deleteOtp,
    deleteOtpSent,
    isSendingDeleteOtp,
    setDeleteOtp: handleDeleteOtpChange,
    openDeleteModal,
    closeDeleteModal,
    continueDeleteToVerify,
    backDeleteToInfo,
    requestDeleteOtp,
    confirmDeleteAccount,
  };
}
