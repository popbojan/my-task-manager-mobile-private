import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  TaskPriority,
  TaskStatus,
  type TaskPriority as TaskPriorityType,
  type TaskStatus as TaskStatusType,
} from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/locales/de';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  TASK_PRIORITY_SECTIONS,
  TASK_STATUS_FLOW,
} from '@/pages/tasks/taskBoardConfig';
import {
  formatDeadlineInput,
  getDefaultDeadlineInput,
  parseDeadlineInput,
} from '@/pages/tasks/taskDeadlineUtils';
import { shouldRetryApiQuery } from '@/utils/apiError';

type TaskFormModalProps = {
  taskId: string | null;
  initialPriority?: TaskPriorityType | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  deadlineInput: string;
};

const PRIORITY_LABEL_KEYS: Record<TaskPriorityType, TranslationKey> = {
  [TaskPriority.ImportantUrgent]: 'tasks.priority.importantUrgent',
  [TaskPriority.Important]: 'tasks.priority.important',
  [TaskPriority.Urgent]: 'tasks.priority.urgent',
  [TaskPriority.None]: 'tasks.priority.none',
};

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  status: TaskStatus.Todo,
  priority: TaskPriority.ImportantUrgent,
  deadlineInput: getDefaultDeadlineInput(),
};

function createInitialForm(initialPriority: TaskPriorityType = TaskPriority.ImportantUrgent): FormState {
  return {
    ...INITIAL_FORM,
    priority: initialPriority,
    deadlineInput: getDefaultDeadlineInput(),
  };
}

export default function TaskFormModal({
  taskId,
  initialPriority = TaskPriority.ImportantUrgent,
  onClose,
  onSaved,
}: TaskFormModalProps) {
  const { t } = useLanguage();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isEdit = taskId !== null;
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => authApi.getTask({ taskId: taskId! }),
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
      setForm(createInitialForm(initialPriority ?? TaskPriority.ImportantUrgent));
      setError(null);
      return;
    }

    if (taskQuery.data) {
      const task = taskQuery.data;
      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        deadlineInput: formatDeadlineInput(task.deadline),
      });
    }
  }, [initialPriority, isEdit, taskQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedTitle = form.title.trim();
      if (!trimmedTitle) {
        throw new Error('empty');
      }

      const deadline = form.deadlineInput.trim()
        ? parseDeadlineInput(form.deadlineInput)
        : null;

      if (form.deadlineInput.trim() && !deadline) {
        throw new Error('deadline');
      }

      const payload = {
        title: trimmedTitle,
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        deadline,
      };

      if (isEdit && taskId) {
        return authApi.updateTask({
          taskId,
          updateTaskRequest: payload,
        });
      }

      return authApi.createTask({ createTaskRequest: payload });
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: err => {
      if (err instanceof Error && err.message === 'empty') {
        setError(t('tasks.form.titleRequired'));
        return;
      }

      if (err instanceof Error && err.message === 'deadline') {
        setError(t('tasks.form.deadlineInvalid'));
        return;
      }

      setError(t('tasks.form.error'));
    },
  });

  function handleSavePress() {
    if (!form.title.trim()) {
      setError(t('tasks.form.titleRequired'));
      return;
    }

    setError(null);
    saveMutation.mutate();
  }

  const availableHeight = windowHeight - keyboardHeight - insets.top - 12;
  const panelHeight = Math.min(
    Math.round(windowHeight * 0.54),
    440,
    Math.max(320, availableHeight),
  );
  const useFormScroll = keyboardHeight > 0;

  const formFields = (
    <>
      <View style={styles.fieldsTop}>
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>{t('tasks.form.titleLabel')} *</Text>
          <TextInput
            style={[styles.input, !form.title.trim() && error ? styles.inputError : null]}
            value={form.title}
            onChangeText={title => {
              setForm(current => ({ ...current, title }));
              if (error && title.trim()) {
                setError(null);
              }
            }}
            placeholder={t('tasks.form.titlePlaceholder')}
            placeholderTextColor={recurringTheme.textMuted}
            autoFocus
          />
        </View>

        <View style={[styles.fieldBlock, styles.descriptionBlock]}>
          <Text style={styles.label}>{t('tasks.form.descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={description =>
              setForm(current => ({ ...current, description }))
            }
            placeholder={t('tasks.form.descriptionPlaceholder')}
            placeholderTextColor={recurringTheme.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>{t('tasks.form.statusLabel')}</Text>
          <View style={styles.statusRow}>
            {TASK_STATUS_FLOW.map(({ status, labelKey }) => {
              const active = form.status === status;

              return (
                <Pressable
                  key={status}
                  style={[styles.compactChip, active && styles.chipActive]}
                  onPress={() => setForm(current => ({ ...current, status }))}
                >
                  <Text
                    style={[styles.compactChipText, active && styles.chipTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>{t('tasks.form.priorityLabel')}</Text>
          <View style={styles.priorityRow}>
            {TASK_PRIORITY_SECTIONS.map(priority => {
              const active = form.priority === priority;

              return (
                <Pressable
                  key={priority}
                  style={[styles.compactChip, active && styles.chipActive]}
                  onPress={() => setForm(current => ({ ...current, priority }))}
                >
                  <Text
                    style={[styles.compactChipText, active && styles.chipTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                  >
                    {t(PRIORITY_LABEL_KEYS[priority])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.deadlineRow}>
          <Text style={styles.deadlineLabel}>{t('tasks.form.deadlineLabel')}</Text>
          <TextInput
            style={[styles.input, styles.deadlineInput]}
            value={form.deadlineInput}
            onChangeText={deadlineInput =>
              setForm(current => ({ ...current, deadlineInput }))
            }
            placeholder={t('tasks.form.deadlinePlaceholder')}
            placeholderTextColor={recurringTheme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
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
              <Text style={styles.saveText}>{t('tasks.form.save')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </>
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
                <Text style={styles.eyebrow}>{t('tasks.sectionTitle')}</Text>
                <Text style={styles.title}>
                  {isEdit ? t('tasks.form.editTitle') : t('tasks.form.createTitle')}
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

            {isEdit && taskQuery.isLoading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={recurringTheme.accentBright} />
                <Text style={styles.loadingText}>{t('tasks.loadingTask')}</Text>
              </View>
            ) : useFormScroll ? (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.formBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {formFields}
              </ScrollView>
            ) : (
              <View style={styles.formBody}>{formFields}</View>
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
  scroll: {
    flex: 1,
  },
  formBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  fieldsTop: {
    flex: 1,
    minHeight: 0,
    gap: 6,
  },
  fieldBlock: {
    gap: 3,
  },
  descriptionBlock: {
    flex: 1,
    minHeight: 0,
  },
  label: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
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
    flex: 1,
    minHeight: 96,
    paddingTop: 8,
    lineHeight: 20,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineLabel: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
  deadlineInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 5,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 4,
  },
  compactChip: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 3,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactChipText: {
    color: recurringTheme.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipActive: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  chipTextActive: {
    color: recurringTheme.accentBright,
  },
  footer: {
    gap: 6,
    marginTop: 4,
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
