import { Ionicons } from '@expo/vector-icons';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type {
  HoursEntry,
  TabName,
  TechnicalTrainingEntry,
  UserProfile,
} from '../../types/home';
import type { PeriodProgressItem } from './CareerSection';
import {
  formatCareerLevel,
  formatDate,
  formatHours,
  formatNumber,
  formatPercentage,
} from './HomeShared';
import { styles } from './homeStyles';

// Tradesperson home (Feed tab) sections: the collapsible career overview
// and the shift tracker / recent activity block. JSX moved verbatim from
// src/app/home.tsx; values are computed in HomeScreen's renderFeed.

export function TradespersonShiftTracker({
  activeClockEntry,
  clockActionLoading,
  handleClockIn,
  handleClockOut,
  recentCareerActivity,
  setActiveTab,
}: {
  activeClockEntry: HoursEntry | null;
  clockActionLoading: boolean;
  handleClockIn: () => void;
  handleClockOut: () => void;
  recentCareerActivity: HoursEntry[];
  setActiveTab: (tab: TabName) => void;
}) {
  return (
    <>
      <View style={styles.homeClockSectionHeader}>
        <Text style={styles.homeClockSectionTitle}>Shift Tracker</Text>
        <Text style={styles.homeClockSectionHint}>
          Track today’s work hours
        </Text>
      </View>

      <View
        style={[
          styles.homeClockCard,
          activeClockEntry && styles.homeClockCardActive,
        ]}
      >
        <View style={styles.homeClockCopy}>
          <View style={styles.homeClockTitleRow}>
            <View
              style={[
                styles.homeClockDot,
                activeClockEntry && styles.homeClockDotActive,
              ]}
            />
            <Text style={styles.homeClockEyebrow}>SHIFT TRACKING</Text>
          </View>

          <Text style={styles.homeClockTitle}>
            {activeClockEntry ? 'Shift in progress' : 'Ready for work?'}
          </Text>

          <Text style={styles.homeClockMeta}>
            {activeClockEntry?.clock_in
              ? `Clocked in at ${new Date(
                  activeClockEntry.clock_in
                ).toLocaleTimeString('en-CA', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}`
              : 'Start tracking your apprenticeship hours.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.homeClockButton,
            activeClockEntry && styles.homeClockButtonActive,
            clockActionLoading && styles.disabledButton,
          ]}
          onPress={
            activeClockEntry ? handleClockOut : handleClockIn
          }
          disabled={clockActionLoading}
        >
          {clockActionLoading ? (
            <ActivityIndicator
              color={activeClockEntry ? '#FFFFFF' : '#0B1623'}
            />
          ) : (
            <>
              <Ionicons
                name={
                  activeClockEntry
                    ? 'stop-circle-outline'
                    : 'play-circle-outline'
                }
                size={19}
                color={activeClockEntry ? '#FFFFFF' : '#0B1623'}
              />
              <Text
                style={[
                  styles.homeClockButtonText,
                  activeClockEntry &&
                    styles.homeClockButtonTextActive,
                ]}
              >
                {activeClockEntry ? 'CLOCK OUT' : 'CLOCK IN'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.dashboardSectionTitle}>
        Quick actions
      </Text>

      <View style={styles.quickActionGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveTab('Career')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="school-outline" size={18} color="#D2B95B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Training</Text>
            <Text style={styles.quickActionText}>
              Update technical training
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#6F8091" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveTab('Jobs')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="briefcase-outline" size={18} color="#D2B95B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Trade Jobs</Text>
            <Text style={styles.quickActionText}>
              Browse current openings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#6F8091" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveTab('Profile')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="person-outline" size={18} color="#D2B95B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Profile</Text>
            <Text style={styles.quickActionText}>
              Trade identity and credentials
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#6F8091" />
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardSectionHeaderRow}>
        <Text style={styles.dashboardSectionTitle}>
          Recent activity
        </Text>
        <TouchableOpacity onPress={() => setActiveTab('Career')}>
          <Text style={styles.dashboardSectionLink}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentActivityCard}>
        {recentCareerActivity.length > 0 ? (
          recentCareerActivity.map((entry, index) => (
            <View
              key={entry.id}
              style={[
                styles.recentActivityRow,
                index < recentCareerActivity.length - 1 &&
                  styles.recentActivityRowBorder,
              ]}
            >
              <View style={styles.recentActivityIcon}>
                <Ionicons name="time-outline" size={16} color="#D2B95B" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.recentActivityTitle}>
                  {formatHours(entry.hours)} hours logged
                </Text>
                <Text style={styles.recentActivityMeta}>
                  {entry.company_name || 'Company not set'}
                  {entry.work_type ? ` · ${entry.work_type}` : ''}
                </Text>
              </View>

              <Text style={styles.recentActivityDate}>
                {formatDate(entry.work_date)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.recentActivityEmpty}>
            <Ionicons name="time-outline" size={18} color="#6F8091" />
            <Text style={styles.recentActivityEmptyText}>
              No hours logged yet.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export function TradespersonCareerOverview({
  profile,
  careerOverviewExpanded,
  setCareerOverviewExpanded,
  currentPeriodNumber,
  periodNumbers,
  currentPeriodProgress,
  currentPeriodPercentage,
  currentPeriodRemaining,
  currentTraining,
  totalHours,
  assignedHours,
  totalRequiredHours,
  setActiveTab,
  setHoursMessage,
  setNewCompany,
  setNewPeriod,
  setNewWorkType,
  setShowHoursModal,
}: {
  profile: UserProfile | null;
  careerOverviewExpanded: boolean;
  setCareerOverviewExpanded: Dispatch<SetStateAction<boolean>>;
  currentPeriodNumber: number | null;
  periodNumbers: number[];
  currentPeriodProgress: PeriodProgressItem | undefined;
  currentPeriodPercentage: number;
  currentPeriodRemaining: number | null;
  currentTraining: TechnicalTrainingEntry | undefined;
  totalHours: number;
  assignedHours: number;
  totalRequiredHours: number | null;
  setActiveTab: (tab: TabName) => void;
  setHoursMessage: Dispatch<SetStateAction<string>>;
  setNewCompany: Dispatch<SetStateAction<string>>;
  setNewPeriod: Dispatch<SetStateAction<number | null>>;
  setNewWorkType: Dispatch<SetStateAction<string>>;
  setShowHoursModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <View style={styles.careerOverviewCard}>
      <TouchableOpacity
        style={styles.careerOverviewHeader}
        activeOpacity={0.8}
        onPress={() =>
          setCareerOverviewExpanded((current) => !current)
        }
        accessibilityRole="button"
        accessibilityState={{ expanded: careerOverviewExpanded }}
        accessibilityLabel={
          careerOverviewExpanded
            ? 'Collapse career overview'
            : 'Expand career overview'
        }
      >
        <View style={styles.careerOverviewHeadingWrap}>
          <Text style={styles.careerOverviewEyebrow}>
            CAREER OVERVIEW
          </Text>
          <Text style={styles.careerOverviewTrade}>
            {profile?.trade || 'Trade not set'}
          </Text>
          <Text style={styles.careerOverviewLevel}>
            {profile?.apprenticeshipLevel || 'Apprenticeship level not set'}
          </Text>
        </View>

        <View style={styles.careerOverviewHeaderRight}>
          <View style={styles.careerOverviewBadge}>
            <Ionicons
              name="construct-outline"
              size={20}
              color="#D2B95B"
            />
          </View>

          <Ionicons
            name={
              careerOverviewExpanded
                ? 'chevron-up-outline'
                : 'chevron-down-outline'
            }
            size={20}
            color="#A9B3BF"
          />
        </View>
      </TouchableOpacity>

      <View style={styles.careerOverviewStatsRow}>
        <View style={styles.careerOverviewStat}>
          <Text style={styles.careerOverviewStatLabel}>
            TRACKED HOURS
          </Text>
          <Text style={styles.careerOverviewStatValue}>
            {formatHours(totalHours)}
          </Text>
        </View>

        <View style={styles.careerOverviewStatDivider} />

        <View style={styles.careerOverviewStat}>
          <Text style={styles.careerOverviewStatLabel}>
            CURRENT PERIOD
          </Text>
          <Text style={styles.careerOverviewStatValue}>
            {currentPeriodNumber ? `Period ${currentPeriodNumber}` : '—'}
          </Text>
        </View>

        {careerOverviewExpanded ? (
          <>
            <View style={styles.careerOverviewStatDivider} />

            <View style={styles.careerOverviewStat}>
              <Text style={styles.careerOverviewStatLabel}>
                TRAINING
              </Text>
              <Text
                style={[
                  styles.careerOverviewStatValue,
                  currentTraining?.status === 'Passed' && {
                    color: '#62B77A',
                  },
                  currentTraining?.status === 'Failed' && {
                    color: '#E56B6B',
                  },
                ]}
              >
                {currentTraining?.status || 'Not Started'}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {currentPeriodProgress ? (
        <View style={styles.careerOverviewProgressSection}>
          <View style={styles.careerOverviewProgressHeader}>
            <Text style={styles.careerOverviewProgressLabel}>
              PERIOD {currentPeriodNumber} HOURS
            </Text>
            <Text style={styles.careerOverviewProgressPercent}>
              {formatPercentage(currentPeriodPercentage)}
            </Text>
          </View>

          <Text style={styles.careerOverviewProgressValue}>
            {formatHours(currentPeriodProgress.loggedHours)} /{' '}
            {formatNumber(currentPeriodProgress.requiredHours)} hours
          </Text>

          <View style={styles.careerOverviewProgressTrack}>
            <View
              style={[
                styles.careerOverviewProgressFill,
                { width: `${currentPeriodPercentage}%` },
              ]}
            />
          </View>

          <Text style={styles.careerOverviewMilestone}>
            {currentPeriodRemaining === 0
              ? 'Required period hours reached.'
              : currentPeriodRemaining !== null
                ? `${formatNumber(currentPeriodRemaining)} hours remaining in this period`
                : 'Add hours to start tracking this period.'}
          </Text>
        </View>
      ) : (
        <View style={styles.careerOverviewEmptyProgress}>
          <Text style={styles.careerOverviewEmptyText}>
            Add apprenticeship hours to start tracking your current period.
          </Text>
        </View>
      )}

      {careerOverviewExpanded ? (
        <>
          <View style={styles.careerOverviewTrainingRow}>
            <View style={styles.careerOverviewTrainingIcon}>
              <Ionicons
                name="school-outline"
                size={18}
                color="#D2B95B"
              />
            </View>

            <View style={styles.careerOverviewTrainingCopy}>
              <Text style={styles.careerOverviewTrainingTitle}>
                Technical Training
              </Text>
              <Text style={styles.careerOverviewTrainingText}>
                {currentTraining?.school_name ||
                  (currentTraining?.status
                    ? `Period ${currentPeriodNumber} — ${currentTraining.status}`
                    : 'No training provider added for this period yet.')}
              </Text>
            </View>
          </View>

          <View style={styles.careerOverviewActions}>
            <TouchableOpacity
              style={styles.careerOverviewPrimaryButton}
              onPress={() => {
                setHoursMessage('');
                setNewPeriod(
                  currentPeriodNumber ?? periodNumbers[0] ?? null
                );
                setNewCompany('');
                setNewWorkType('');
                setShowHoursModal(true);
              }}
            >
              <Ionicons name="add" size={18} color="#0B1623" />
              <Text style={styles.careerOverviewPrimaryButtonText}>
                LOG HOURS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.careerOverviewSecondaryButton}
              onPress={() => setActiveTab('Career')}
            >
              <Text style={styles.careerOverviewSecondaryButtonText}>
                VIEW CAREER
              </Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color="#D2B95B"
              />
            </TouchableOpacity>
          </View>

          {totalRequiredHours ? (
            <Text style={styles.careerOverviewOverallNote}>
              Overall: {formatHours(assignedHours)} /{' '}
              {formatNumber(totalRequiredHours)} assigned apprenticeship hours
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
