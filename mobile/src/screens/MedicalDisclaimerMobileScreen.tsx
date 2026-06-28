import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function MedicalDisclaimerMobileScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Medical Disclaimer" subtitle="Luna29 is awareness support, not diagnosis." onBack={onBack} />
      <SurfaceCard>
        <Text style={styles.text}>Luna29 does not replace medical care. Consult a licensed physician for diagnosis, treatment, and urgent health concerns.</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
