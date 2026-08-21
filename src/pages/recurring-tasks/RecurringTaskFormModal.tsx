import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type RecurringTaskFormModalProps = {
  visible: boolean;
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function RecurringTaskFormModal({
  visible,
  taskId,
  onClose,
  onSaved,
}: RecurringTaskFormModalProps) {
  const { t } = useLanguage();
  const isEdit = taskId !== null;
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const taskQuery = useQuery({
    queryKey: ['recurring-task', taskId],
    queryFn: async () => {
      const tasks = await authApi.getRecurringTasks();
      return tasks.find(task => task.id === taskId) ?? null;
    },
    enabled: visible && isEdit,
  });

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setError(null);
      return;
    }

    if (isEdit && taskQuery.data) {
      setTitle(taskQuery.data.title);
    }
  }, [visible, isEdit, taskQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = title.trim();
      if (!trimmed) {
        throw new Error('empty');
      }

      if (isEdit && taskId) {
        return authApi.updateRecurringTask({
          recurringTaskId: taskId,
          updateRecurringTaskRequest: { title: trimmed },
        });
      }

      return authApi.createRecurringTask({
        createRecurringTaskRequest: { title: trimmed },
      });
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>
            {isEdit ? t('recurring.form.editTitle') : t('recurring.form.createTitle')}
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('recurring.form.titlePlaceholder')}
            placeholderTextColor={recurringTheme.textMuted}
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.close')}</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={() => saveMutation.mutate()}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: recurringTheme.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
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
  error: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
});
