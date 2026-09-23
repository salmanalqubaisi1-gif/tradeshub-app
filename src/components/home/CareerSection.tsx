import { Ionicons } from '@expo/vector-icons';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type {
  HoursEntry,
  HoursView,
  TechnicalTrainingEntry,
  UserProfile,
} from '../../types/home';
import {
  formatCareerLevel,
  formatDate,
  formatHours,
  formatNumber,
  formatPercentage,
} from './HomeShared';
import { styles } from './homeStyles';

// Tradesperson Career tab: progress accordion, hours tracking and
// technical training. JSX moved verbatim from src/app/home.tsx; all state,
// calculations and handlers stay in HomeScreen.

export type HoursViewData = {
  entries: HoursEntry[];
  total: number;
  today: Date;
  year: number;
  month: number;
  weekStart: Date;
  weekEnd: Date;
};

export type HoursBreakdownRow = {
  key: string;
  label: string;
  total: number;
};

export type PeriodProgressItem = {
  periodNumber: number;
  loggedHours: number;
  requiredHours: number;
  percentage: number;
};

export function CareerSection({
  profile,
  careerLevels,
  periodNumbers,
  currentPeriodNumber,
  careerProgressExpanded,
  setCareerProgressExpanded,
  careerHoursExpanded,
  setCareerHoursExpanded,
  careerMilestonesExpanded,
  setCareerMilestonesExpanded,
  periodRequirements,
  periodProgress,
  totalHours,
  totalRequiredHours,
  assignedHours,
  unassignedHours,
  overallProgressPercentage,
  activeClockEntry,
  completedHoursEntries,
  clockActionLoading,
  clockMessage,
  handleClockIn,
  handleClockOut,
  hoursLoading,
  hoursView,
  setHoursView,
  hoursViewData,
  hoursBreakdown,
  isHistoricalBulkEntry,
  openEntryMenu,
  setHoursMessage,
  setNewCompany,
  setNewPeriod,
  setNewWorkType,
  setShowHoursModal,
  trainingEntries,
  trainingLoading,
  openTraining,
}: {
  profile: UserProfile | null;
  careerLevels: string[];
  periodNumbers: number[];
  currentPeriodNumber: number | null;
  careerProgressExpanded: boolean;
  setCareerProgressExpanded: Dispatch<SetStateAction<boolean>>;
  careerHoursExpanded: boolean;
  setCareerHoursExpanded: Dispatch<SetStateAction<boolean>>;
  careerMilestonesExpanded: boolean;
  setCareerMilestonesExpanded: Dispatch<SetStateAction<boolean>>;
  periodRequirements: number[];
  periodProgress: PeriodProgressItem[];
  totalHours: number;
  totalRequiredHours: number | null;
  assignedHours: number;
  unassignedHours: number;
  overallProgressPercentage: number;
  activeClockEntry: HoursEntry | null;
  completedHoursEntries: HoursEntry[];
  clockActionLoading: boolean;
  clockMessage: string;
  handleClockIn: () => void;
  handleClockOut: () => void;
  hoursLoading: boolean;
  hoursView: HoursView;
  setHoursView: Dispatch<SetStateAction<HoursView>>;
  hoursViewData: HoursViewData;
  hoursBreakdown: HoursBreakdownRow[];
  isHistoricalBulkEntry: (entry: HoursEntry) => boolean;
  openEntryMenu: (entry: HoursEntry) => void;
  setHoursMessage: Dispatch<SetStateAction<string>>;
  setNewCompany: Dispatch<SetStateAction<string>>;
  setNewPeriod: Dispatch<SetStateAction<number | null>>;
  setNewWorkType: Dispatch<SetStateAction<string>>;
  setShowHoursModal: Dispatch<SetStateAction<boolean>>;
  trainingEntries: TechnicalTrainingEntry[];
  trainingLoading: boolean;
  openTraining: (periodNumber: number) => void;
}) {
  return (
    <View>
      <Text style={styles.pageTitle}>
        Career
      </Text>

      <Text style={styles.pageSubtitle}>
        Track your apprenticeship and career progress.
      </Text>

      <View style={styles.careerHeaderCard}>
        <View style={styles.careerIcon}>
          <Ionicons
            name="hammer-outline"
            size={28}
            color="#0D1B2A"
          />
        </View>

        <View>
          <Text style={styles.careerTrade}>
            {profile?.trade}
          </Text>

          <Text style={styles.careerLevel}>
            {profile?.apprenticeshipLevel}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.careerSectionHeader}
        onPress={() => setCareerProgressExpanded((current) => !current)}
        activeOpacity={0.85}
      >
        <View style={styles.careerSectionHeaderLeft}>
          <View style={styles.careerSectionHeaderIcon}>
            <Ionicons name="trending-up-outline" size={19} color="#D2B95B" />
          </View>
          <View>
            <Text style={styles.careerSectionHeaderTitle}>
              Apprenticeship Progress
            </Text>
            <Text style={styles.careerSectionHeaderMeta}>
              Period status and advancement
            </Text>
          </View>
        </View>
        <Ionicons
          name={careerProgressExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#D2B95B"
        />
      </TouchableOpacity>

      {careerProgressExpanded ? (
        <>
      <View style={styles.progressCard}>
        {careerLevels.map(
          (level, index) => {
            const isJourneyperson = level === 'Journeyperson';
            const periodNumber = isJourneyperson ? null : index + 1;

            const periodData =
              periodNumber !== null
                ? periodProgress.find(
                    (period) => period.periodNumber === periodNumber
                  )
                : undefined;

            const trainingData =
              periodNumber !== null
                ? trainingEntries.find(
                    (entry) => entry.period_number === periodNumber
                  )
                : undefined;

            const hoursComplete =
              periodData !== undefined &&
              periodData.requiredHours > 0 &&
              periodData.loggedHours >= periodData.requiredHours;

            const trainingPassed = trainingData?.status === 'Passed';
            const trainingFailed = trainingData?.status === 'Failed';

            const historical =
              !isJourneyperson &&
              periodNumber !== null &&
              currentPeriodNumber !== null &&
              periodNumber < currentPeriodNumber;

            const verifiedCompleted =
              !isJourneyperson &&
              hoursComplete &&
              trainingPassed;

            const journeypersonCompleted =
              isJourneyperson &&
              periodProgress.length > 0 &&
              periodProgress.every(
                (period) =>
                  period.requiredHours > 0 &&
                  period.loggedHours >= period.requiredHours
              ) &&
              periodNumbers.every(
                (period) =>
                  trainingEntries.find(
                    (entry) => entry.period_number === period
                  )?.status === 'Passed'
              );

            const completed =
              verifiedCompleted ||
              journeypersonCompleted;

            const current =
              !completed &&
              !isJourneyperson &&
              periodNumber === currentPeriodNumber;

            const technicalTrainingRequired =
              !completed &&
              historical &&
              !trainingFailed;

            const failed =
              !completed &&
              !isJourneyperson &&
              trainingFailed &&
              periodNumber !== null &&
              currentPeriodNumber !== null &&
              periodNumber <= currentPeriodNumber;

            const locked =
              !completed &&
              !current &&
              !failed &&
              !technicalTrainingRequired;

            return (
              <View
                key={level}
                style={styles.progressRow}
              >
                <View
                  style={
                    styles.progressIndicatorColumn
                  }
                >
                  <View
                    style={[
                      styles.progressCircle,
                      completed &&
                        styles.progressCircleCompleted,
                      current &&
                        styles.progressCircleCurrent,
                      failed &&
                        styles.progressCircleFailed,
                      technicalTrainingRequired &&
                        styles.progressCircleHistorical,
                      locked &&
                        styles.progressCircleLocked,
                    ]}
                  >
                    {completed ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    ) : failed ? (
                      <Ionicons
                        name="close"
                        size={16}
                        color="#FFFFFF"
                      />
                    ) : current ? (
                      <View
                        style={
                          styles.currentDot
                        }
                      />
                    ) : technicalTrainingRequired ? (
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color="#CAAE53"
                      />
                    ) : locked ? (
                      <Ionicons
                        name="lock-closed"
                        size={13}
                        color="#7C8796"
                      />
                    ) : null}
                  </View>

                  {index <
                    careerLevels.length -
                      1 && (
                    <View
                      style={[
                        styles.progressLine,
                        completed &&
                          styles.progressLineCompleted,
                      ]}
                    />
                  )}
                </View>

                <View
                  style={
                    styles.progressTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.progressLabel,
                      current &&
                        styles.progressLabelCurrent,
                      completed &&
                        styles.progressLabelCompleted,
                      failed &&
                        styles.progressLabelFailed,
                      technicalTrainingRequired &&
                        styles.progressLabelHistorical,
                      locked &&
                        styles.progressLabelLocked,
                    ]}
                  >
                    {formatCareerLevel(
                      level
                    )}
                  </Text>

                  {current && (
                    <Text
                      style={
                        styles.currentLabel
                      }
                    >
                      CURRENT
                    </Text>
                  )}

                  {completed && (
                    <Text
                      style={
                        styles.completedLabel
                      }
                    >
                      COMPLETED
                    </Text>
                  )}

                  {failed && (
                    <Text
                      style={
                        styles.failedLabel
                      }
                    >
                      ACTION REQUIRED
                    </Text>
                  )}

                  {technicalTrainingRequired && (
                    <Text
                      style={
                        styles.historicalLabel
                      }
                    >
                      TECHNICAL TRAINING REQUIRED
                    </Text>
                  )}

                  {locked && (
                    <Text
                      style={
                        styles.lockedLabel
                      }
                    >
                      LOCKED
                    </Text>
                  )}
                </View>
              </View>
            );
          }
        )}
      </View>

        </>
      ) : null}

      <TouchableOpacity
        style={styles.careerSectionHeader}
        onPress={() => setCareerHoursExpanded((current) => !current)}
        activeOpacity={0.85}
      >
        <View style={styles.careerSectionHeaderLeft}>
          <View style={styles.careerSectionHeaderIcon}>
            <Ionicons name="time-outline" size={19} color="#D2B95B" />
          </View>
          <View>
            <Text style={styles.careerSectionHeaderTitle}>
              Hours & Apprenticeship
            </Text>
            <Text style={styles.careerSectionHeaderMeta}>
              {formatHours(totalHours)} tracked · {formatPercentage(overallProgressPercentage)} overall
            </Text>
          </View>
        </View>
        <Ionicons
          name={careerHoursExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#D2B95B"
        />
      </TouchableOpacity>

      {careerHoursExpanded ? (
        <>
      <View style={styles.hoursCard}>
        <View style={styles.hoursTopRow}>
          <View>
            <Text style={styles.hoursLabel}>
              Apprenticeship Hours
            </Text>

            {hoursLoading ? (
              <ActivityIndicator
                color="#CAAE53"
                style={styles.hoursLoader}
              />
            ) : (
              <Text style={styles.hoursValue}>
                {formatHours(totalHours)} hours
              </Text>
            )}
          </View>

          <View style={styles.hoursIcon}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#CAAE53"
            />
          </View>
        </View>

        <Text style={styles.hoursHint}>
          Track hours worked throughout your apprenticeship.
        </Text>

        <View
          style={[
            styles.clockCard,
            activeClockEntry && styles.clockCardActive,
          ]}
        >
          <View style={styles.clockCardHeader}>
            <View>
              <Text style={styles.clockEyebrow}>
                LIVE SHIFT TRACKING
              </Text>

              <Text style={styles.clockStatusTitle}>
                {activeClockEntry
                  ? 'You are clocked in'
                  : 'Ready to start your shift'}
              </Text>

              <Text style={styles.clockStatusMeta}>
                {activeClockEntry?.clock_in
                  ? `Started ${new Date(
                      activeClockEntry.clock_in
                    ).toLocaleTimeString('en-CA', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`
                  : 'Clock in when your workday begins.'}
              </Text>
            </View>

            <View
              style={[
                styles.clockLiveDot,
                activeClockEntry && styles.clockLiveDotActive,
              ]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.clockButton,
              activeClockEntry
                ? styles.clockOutButton
                : styles.clockInButton,
              clockActionLoading && styles.disabledButton,
            ]}
            onPress={
              activeClockEntry
                ? handleClockOut
                : handleClockIn
            }
            disabled={clockActionLoading}
          >
            {clockActionLoading ? (
              <ActivityIndicator
                color={
                  activeClockEntry
                    ? '#FFFFFF'
                    : '#0D1B2A'
                }
              />
            ) : (
              <>
                <Ionicons
                  name={
                    activeClockEntry
                      ? 'stop-circle-outline'
                      : 'play-circle-outline'
                  }
                  size={20}
                  color={
                    activeClockEntry
                      ? '#FFFFFF'
                      : '#0D1B2A'
                  }
                />

                <Text
                  style={[
                    styles.clockButtonText,
                    activeClockEntry &&
                      styles.clockOutButtonText,
                  ]}
                >
                  {activeClockEntry
                    ? 'CLOCK OUT'
                    : 'CLOCK IN'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {clockMessage ? (
            <Text style={styles.clockMessage}>
              {clockMessage}
            </Text>
          ) : null}

          <Text style={styles.clockDisclaimer}>
            Tracked time is not automatically official apprenticeship credit.
            Reconcile it with your pay stub before confirming qualifying hours.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addHoursButton}
          onPress={() => {
            setHoursMessage('');
            setNewPeriod(currentPeriodNumber ?? periodNumbers[0] ?? null);
            setNewCompany('');
            setNewWorkType('');
            setShowHoursModal(true);
          }}
        >
          <Ionicons
            name="add"
            size={20}
            color="#0D1B2A"
          />

          <Text style={styles.addHoursText}>
            ADD HOURS
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.overallSectionTitle}>
        Overall Apprenticeship
      </Text>

      {periodRequirements.length > 0 && totalRequiredHours ? (
        <View style={styles.officialProgressCard}>
          <View style={styles.overallProgressHeader}>
            <View style={styles.overallProgressText}>
              <Text style={styles.officialProgressLabel}>
                Overall Apprenticeship
              </Text>
              <Text style={styles.overallProgressSubLabel}>
                Total confirmed apprenticeship hours
              </Text>

              <Text style={styles.officialProgressValue}>
                {formatHours(assignedHours)} / {formatNumber(totalRequiredHours)} hours
              </Text>
            </View>

            <Text style={styles.officialProgressPercent}>
              {formatPercentage(overallProgressPercentage)}
            </Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${overallProgressPercentage}%` },
              ]}
            />
          </View>

          {unassignedHours > 0 && (
            <View style={styles.unassignedWarning}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#CAAE53"
              />

              <Text style={styles.unassignedWarningText}>
                {formatHours(unassignedHours)} unassigned hours are not included in official period progress. Edit those entries and choose a period.
              </Text>
            </View>
          )}

          <View style={styles.periodProgressDivider} />

          {periodProgress.map((period, index) => {
            const training = trainingEntries.find(
              (entry) => entry.period_number === period.periodNumber
            );

            const hoursComplete =
              period.requiredHours > 0 &&
              period.loggedHours >= period.requiredHours;

            const verifiedCompleted =
              hoursComplete &&
              training?.status === 'Passed';

            const historical =
              currentPeriodNumber !== null &&
              period.periodNumber < currentPeriodNumber;

            const completed =
              verifiedCompleted;

            const current =
              !completed &&
              period.periodNumber === currentPeriodNumber;

            const previousPeriod =
              period.periodNumber > 1
                ? periodProgress.find(
                    (item) =>
                      item.periodNumber === period.periodNumber - 1
                  )
                : undefined;

            const tentativeCarryoverHours =
              previousPeriod &&
              previousPeriod.requiredHours > 0
                ? Math.max(
                    previousPeriod.loggedHours -
                      previousPeriod.requiredHours,
                    0
                  )
                : 0;

            const confirmedPercentage =
              period.requiredHours > 0
                ? Math.min(
                    (period.loggedHours / period.requiredHours) * 100,
                    100
                  )
                : 0;

            const tentativePercentage =
              period.requiredHours > 0
                ? Math.min(
                    (tentativeCarryoverHours /
                      period.requiredHours) *
                      100,
                    Math.max(100 - confirmedPercentage, 0)
                  )
                : 0;

            const failed =
              !completed &&
              training?.status === 'Failed' &&
              currentPeriodNumber !== null &&
              period.periodNumber <= currentPeriodNumber;

            const technicalTrainingRequired =
              !completed &&
              historical &&
              !failed;

            const locked =
              !completed &&
              !current &&
              !failed &&
              !technicalTrainingRequired;

            const statusLabel = completed
              ? 'COMPLETED'
              : failed
                ? 'ACTION REQUIRED'
                : current
                  ? 'CURRENT'
                  : technicalTrainingRequired
                    ? 'TECHNICAL TRAINING REQUIRED'
                    : 'LOCKED';

            const remainingHours = Math.max(
              period.requiredHours - period.loggedHours,
              0
            );

            return (
              <View
                key={period.periodNumber}
                style={[
                  styles.periodProgressItem,
                  completed && styles.periodProgressItemCompleted,
                  current && styles.periodProgressItemCurrent,
                  failed && styles.periodProgressItemFailed,
                  locked && styles.periodProgressItemLocked,
                  index < periodProgress.length - 1 &&
                    styles.periodProgressItemBorder,
                ]}
              >
                <View style={styles.periodProgressHeader}>
                  <View style={styles.periodProgressTitleBlock}>
                    <View style={styles.periodProgressTitleRow}>
                      <Ionicons
                        name={
                          completed
                            ? 'checkmark-circle'
                            : failed
                              ? 'close-circle'
                              : current
                                ? 'ellipse'
                                : technicalTrainingRequired
                                  ? 'document-text-outline'
                                  : 'lock-closed'
                        }
                        size={21}
                        color={
                          completed
                            ? '#3FA66B'
                            : failed
                              ? '#E56B6B'
                              : current
                                ? '#CAAE53'
                                : technicalTrainingRequired
                                  ? '#CAAE53'
                                  : '#667483'
                        }
                      />

                      <Text
                        style={[
                          styles.periodProgressTitle,
                          completed && styles.periodProgressTitleCompleted,
                          locked && styles.periodProgressTitleLocked,
                        ]}
                      >
                        Period {period.periodNumber}
                      </Text>

                      <View
                        style={[
                          styles.periodStatusBadge,
                          completed && styles.periodStatusBadgeCompleted,
                          current && styles.periodStatusBadgeCurrent,
                          failed && styles.periodStatusBadgeFailed,
                          technicalTrainingRequired && styles.periodStatusBadgeHistorical,
                          locked && styles.periodStatusBadgeLocked,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodStatusBadgeText,
                            completed && styles.periodStatusTextCompleted,
                            current && styles.periodStatusTextCurrent,
                            failed && styles.periodStatusTextFailed,
                            technicalTrainingRequired && styles.periodStatusTextHistorical,
                            locked && styles.periodStatusTextLocked,
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.periodProgressHours}>
                      {formatHours(period.loggedHours)} / {formatNumber(period.requiredHours)} confirmed hours
                    </Text>

                    {tentativeCarryoverHours > 0 ? (
                      <View style={styles.carryoverRow}>
                        <View style={styles.carryoverDot} />
                        <Text style={styles.carryoverText}>
                          +{formatHours(tentativeCarryoverHours)} pending carryover
                        </Text>
                      </View>
                    ) : null}

                    {!completed && period.requiredHours > 0 ? (
                      <Text style={styles.periodRemainingHours}>
                        {formatNumber(remainingHours)} confirmed hours remaining
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.periodProgressPercent,
                      completed && { color: '#3FA66B' },
                      failed && { color: '#E56B6B' },
                      locked && { color: '#7C8796' },
                    ]}
                  >
                    {formatPercentage(period.percentage)}
                  </Text>
                </View>

                <View style={styles.periodProgressBarTrack}>
                  <View
                    style={[
                      styles.periodProgressBarFill,
                      completed && styles.periodProgressBarCompleted,
                      current && styles.periodProgressBarCurrent,
                      failed && styles.periodProgressBarFailed,
                      locked && styles.periodProgressBarLocked,
                      { width: `${confirmedPercentage}%` },
                    ]}
                  />
                  {tentativePercentage > 0 ? (
                    <View
                      style={[
                        styles.periodProgressBarTentative,
                        {
                          left: `${confirmedPercentage}%`,
                          width: `${tentativePercentage}%`,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                {tentativeCarryoverHours > 0 ? (
                  <Text style={styles.carryoverNote}>
                    Blue = pending carryover only. It does not count as confirmed progress until accepted.
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.requirementsUnavailableCard}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#CAAE53"
          />

          <View style={styles.requirementsUnavailableText}>
            <Text style={styles.requirementsUnavailableTitle}>
              Official hour requirements coming soon
            </Text>

            <Text style={styles.requirementsUnavailableSubtitle}>
              Your logged hours are saved, but verified period-hour requirements have not been added for this trade yet.
            </Text>
          </View>
        </View>
      )}

      {completedHoursEntries.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Hours History
          </Text>

          <View style={styles.hoursHistoryCard}>
            <View style={styles.hoursViewTabs}>
              {(
                [
                  ['week', 'WEEK'],
                  ['month', 'MONTH'],
                  ['year', 'YEAR'],
                  ['all', 'ALL'],
                ] as [HoursView, string][]
              ).map(([value, label]) => {
                const selected = hoursView === value;

                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.hoursViewTab,
                      selected && styles.hoursViewTabSelected,
                    ]}
                    onPress={() => setHoursView(value)}
                  >
                    <Text
                      style={[
                        styles.hoursViewTabText,
                        selected &&
                          styles.hoursViewTabTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.hoursViewSummary}>
              <View>
                <Text style={styles.hoursViewSummaryLabel}>
                  {hoursView === 'week'
                    ? 'THIS WEEK'
                    : hoursView === 'month'
                      ? 'THIS MONTH'
                      : hoursView === 'year'
                        ? 'THIS YEAR'
                        : 'ALL-TIME TRACKED'}
                </Text>

                <Text style={styles.hoursViewSummaryValue}>
                  {formatHours(hoursViewData.total)} hrs
                </Text>
              </View>

              <Ionicons
                name="bar-chart-outline"
                size={24}
                color="#CAAE53"
              />
            </View>

            <View style={styles.hoursBreakdownList}>
              {hoursBreakdown.map((row, index) => (
                <View
                  key={row.key}
                  style={[
                    styles.hoursBreakdownRow,
                    index < hoursBreakdown.length - 1 &&
                      styles.hoursBreakdownRowBorder,
                  ]}
                >
                  <Text style={styles.hoursBreakdownLabel}>
                    {row.label}
                  </Text>

                  <Text style={styles.hoursBreakdownValue}>
                    {formatHours(row.total)} hrs
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.hoursHistoryDivider} />

            <Text style={styles.hoursEntriesTitle}>
              {hoursView === 'week'
                ? 'This week’s entries'
                : hoursView === 'month'
                  ? 'This month’s entries'
                  : hoursView === 'year'
                    ? 'This year’s entries'
                    : 'All entries'}
            </Text>

            {hoursViewData.entries.length > 0 ? (
              hoursViewData.entries
                .slice()
                .sort((a, b) =>
                  b.work_date.localeCompare(a.work_date)
                )
                .slice(0, hoursView === 'all' ? 25 : 15)
                .map((entry, index, array) => {
                  const historical =
                    isHistoricalBulkEntry(entry);

                  return (
                    <View
                      key={entry.id}
                      style={[
                        styles.hoursEntry,
                        index < array.length - 1 &&
                          styles.hoursEntryBorder,
                      ]}
                    >
                      <View style={styles.hoursEntryText}>
                        <View style={styles.hoursEntryTitleRow}>
                          <Text style={styles.hoursEntryAmount}>
                            {formatHours(entry.hours)} hours
                          </Text>

                          {historical ? (
                            <View
                              style={
                                styles.historicalHoursBadge
                              }
                            >
                              <Text
                                style={
                                  styles.historicalHoursBadgeText
                                }
                              >
                                PAST HOURS
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text style={styles.periodBadgeText}>
                          {entry.period_number
                            ? `Period ${entry.period_number}`
                            : 'Unassigned'}
                        </Text>

                        <Text style={styles.hoursEntryDate}>
                          {historical &&
                          entry.historical_start_date &&
                          entry.historical_end_date
                            ? `${formatDate(
                                entry.historical_start_date
                              )} – ${formatDate(
                                entry.historical_end_date
                              )}`
                            : formatDate(entry.work_date)}
                        </Text>

                        <View style={styles.hoursEntryMetaRow}>
                          <Text style={styles.hoursEntrySource}>
                            {historical
                              ? 'PAST HOURS'
                              : entry.entry_source === 'clock'
                                ? 'CLOCKED'
                                : 'MANUAL'}
                          </Text>

                          <Text style={styles.hoursEntryStatus}>
                            {(
                              entry.reconciliation_status ||
                              'tracked'
                            ).toUpperCase()}
                          </Text>
                        </View>

                        {entry.company_name ? (
                          <Text style={styles.hoursEntryCompany}>
                            {entry.company_name}
                          </Text>
                        ) : null}

                        {entry.note ? (
                          <Text style={styles.hoursEntryNote}>
                            {entry.note}
                          </Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        style={styles.entryMenuButton}
                        onPress={() => openEntryMenu(entry)}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={22}
                          color="#CAAE53"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })
            ) : (
              <View style={styles.hoursEmptyState}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#7C8796"
                />
                <Text style={styles.hoursEmptyStateText}>
                  No tracked hours in this period yet.
                </Text>
              </View>
            )}

            {hoursView === 'all' &&
            hoursViewData.entries.length > 25 ? (
              <Text style={styles.hoursHistoryLimitNote}>
                Showing the latest 25 entries. Full searchable history
                can be added later.
              </Text>
            ) : null}
          </View>
        </>
      )}

        </>
      ) : null}

      <TouchableOpacity
        style={styles.careerSectionHeader}
        onPress={() => setCareerMilestonesExpanded((current) => !current)}
        activeOpacity={0.85}
      >
        <View style={styles.careerSectionHeaderLeft}>
          <View style={styles.careerSectionHeaderIcon}>
            <Ionicons name="school-outline" size={19} color="#D2B95B" />
          </View>
          <View>
            <Text style={styles.careerSectionHeaderTitle}>
              Training & Credentials
            </Text>
            <Text style={styles.careerSectionHeaderMeta}>
              Technical training, marks and qualifications
            </Text>
          </View>
        </View>
        <Ionicons
          name={careerMilestonesExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#D2B95B"
        />
      </TouchableOpacity>

      {careerMilestonesExpanded ? (
        <>
      <View style={styles.trainingCard}>
        {trainingLoading ? (
          <ActivityIndicator color="#CAAE53" />
        ) : (
          periodNumbers.map((period, index) => {
            const training = trainingEntries.find((entry) => entry.period_number === period);
            const status = training?.status || 'Not Started';
            const passed = status === 'Passed';
            const failed = status === 'Failed';
            const inProgress = status === 'In Progress';
            const futureLocked =
              currentPeriodNumber !== null &&
              period > currentPeriodNumber;

            return (
              <TouchableOpacity
                key={period}
                style={[
                  styles.trainingRow,
                  passed && styles.trainingRowPassed,
                  failed && styles.trainingRowFailed,
                  inProgress && styles.trainingRowInProgress,
                  futureLocked && styles.trainingRowLocked,
                  index < periodNumbers.length - 1 && styles.trainingRowBorder,
                ]}
                onPress={() => openTraining(period)}
                disabled={futureLocked}
              >
                <View style={[
                  styles.trainingStatusIcon,
                  passed && styles.trainingStatusPassed,
                  failed && {
                    backgroundColor: '#C94B4B',
                    borderColor: '#C94B4B',
                  },
                  inProgress && styles.trainingStatusCurrent,
                ]}>
                  <Ionicons
                    name={
                      futureLocked
                        ? 'lock-closed'
                        : passed
                          ? 'checkmark'
                          : failed
                            ? 'close'
                            : 'school-outline'
                    }
                    size={18}
                    color={
                      futureLocked
                        ? '#7C8796'
                        : passed || failed
                          ? '#FFFFFF'
                          : '#CAAE53'
                    }
                  />
                </View>

                <View style={styles.trainingRowText}>
                  <Text style={styles.trainingPeriodTitle}>Period {period} Technical Training</Text>
                  <Text style={[
                    styles.trainingStatusText,
                    passed && styles.trainingPassedText,
                    failed && { color: '#E56B6B' },
                    inProgress && { color: '#CAAE53' },
                  ]}>
                    {futureLocked ? 'LOCKED' : status.toUpperCase()}
                  </Text>
                  {training?.school_name ? (
                    <Text style={styles.trainingMeta}>{training.school_name}</Text>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={20} color="#7C8796" />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.milestoneCard}>
        <View style={styles.milestoneIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#CAAE53"
          />
        </View>

        <View
          style={
            styles.milestoneTextContainer
          }
        >
          <Text
            style={
              styles.milestoneTitle
            }
          >
            Credentials
          </Text>

          <Text
            style={
              styles.milestoneSubtitle
            }
          >
            Red Seal, certifications and future trade qualifications.
          </Text>
        </View>
      </View>
        </>
      ) : null}
    </View>
  );
}
