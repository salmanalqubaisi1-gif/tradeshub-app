import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ROLE_CONFIG } from '../../constants/home';
import type { JobPost, TabName, TradesHubRole } from '../../types/home';
import { styles } from './homeStyles';

// Contractor dashboard (Feed tab for the contractor role).
// JSX moved verbatim from src/app/home.tsx.

type RoleConfig = (typeof ROLE_CONFIG)[TradesHubRole];

export function ContractorWorkspace({
  role,
  contractorJobs,
  contractorActiveJobs,
  contractorDraftJobs,
  openCreateJob,
  setActiveTab,
}: {
  role: RoleConfig;
  contractorJobs: JobPost[];
  contractorActiveJobs: JobPost[];
  contractorDraftJobs: JobPost[];
  openCreateJob: () => void;
  setActiveTab: (tab: TabName) => void;
}) {
  return (
    <>
      <View style={styles.contractorOverviewGrid}>
        <View style={styles.contractorStatCard}>
          <Text style={styles.contractorStatLabel}>ACTIVE JOBS</Text>
          <Text style={styles.contractorStatValue}>
            {contractorActiveJobs.length}
          </Text>
          <Text style={styles.contractorStatHint}>
            Currently visible to tradespeople
          </Text>
        </View>

        <View style={styles.contractorStatCard}>
          <Text style={styles.contractorStatLabel}>DRAFTS</Text>
          <Text style={styles.contractorStatValue}>
            {contractorDraftJobs.length}
          </Text>
          <Text style={styles.contractorStatHint}>
            Job posts waiting to publish
          </Text>
        </View>

        <View style={styles.contractorStatCard}>
          <Text style={styles.contractorStatLabel}>TOTAL POSTS</Text>
          <Text style={styles.contractorStatValue}>
            {contractorJobs.length}
          </Text>
          <Text style={styles.contractorStatHint}>
            All contractor-created jobs
          </Text>
        </View>
      </View>

      <View style={styles.contractorActionRow}>
        <TouchableOpacity
          style={styles.contractorPrimaryAction}
          onPress={openCreateJob}
        >
          <Ionicons name="add" size={18} color="#0B1623" />
          <Text style={styles.contractorPrimaryActionText}>
            POST A JOB
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contractorSecondaryAction}
          onPress={() => setActiveTab('Jobs')}
        >
          <Ionicons name="briefcase-outline" size={18} color={role.color} />
          <Text
            style={[
              styles.contractorSecondaryActionText,
              { color: role.color },
            ]}
          >
            MANAGE JOBS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contractorSecondaryAction}
          onPress={() => setActiveTab('Profile')}
        >
          <Ionicons name="business-outline" size={18} color={role.color} />
          <Text
            style={[
              styles.contractorSecondaryActionText,
              { color: role.color },
            ]}
          >
            COMPANY PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardSectionHeaderRow}>
        <Text style={styles.dashboardSectionTitle}>
          Recent job posts
        </Text>
        <TouchableOpacity onPress={() => setActiveTab('Jobs')}>
          <Text
            style={[
              styles.dashboardSectionLink,
              { color: role.color },
            ]}
          >
            VIEW ALL
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contractorRecentCard}>
        {contractorJobs.length > 0 ? (
          contractorJobs.slice(0, 3).map((job, index) => (
            <TouchableOpacity
              key={job.id}
              style={[
                styles.contractorRecentRow,
                index < Math.min(contractorJobs.length, 3) - 1 &&
                  styles.contractorRecentRowBorder,
              ]}
              onPress={() => setActiveTab('Jobs')}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.contractorRecentIcon,
                  { borderColor: role.color },
                ]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={17}
                  color={role.color}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.contractorRecentTitle}>
                  {job.title}
                </Text>
                <Text style={styles.contractorRecentMeta}>
                  {job.trade} · {job.city}, {job.province}
                </Text>
              </View>

              <View
                style={[
                  styles.contractorStatusBadge,
                  job.status === 'active'
                    ? styles.contractorStatusActive
                    : styles.contractorStatusDraft,
                ]}
              >
                <Text style={styles.contractorStatusText}>
                  {job.status.toUpperCase()}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#6F8091"
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.contractorEmptyState}>
            <Ionicons
              name="briefcase-outline"
              size={22}
              color={role.color}
            />
            <Text style={styles.contractorEmptyTitle}>
              No job posts yet
            </Text>
            <Text style={styles.contractorEmptyText}>
              Create your first opening and start building your hiring pipeline.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
