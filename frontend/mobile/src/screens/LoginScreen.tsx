import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, Field, Notice, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';
import type { User } from '../types';

export function LoginScreen({ onLoggedIn, onOpenSettings }: {
  onLoggedIn(user: User): void;
  onOpenSettings(): void;
}) {
  const { apiBaseUrl, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Inserisci email e password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onLoggedIn(await login(email, password));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Accesso non riuscito.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <PageHeader eyebrow="Area riservata" title="Accedi a PassHalo." description="ADMIN e STAFF usano le credenziali create nella piattaforma." />
        {!apiBaseUrl ? (
          <>
            <Notice tone="error">Configura il server prima di accedere.</Notice>
            <Button label="Configura il server" onPress={onOpenSettings} />
          </>
        ) : (
          <Card>
            {error ? <Notice tone="error">{error}</Notice> : null}
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" onSubmitEditing={submit} />
            <Button label="Accedi" onPress={submit} busy={busy} />
            <Text style={styles.note}>Il token viene conservato nell’archivio sicuro del dispositivo.</Text>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
