import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  RecurringTaskStatus,
  type RecurringTaskStatus as RecurringTaskStatusType,
} from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useLanguage } from '@/i18n/LanguageProvider';
import { DAILY_STATUS_COLUMNS } from '@/pages/recurring-tasks/recurringBoardConfig';
import { recurringTaskToFormState } from '@/pages/recurring-tasks/recurringTaskFormUtils';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { shouldRetryApiQuery } from '@/utils/apiError';

type RecurringTaskFormModalProps = {
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  status: RecurringTaskStatusType;
};

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  status: RecurringTaskStatus.Todo,
};

export default function RecurringTaskFormModal({
  taskId,
  onClose,
  onSaved,
}: RecurringTaskFormModalProps) {
  const { t } = useLanguage();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isEdit = taskId !== null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const taskQuery = useQuery({
    queryKey: ['recurring-task', taskId],
    queryFn: () => authApi.getRecurringTask({ recurringTaskId: taskId! }),
    enabled: isEdit,
    retry: shouldRetryApiQuery,
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose]);

  useEffect(() => {
    if (!isEdit) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    if (taskQuery.data) {
      setForm(recurringTaskToFormState(taskQuery.data));
    }
  }, [isEdit, taskQuery.data]);

  const isLoadingTask = isEdit && taskQuery.isLoading;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedTitle = form.title.trim();
      if (!trimmedTitle) {
        throw new Error('empty');
      }

      const payload = {
        title: trimmedTitle,
        description: form.description.trim() || null,
      };

      if (isEdit && taskId) {
        return authApi.updateRecurringTask({
          recurringTaskId: taskId,
          updateRecurringTaskRequest: {
            ...payload,
            status: form.status,
          },
        });
      }

      const created = await authApi.createRecurringTask({
        createRecurringTaskRequest: payload,
      });

      if (form.status !== RecurringTaskStatus.Todo) {
        await authApi.updateRecurringTask({
          recurringTaskId: created.id,
          updateRecurringTaskRequest: { status: form.status },
        });
      }

      return created;
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: err => {
      if (err instanceof Error && err.message === 'empty') {
        setError(t('recurring.form.titleRequired'));
        return;
      }

      setError(t('recurring.form.error'));
    },
  });

  function handleSavePress() {
    if (!form.title.trim()) {
      setError(t('recurring.form.titleRequired'));
      return;
    }

    setError(null);
    saveMutation.mutate();
  }

  const availableHeight = windowHeight - keyboardHeight - insets.top - 12;
  const panelHeight = Math.min(
    Math.round(windowHeight * 0.52),
    420,
    Math.max(300, availableHeight),
  );

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Pressable style={styles.backdropTap} accessibilityLabel={t('common.close')} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardWrap}
        keyboardVerticalOffset={insets.top}
      >
        <SafeAreaView edges={['top']} style={styles.safeTop}>
          <View style={[styles.panel, { height: panelHeight }]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderCopy}>
                <Text style={styles.eyebrow}>{t('recurring.stats.dailyHint')}</Text>
                <Text style={styles.title}>
                  {isEdit ? t('recurring.form.editTitle') : t('recurring.form.createTitle')}
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
                onPress={onClose}
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
              <View style={styles.formBody}>
                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>
                    {t('recurring.form.titleLabel')} *{' '}
                    <Text style={styles.fieldHintInline}>
                      ({t('recurring.form.titleRequiredHint')})
                    </Text>
                  </Text>
                  <TextInput
                    style={[styles.input, !form.title.trim() && error ? styles.inputError : null]}
                    value={form.title}
                    onChangeText={title => {
                      setForm(current => ({ ...current, title }));
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
                      setForm(current => ({ ...current, description }))
                    }
                    placeholder={t('recurring.form.descriptionPlaceholder')}
                    placeholderTextColor={recurringTheme.textMuted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>{t('recurring.form.statusLabel')}</Text>
                  <View style={styles.statusRow}>
                    {DAILY_STATUS_COLUMNS.map(({ status, labelKey }) => {
                      const active = form.status === status;

                      return (
                        <Pressable
                          key={status}
                          style={[styles.statusChip, active && styles.statusChipActive]}
                          onPress={() => setForm(current => ({ ...current, status }))}
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
                  <View style={styles.errorSlot}>
                    {error ? (
                      <View style={styles.errorBox}>
                        <Text style={styles.error} numberOfLines={2}>
                          {error}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.actions}>
                    <Pressable style={styles.cancelButton} onPress={onClose}>
                      <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.saveButton}
                      onPress={handleSavePress}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.saveText}>{t('recurring.form.save')}</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeTop: {
    justifyContent: 'flex-start',
  },
  panel: {
    marginHorizontal: 12,
    marginTop: 8,
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
    paddingTop: 12,
    paddingBottom: 8,
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
  formBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  fieldBlock: {
    gap: 4,
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
    paddingVertical: 10,
    color: recurringTheme.textPrimary,
    fontSize: 15,
    backgroundColor: recurringTheme.surfaceInset,
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  textArea: {
    height: 96,
    paddingTop: 10,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    flex: 1,
    paddingHorizontal: 6,
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
  },
  errorSlot: {
    minHeight: 0,
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
