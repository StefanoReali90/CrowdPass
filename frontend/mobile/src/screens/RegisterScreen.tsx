import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../api';
import { Button, Card, Field, Notice, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';

export function RegisterScreen({ onLogin, onOpenSettings }: { onLogin(): void; onOpenSettings(): void }) {
  const { apiBaseUrl } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  const submit = async () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !password) {
      setError('Compila tutti i campi.');
      return;
    }
    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri.');
      return;
    }
    if (password !== confirmation) {
      setError('Le password non coincidono.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.registerAdmin({ name: name.trim(), surname: surname.trim(), email: email.trim(), password });
      setComplete(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registrazione non riuscita.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <PageHeader eyebrow="Nuovo organizzatore" title="Crea il tuo spazio." description="Ogni account ADMIN gestisce esclusivamente i propri eventi e le relative prenotazioni." />
        {!apiBaseUrl ? (
          <>
            <Notice tone="error">Configura il server prima di registrarti.</Notice>
            <Button label="Configura il server" onPress={onOpenSettings} />
          </>
        ) : complete ? (
          <Card>
            <Notice tone="success">Account ADMIN creato. Ora puoi accedere.</Notice>
            <Button label="Vai al login" onPress={onLogin} />
          </Card>
        ) : (
          <Card>
            {error ? <Notice tone="error">{error}</Notice> : null}
            <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name-given" />
            <Field label="Cognome" value={surname} onChangeText={setSurname} autoCapitalize="words" autoComplete="name-family" />
            <Field label="Email di lavoro" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
            <Field label="Conferma password" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoComplete="new-password" onSubmitEditing={submit} />
            <Button label="Crea account" onPress={submit} busy={busy} />
            <Text style={styles.note}>Non è richiesto alcun codice condiviso: l’account creato costituisce uno spazio amministrativo separato.</Text>
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
