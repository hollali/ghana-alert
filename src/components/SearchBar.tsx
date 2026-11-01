import { Ionicons } from '@expo/vector-icons';
import { forwardRef, type ComponentRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, fonts, radius } from '@/src/theme/tokens';

interface SearchBarProps extends Pick<TextInputProps, 'autoFocus' | 'returnKeyType'> {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

type TextInputRef = ComponentRef<typeof TextInput>;

export const SearchBar = forwardRef<TextInputRef, SearchBarProps>(function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search…',
  onPress,
  autoFocus,
  returnKeyType = 'search',
  accessibilityLabel,
}, ref) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        ref={ref}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!value && (
        <Pressable
          onPress={() => onChangeText?.('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={colors.gray} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.75,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
});
