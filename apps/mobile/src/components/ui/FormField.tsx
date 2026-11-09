import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({
  label,
  error,
  secureTextEntry = false,
  onFocus,
  onBlur,
  ...props
}: FormFieldProps) {
  const { colors } = useAppTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        {label.toUpperCase()}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.glassSurface,
            borderColor: error
              ? colors.error
              : focused
                ? colors.primary
                : colors.glassBorder,
            shadowColor: colors.glow,
            shadowOpacity: focused && !error ? 0.4 : 0,
            elevation: focused && !error ? 4 : 0,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          placeholderTextColor={colors.mutedText}
          selectionColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
          secureTextEntry={secureTextEntry && !passwordVisible}
          style={[styles.input, { color: colors.text }, props.style]}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? 'Hide password' : 'Show password'
            }
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.visibilityButton}
          >
            <Text style={[styles.visibilityLabel, { color: colors.primary }]}>
              {passwordVisible ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: colors.error }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  visibilityButton: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  visibilityLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  error: { fontSize: 12, marginTop: 7 },
});
