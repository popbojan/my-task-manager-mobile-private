import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  visible: boolean;
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
  visible,
  taskId,
  onClose,
  onSaved,
}: RecurringTaskFormModalProps) {
  const { t } = useLanguage();
  const { height: windowHeight } = useWindowDimensions();
  const isEdit = taskId !== null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  const taskQuery = useQuery({
    queryKey: ['recurring-task', taskId],
    queryFn: () => authApi.getRecurringTask({ recurringTaskId: taskId! }),
    enabled: visible && isEdit,
    retry: shouldRetryApiQuery,
  });

  useEffect(() => {
    if (!visible) {
      setForm(INITIAL_FORM);
      setError(null);
      return;
    }

    if (!isEdit) {
      setForm(INITIAL_FORM);
      return;
    }

    if (taskQuery.data) {
      setForm(recurringTaskToFormState(taskQuery.data));
    }
  }, [visible, isEdit, taskQuery.data]);

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

  const isLoadingTask = isEdit && taskQuery.isLoading;
  const panelMaxHeight = Math.round(windowHeight * 0.52);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdropTap} accessibilityLabel={t('common.close')} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <SafeAreaView edges={['top']} style={styles.safeTop}>
            <View style={[styles.panel, { maxHeight: panelMaxHeight }]}>
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
                <ScrollView
                  style={styles.formScroll}
                  contentContainerStyle={styles.formContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.label}>{t('recurring.form.titleLabel')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.title}
                    onChangeText={title => setForm(current => ({ ...current, title }))}
                    placeholder={t('recurring.form.titlePlaceholder')}
                    placeholderTextColor={recurringTheme.textMuted}
                    autoFocus
                  />

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
                    textAlignVertical="top"
                  />

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
                          >
                            {t(labelKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <View style={styles.actions}>
                    <Pressable style={styles.cancelButton} onPress={onClose}>
                      <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.saveButton}
                      onPress={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending || !form.title.trim()}
                    >
                      {saveMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.saveText}>{t('recurring.form.save')}</Text>
                      )}
                    </Pressable>
                  </View>
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>

        <View style={styles.keyboardSpacer} pointerEvents="none" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    paddingTop: 14,
    paddingBottom: 10,
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
    fontSize: 18,
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
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  loadingText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
  },
  formScroll: {
    flexGrow: 0,
  },
  formContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 20,
  },
  label: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: recurringTheme.textPrimary,
    fontSize: 16,
    backgroundColor: recurringTheme.surfaceInset,
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
  },
  statusChipActive: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(82, 183, 136, 0.14)',
  },
  statusChipText: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: recurringTheme.accentBright,
  },
  error: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
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
    paddingVertical: 12,
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
  keyboardSpacer: {
    flex: 1,
  },
});
