import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  type TextInputInstance,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RecurringTaskStatus, type RecurringTask } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import { DAILY_STATUS_COLUMNS } from '@/pages/recurring-tasks/recurringBoardConfig';
import RecurringReminderDiscardModal from '@/pages/recurring-tasks/RecurringReminderDiscardModal';
import RecurringTaskNotificationField from '@/pages/recurring-tasks/RecurringTaskNotificationField';
import { DEFAULT_RECURRING_NOTIFICATION_TIME } from '@/notifications/recurringNotificationTimeUtils';
import {
  buildRecurringTaskNotificationFields,
  didRecurringReminderScheduleChange,
  recurringTaskToFormState,
  reminderScheduleSnapshotFromForm,
  reminderScheduleSnapshotFromTask,
  resolveStoredNotificationTime,
  selectRecurringTaskForForm,
  type RecurringReminderScheduleSnapshot,
  type RecurringTaskFormState,
} from '@/pages/recurring-tasks/recurringTaskFormUtils';
import {
  recurringTaskQueryKey,
  recurringTasksQueryKey,
  writeRecurringTaskToCaches,
} from '@/recurring/recurringQueryKeys';
import { flushRecurringReminderSchedule } from '@/notifications/flushRecurringReminderSchedule';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { handleDailyResetRequired } from '@/recurring/dailyResetRequired';
import {
  isApiPremiumRequiredError,
  shouldRetryApiQuery,
} from '@/utils/apiError';
import { focusTextInputSoon } from '@/utils/focusTextInputSoon';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';

type RecurringTaskFormModalProps = {
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

const INITIAL_FORM: RecurringTaskFormState = {
  title: '',
  description: '',
  status: RecurringTaskStatus.Todo,
  notificationEnabled: false,
  notificationTime: DEFAULT_RECURRING_NOTIFICATION_TIME,
};

export default function RecurringTaskFormModal({
  taskId,
  onClose,
  onSaved,
}: RecurringTaskFormModalProps) {
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const timeZone =
    currentUserQuery.data?.timezone?.trim() || getDeviceTimezone();
  const isEdit = taskId !== null;

  const listTask =
    isEdit && taskId
      ? queryClient
          .getQueryData<RecurringTask[]>(recurringTasksQueryKey(accessToken))
          ?.find(task => task.id === taskId)
      : undefined;

  const initialForm = listTask
    ? recurringTaskToFormState(listTask)
    : INITIAL_FORM;

  const [form, setForm] = useState<RecurringTaskFormState>(initialForm);
  const formRef = useRef(initialForm);
  const hydratedTaskIdRef = useRef<string | null>(null);
  const hydratedUpdatedAtRef = useRef<number | null>(null);
  /** Reminder state when the edit modal opened (for Cancel → reset). */
  const openReminderBaselineRef = useRef<RecurringReminderScheduleSnapshot | null>(
    listTask ? reminderScheduleSnapshotFromTask(listTask) : null,
  );
  /** Last reminder successfully written to API + AlarmManager in this session. */
  const committedReminderRef = useRef<RecurringReminderScheduleSnapshot | null>(
    listTask ? reminderScheduleSnapshotFromTask(listTask) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [reminderPersisting, setReminderPersisting] = useState(false);
  const [reminderDiscardVisible, setReminderDiscardVisible] = useState(false);
  const [reminderResetPending, setReminderResetPending] = useState(false);
  /** True when committed reminder differs from what was open at modal start. */
  const [reminderCommittedDirty, setReminderCommittedDirty] = useState(false);
  const [lockedPanelHeight, setLockedPanelHeight] = useState<number | null>(null);
  const titleInputRef = useRef<TextInputInstance>(null);
  const saveMutationPendingRef = useRef(false);
  const { height: windowHeight } = useWindowDimensions();
  const maxPanelHeight = Math.round(windowHeight * 0.9);
  const panelHeaderHeightRef = useRef(52);
  const reminderPersistGenerationRef = useRef(0);

  function patchForm(
    updater: (
      current: RecurringTaskFormState,
    ) => RecurringTaskFormState,
  ) {
    setForm(current => {
      const next = updater(current);
      formRef.current = next;
      return next;
    });
  }

  const taskQuery = useQuery({
    queryKey: recurringTaskQueryKey(taskId ?? ''),
    queryFn: () => authApi.getRecurringTask({ recurringTaskId: taskId! }),
    enabled: isEdit && !!taskId,
    retry: shouldRetryApiQuery,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!isEdit) {
      hydratedTaskIdRef.current = null;
      hydratedUpdatedAtRef.current = null;
      openReminderBaselineRef.current = null;
      committedReminderRef.current = null;
      formRef.current = INITIAL_FORM;
      setForm(INITIAL_FORM);
      setError(null);
      setReminderDiscardVisible(false);
      setReminderCommittedDirty(false);
      return;
    }

    if (!taskId) {
      return;
    }

    const task = selectRecurringTaskForForm(taskQuery.data, listTask);
    if (!task) {
      return;
    }

    const updatedAt = new Date(task.updatedAt).getTime();
    if (
      hydratedTaskIdRef.current === taskId &&
      hydratedUpdatedAtRef.current === updatedAt
    ) {
      return;
    }

    // Don't wipe in-progress title/status edits after an immediate reminder save.
    if (
      hydratedTaskIdRef.current === taskId &&
      reminderPersisting
    ) {
      hydratedUpdatedAtRef.current = updatedAt;
      return;
    }

    const next = recurringTaskToFormState(task);
    formRef.current = next;
    setForm(next);
    const reminderSnapshot = reminderScheduleSnapshotFromTask(task);
    openReminderBaselineRef.current = reminderSnapshot;
    committedReminderRef.current = reminderSnapshot;
    setReminderCommittedDirty(false);
    hydratedTaskIdRef.current = taskId;
    hydratedUpdatedAtRef.current = updatedAt;
  }, [isEdit, listTask, taskId, taskQuery.data, reminderPersisting]);

  const isLoadingTask =
    isEdit && !listTask && !taskQuery.data && taskQuery.isLoading;
  const canFocusTitle = !isLoadingTask;

  useEffect(() => {
    if (!canFocusTitle) {
      return;
    }

    focusTextInputSoon(titleInputRef);
  }, [canFocusTitle]);

  useEffect(() => {
    setLockedPanelHeight(null);
  }, [taskId]);

  const flushNativeReminders = useCallback(async () => {
    await flushRecurringReminderSchedule({
      queryClient,
      accessToken,
      t,
      timeZone,
      force: true,
    });
  }, [accessToken, queryClient, t, timeZone]);

  /** Let React paint the reminder spinner before AlarmManager blocks the JS bridge. */
  function yieldForSpinnerPaint(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 48);
      });
    });
  }

  const persistReminderNow = useCallback(
    async (nextReminder: {
      notificationEnabled: boolean;
      notificationTime: string | null;
    }) => {
      if (!isEdit || !taskId) {
        return;
      }

      const generation = ++reminderPersistGenerationRef.current;
      setReminderPersisting(true);
      setError(null);

      const notificationFields = buildRecurringTaskNotificationFields({
        notificationEnabled: nextReminder.notificationEnabled,
        notificationTime: nextReminder.notificationTime,
      });

      const existing =
        queryClient
          .getQueryData<RecurringTask[]>(recurringTasksQueryKey(accessToken))
          ?.find(task => task.id === taskId) ??
        queryClient.getQueryData<RecurringTask>(recurringTaskQueryKey(taskId));

      // Optimistic cache so Android flush sees the new schedule immediately.
      if (existing) {
        writeRecurringTaskToCaches(queryClient, accessToken, {
          ...existing,
          ...notificationFields,
        });
      }

      // Critical: paint spinner before network/native work freezes the bridge.
      await yieldForSpinnerPaint();
      if (generation !== reminderPersistGenerationRef.current) {
        return;
      }

      try {
        // Railway under the spinner (fast). AlarmManager afterwards without blocking the modal.
        const saved = await authApi.updateRecurringTask({
          recurringTaskId: taskId,
          updateRecurringTaskRequest: notificationFields,
        });

        if (generation !== reminderPersistGenerationRef.current) {
          return;
        }

        const merged: RecurringTask = {
          ...saved,
          ...notificationFields,
        };
        writeRecurringTaskToCaches(queryClient, accessToken, merged);
        hydratedUpdatedAtRef.current = new Date(merged.updatedAt).getTime();

        const committed = reminderScheduleSnapshotFromForm({
          notificationEnabled: notificationFields.notificationEnabled,
          notificationTime: notificationFields.notificationTime,
        });
        committedReminderRef.current = committed;
        setReminderCommittedDirty(
          didRecurringReminderScheduleChange(
            openReminderBaselineRef.current,
            committed,
          ),
        );

        if (generation === reminderPersistGenerationRef.current) {
          setReminderPersisting(false);
        }

        // Native write off the UI path — awaiting AlarmManager was freezing the form.
        void flushNativeReminders().catch(() => {
          if (generation === reminderPersistGenerationRef.current) {
            setError(t('recurring.form.reminderPersistError'));
          }
        });
      } catch (err) {
        if (generation !== reminderPersistGenerationRef.current) {
          return;
        }

        // Roll back optimistic cache if we still have the pre-change task.
        if (existing) {
          writeRecurringTaskToCaches(queryClient, accessToken, existing);
          void flushNativeReminders().catch(() => undefined);
        }

        if (isApiPremiumRequiredError(err)) {
          setError(t('recurring.premiumRequired'));
          return;
        }

        const handled = await handleDailyResetRequired({
          error: err,
          queryClient,
          t,
        });
        if (handled) {
          return;
        }

        setError(t('recurring.form.reminderPersistError'));
      } finally {
        if (generation === reminderPersistGenerationRef.current) {
          setReminderPersisting(false);
        }
      }
    },
    [
      accessToken,
      flushNativeReminders,
      isEdit,
      queryClient,
      t,
      taskId,
    ],
  );

  function handleReminderEnabledChange(notificationEnabled: boolean) {
    const notificationTime = notificationEnabled
      ? resolveStoredNotificationTime(formRef.current.notificationTime)
      : formRef.current.notificationTime;

    patchForm(current => ({
      ...current,
      notificationEnabled,
      notificationTime,
    }));

    void persistReminderNow({ notificationEnabled, notificationTime });
  }

  function handleReminderTimeChange(notificationTime: string) {
    patchForm(current => ({
      ...current,
      notificationEnabled: true,
      notificationTime,
    }));
    void persistReminderNow({
      notificationEnabled: true,
      notificationTime,
    });
  }

  function requestClose() {
    if (reminderResetPending || saveMutationPendingRef.current) {
      return;
    }

    if (isEdit && reminderCommittedDirty) {
      setReminderDiscardVisible(true);
      return;
    }

    onClose();
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestClose();
      return true;
    });

    return () => subscription.remove();
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const current = formRef.current;
      const trimmedTitle = current.title.trim();
      if (!trimmedTitle) {
        throw new Error('empty');
      }

      const notificationFields = buildRecurringTaskNotificationFields(current);
      const payload = {
        title: trimmedTitle,
        description: current.description.trim() || null,
        ...notificationFields,
      };

      let saved: RecurringTask;
      if (isEdit && taskId) {
        // Backend only — AlarmManager already updated on reminder field changes.
        saved = await authApi.updateRecurringTask({
          recurringTaskId: taskId,
          updateRecurringTaskRequest: {
            ...payload,
            status: current.status,
          },
        });
      } else {
        const created = await authApi.createRecurringTask({
          createRecurringTaskRequest: payload,
        });

        saved =
          current.status !== RecurringTaskStatus.Todo
            ? await authApi.updateRecurringTask({
                recurringTaskId: created.id,
                updateRecurringTaskRequest: {
                  status: current.status,
                  ...notificationFields,
                },
              })
            : created;

        writeRecurringTaskToCaches(queryClient, accessToken, {
          ...saved,
          ...notificationFields,
        });

        // New task: first chance to register AlarmManager (no id before create).
        if (notificationFields.notificationEnabled) {
          await flushNativeReminders();
        }

        return saved;
      }

      writeRecurringTaskToCaches(queryClient, accessToken, {
        ...saved,
        ...notificationFields,
      });
      return saved;
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: async err => {
      if (err instanceof Error && err.message === 'empty') {
        setError(t('recurring.form.titleRequired'));
        return;
      }

      if (isApiPremiumRequiredError(err)) {
        setError(t('recurring.premiumRequired'));
        onClose();
        return;
      }

      const handled = await handleDailyResetRequired({
        error: err,
        queryClient,
        t,
      });
      if (handled) {
        onClose();
        return;
      }

      setError(t('recurring.form.error'));
    },
  });

  saveMutationPendingRef.current = saveMutation.isPending;

  function handleSavePress() {
    titleInputRef.current?.blur();

    if (!formRef.current.title.trim()) {
      setError(t('recurring.form.titleRequired'));
      return;
    }

    setError(null);
    saveMutation.mutate();
  }

  async function handleResetReminderAndClose() {
    const baseline = openReminderBaselineRef.current;
    if (!isEdit || !taskId || !baseline) {
      setReminderDiscardVisible(false);
      onClose();
      return;
    }

    setReminderResetPending(true);
    try {
      const notificationFields = buildRecurringTaskNotificationFields(baseline);
      const saved = await authApi.updateRecurringTask({
        recurringTaskId: taskId,
        updateRecurringTaskRequest: notificationFields,
      });
      writeRecurringTaskToCaches(queryClient, accessToken, {
        ...saved,
        ...notificationFields,
      });
      await flushNativeReminders();
      setReminderDiscardVisible(false);
      onClose();
    } catch {
      setError(t('recurring.form.reminderPersistError'));
      setReminderDiscardVisible(false);
    } finally {
      setReminderResetPending(false);
    }
  }

  function growPanelToFit(neededHeight: number) {
    const capped = Math.min(Math.ceil(neededHeight), maxPanelHeight);
    if (capped < 160) {
      return;
    }

    setLockedPanelHeight(current =>
      current === null || capped > current ? capped : current,
    );
  }

  function handlePanelLayout(event: LayoutChangeEvent) {
    if (isLoadingTask) {
      return;
    }

    growPanelToFit(event.nativeEvent.layout.height);
  }

  function handleHeaderLayout(event: LayoutChangeEvent) {
    panelHeaderHeightRef.current = Math.ceil(event.nativeEvent.layout.height);
  }

  function handleFormContentSizeChange(_width: number, contentHeight: number) {
    if (isLoadingTask) {
      return;
    }

    growPanelToFit(contentHeight + panelHeaderHeightRef.current + 4);
  }

  const panelSizeStyle =
    lockedPanelHeight !== null
      ? { height: lockedPanelHeight, maxHeight: maxPanelHeight }
      : { maxHeight: maxPanelHeight };

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Pressable
        style={styles.backdropTap}
        accessibilityLabel={t('common.close')}
        onPress={requestClose}
      />

      <RecurringReminderDiscardModal
        visible={reminderDiscardVisible}
        isPending={reminderResetPending}
        onDismiss={() => setReminderDiscardVisible(false)}
        onKeepAndClose={() => {
          setReminderDiscardVisible(false);
          onClose();
        }}
        onResetAndClose={() => {
          void handleResetReminderAndClose();
        }}
      />

      <View style={styles.modalShell}>
        <SafeAreaView edges={['top']} style={styles.safeTop}>
          <View style={[styles.panel, panelSizeStyle]} onLayout={handlePanelLayout}>
            <View style={styles.panelHeader} onLayout={handleHeaderLayout}>
              <View style={styles.panelHeaderCopy}>
                <Text style={styles.eyebrow}>{t('recurring.stats.dailyHint')}</Text>
                <Text style={styles.title}>
                  {isEdit ? t('recurring.form.editTitle') : t('recurring.form.createTitle')}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
                onPress={requestClose}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {isLoadingTask ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={recurringTheme.accentBright} />
                <Text style={styles.loadingText}>{t('recurring.loadingTask')}</Text>
              </View>
            ) : (
              <ScrollView
                style={lockedPanelHeight !== null ? styles.formScrollLocked : styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                showsVerticalScrollIndicator={false}
                bounces={false}
                onContentSizeChange={handleFormContentSizeChange}
              >
                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>
                      {t('recurring.form.titleLabel')} *{' '}
                      <Text style={styles.fieldHintInline}>
                        ({t('recurring.form.titleRequiredHint')})
                      </Text>
                    </Text>
                    <TextInput
                      ref={titleInputRef}
                      style={[styles.input, !form.title.trim() && error ? styles.inputError : null]}
                      value={form.title}
                      onChangeText={title => {
                        patchForm(current => ({ ...current, title }));
                        if (error && title.trim()) {
                          setError(null);
                        }
                      }}
                      placeholder={t('recurring.form.titlePlaceholder')}
                      placeholderTextColor={recurringTheme.textMuted}
                      autoFocus
                      showSoftInputOnFocus
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.label}>{t('recurring.form.descriptionLabel')}</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={form.description}
                      onChangeText={description =>
                        patchForm(current => ({ ...current, description }))
                      }
                      placeholder={t('recurring.form.descriptionPlaceholder')}
                      placeholderTextColor={recurringTheme.textMuted}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <RecurringTaskNotificationField
                    enabled={form.notificationEnabled}
                    notificationTime={form.notificationTime}
                    immediatePersist={isEdit}
                    isPersisting={reminderPersisting}
                    onEnabledChange={handleReminderEnabledChange}
                    onNotificationTimeChange={handleReminderTimeChange}
                  />

                  <View style={styles.statusFieldRow}>
                    <Text style={styles.statusLabelInline}>
                      {t('recurring.form.statusLabel')}
                    </Text>
                    <View style={styles.statusRow}>
                      {DAILY_STATUS_COLUMNS.map(({ status, labelKey }) => {
                        const active = form.status === status;

                        return (
                          <Pressable
                            key={status}
                            style={[styles.statusChip, active && styles.statusChipActive]}
                            onPress={() => patchForm(current => ({ ...current, status }))}
                          >
                            <Text
                              style={[
                                styles.statusChipText,
                                active && styles.statusChipTextActive,
                              ]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                              minimumFontScale={0.8}
                            >
                              {t(labelKey)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                <View style={styles.footer}>
                  {error ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.error} numberOfLines={2}>
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.actions}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={requestClose}
                      disabled={reminderResetPending || saveMutation.isPending}
                    >
                      <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.saveButton}
                      onPress={handleSavePress}
                      disabled={saveMutation.isPending || reminderResetPending}
                    >
                      {saveMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.saveText}>{t('recurring.form.save')}</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdropTap: {
    ...StyleSheet.absoluteFill,
  },
  modalShell: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeTop: {
    justifyContent: 'flex-start',
  },
  formScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  formScrollLocked: {
    flex: 1,
    minHeight: 0,
  },
  panel: {
    marginHorizontal: 12,
    marginTop: 8,
    flexDirection: 'column',
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    overflow: 'hidden',
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  panelHeaderCopy: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  eyebrow: {
    color: recurringTheme.accentBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  closeText: {
    color: recurringTheme.textPrimary,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
  },
  formScrollContent: {
    flexGrow: 0,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  fieldBlock: {
    gap: 3,
  },
  label: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldHintInline: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: recurringTheme.textPrimary,
    fontSize: 15,
    backgroundColor: recurringTheme.surfaceInset,
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  textArea: {
    height: 72,
    paddingTop: 8,
    lineHeight: 20,
  },
  statusFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabelInline: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
  statusRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  statusChip: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
    alignItems: 'center',
  },
  statusChipActive: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(82, 183, 136, 0.14)',
  },
  statusChipText: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusChipTextActive: {
    color: recurringTheme.accentBright,
  },
  footer: {
    gap: 6,
    marginTop: 0,
  },
  errorBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: recurringTheme.fireRedSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  error: {
    color: recurringTheme.fireRedBright,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  cancelText: {
    color: recurringTheme.textSecondary,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
  },
});
