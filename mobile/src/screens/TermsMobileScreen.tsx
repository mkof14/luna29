import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function TermsMobileScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Terms of Use" subtitle="Service terms and user responsibilities." onBack={onBack} />
      <SurfaceCard>
        <Text style={styles.text}>Use Luna29 respectfully, protect account credentials, and follow local laws when sharing content.</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
