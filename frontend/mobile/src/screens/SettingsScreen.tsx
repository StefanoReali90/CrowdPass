import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../api';
import { Button, Card, Field, Notice, PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';

export function SettingsScreen() {
  const { apiBaseUrl, saveApiBaseUrl } = useAuth();
  const [value, setValue] = useState(apiBaseUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setValue(apiBaseUrl), [apiBaseUrl]);

  const saveAndTest = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const normalized = await saveApiBaseUrl(value);
      const events = await api.events();
      setValue(normalized);
      setMessage(`Connessione riuscita. ${events.length} eventi ricevuti.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Configurazione non valida.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <PageHeader eyebrow="Connessione" title="Server PassHalo." description="Puoi sostituire il tunnel senza reinstallare o ricompilare l’app." />
      {message ? <Notice tone="success">{message}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Card>
        <Field
          label="URL base delle API"
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://nome-tunnel.trycloudflare.com/api"
        />
        <Button label="Salva e verifica" onPress={saveAndTest} busy={busy} disabled={!value.trim()} />
      </Card>
      <Card>
        <Text style={styles.title}>Tunnel Cloudflare</Text>
        <Text style={styles.copy}>Se il tunnel punta al frontend Vite, aggiungi <Text style={styles.code}>/api</Text> alla fine dell’indirizzo.</Text>
        <Text style={styles.example}>https://esempio.trycloudflare.com/api</Text>
        <Text style={styles.copy}>Cambiare server disconnette l’utente per evitare di riutilizzare un token sul backend sbagliato.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  code: { color: colors.accent, fontWeight: '800' },
  example: { color: colors.text, fontSize: 13, backgroundColor: colors.background, padding: spacing.md, borderRadius: 12 },
});
