import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { deleteMobileAccount } from '../services/accountDeletion';

export function DataRightsMobileScreen({
  onBack,
  onDeleted,
}: {
  onBack: () => void;
  onDeleted?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your Luna account and local app data. Stripe billing history may be retained by Stripe. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              setFeedback('');
              const result = await deleteMobileAccount();
              setBusy(false);
              if (!result.ok) {
                setFeedback(result.error);
                return;
              }
              setFeedback('Account deleted.');
              onDeleted?.();
            })();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Data Rights" subtitle="Access, correction, export, deletion." onBack={onBack} />
      <SurfaceCard>
        <Text style={styles.text}>
          You can request access, correction, export, or deletion of your personal data under applicable privacy laws.
          Account deletion removes Luna-owned server data and clears this app&apos;s Luna SecureStore keys after the
          server confirms success. Stripe may retain financial records.
        </Text>
      </SurfaceCard>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onDeleteAccount}
        style={[styles.deleteBtn, busy && styles.deleteBtnDisabled]}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteBtnText}>Delete my account</Text>
        )}
      </Pressable>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  deleteBtn: {
    backgroundColor: '#9b2c2c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  feedback: { fontSize: 14, color: colors.textSecondary },
});
