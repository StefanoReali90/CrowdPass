import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Field({ label, keyboardType, ...props }: TextInputProps & {
  label: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        keyboardType={keyboardType}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

export function Button({ label, onPress, disabled = false, busy = false, variant = 'primary', compact = false }: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  busy?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  compact?: boolean;
}) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        styles[`button_${variant}`],
        inactive && styles.buttonDisabled,
        pressed && !inactive && styles.buttonPressed,
      ]}
    >
      {busy ? <ActivityIndicator color={variant === 'primary' ? colors.accentDark : colors.text} /> : null}
      <Text style={[styles.buttonText, variant === 'primary' && styles.buttonTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'error' | 'success' }) {
  return (
    <View style={[styles.notice, tone === 'error' && styles.noticeError, tone === 'success' && styles.noticeSuccess]}>
      <Text style={[styles.noticeText, tone === 'error' && styles.noticeTextError, tone === 'success' && styles.noticeTextSuccess]}>
        {children}
      </Text>
    </View>
  );
}

export function LoadingBlock({ label = 'Caricamento…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
  button: {
    minHeight: 50,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
  },
  buttonCompact: {
    minHeight: 40,
    paddingHorizontal: 15,
  },
  button_primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  button_secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  button_danger: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.danger,
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonTextPrimary: {
    color: colors.accentDark,
  },
  notice: {
    padding: spacing.md,
    borderRadius: radii.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  noticeError: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.danger,
  },
  noticeSuccess: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
  },
  noticeText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  noticeTextError: {
    color: '#ffd7da',
  },
  noticeTextSuccess: {
    color: '#c8ffe2',
  },
  loading: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
