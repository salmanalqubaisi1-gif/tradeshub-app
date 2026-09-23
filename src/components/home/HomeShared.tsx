import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './homeStyles';

// Presentational helpers shared by the Home screen sections.
// Moved verbatim from src/app/home.tsx.
export function PeriodSelector({
  periods,
  selectedPeriod,
  onSelect,
  maxSelectablePeriod,
}: {
  periods: number[];
  selectedPeriod: number | null;
  onSelect: (period: number) => void;
  maxSelectablePeriod?: number | null;
}) {
  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => {
        const selected =
          selectedPeriod === period;

        const locked =
          maxSelectablePeriod !== null &&
          maxSelectablePeriod !== undefined &&
          period > maxSelectablePeriod;

        return (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selected &&
                styles.periodButtonSelected,
              locked &&
                styles.periodButtonLocked,
            ]}
            onPress={() =>
              onSelect(period)
            }
            disabled={locked}
          >
            <Text
              style={[
                styles.periodButtonText,
                selected &&
                  styles.periodButtonTextSelected,
                locked &&
                  styles.periodButtonTextLocked,
              ]}
            >
              {locked ? `🔒 Period ${period}` : `Period ${period}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function formatCareerLevel(
  level: string
) {
  if (level === 'Journeyperson') {
    return 'Journeyperson';
  }

  return level.replace(
    ' Apprentice',
    ''
  );
}

export function formatHours(hours: number) {
  return Number.isInteger(hours)
    ? hours.toString()
    : hours.toFixed(1);
}

export function formatNumber(value: number) {
  return value.toLocaleString('en-CA');
}

export function formatPercentage(value: number) {
  if (value <= 0) return '0%';
  if (value >= 100) return '100%';

  return `${value.toFixed(1)}%`;
}

export function formatDate(date: string) {
  const parsed = new Date(
    `${date}T00:00:00`
  );

  return parsed.toLocaleDateString(
    'en-CA',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
}

export function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;

  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons
        name={icon}
        size={20}
        color="#CAAE53"
      />

      <View style={styles.profileRowText}>
        <Text style={styles.profileLabel}>
          {label}
        </Text>

        <Text style={styles.profileValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ActionCard({
  icon,
  title,
  subtitle,
}: {
  icon:
    | 'construct-outline'
    | 'shield-checkmark-outline'
    | 'hammer-outline';

  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.actionCard}>
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={22}
          color="#CAAE53"
        />
      </View>

      <View
        style={
          styles.actionTextContainer
        }
      >
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text
          style={styles.actionSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#7C8796"
      />
    </View>
  );
}
