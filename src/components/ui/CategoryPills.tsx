import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface CategoryItem {
  id: string;
  label: string;
}

interface CategoryPillsProps {
  categories: CategoryItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  light?: boolean;
  style?: ViewStyle;
}

export function CategoryPills({
  categories,
  selectedId = null,
  onSelect,
  light = false,
  style,
}: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={style}
    >
      {categories.map((cat) => {
        const selected = selectedId === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.pill, light && styles.pillLight, selected && styles.pillSelected]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, light && styles.pillTextLight, selected && styles.pillTextSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  pill: {
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillLight: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
  },
  pillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  pillTextLight: {
    color: theme.colors.textOnLight,
  },
  pillTextSelected: {
    color: theme.colors.white,
  },
});
