import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function CookiesMobileScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Cookies & Device Data" subtitle="Session, language, and security essentials." onBack={onBack} />
      <SurfaceCard>
        <Text style={styles.text}>Luna29 uses essential cookies/device storage for login session, language preference, and basic analytics stability.</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
