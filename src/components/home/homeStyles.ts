import { StyleSheet } from 'react-native';

import { Brand, FontFamily } from '../../constants/theme';

// Shared styles for the Home screen and its extracted sections.
// Moved verbatim from src/app/home.tsx.
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },

  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D3042',
  },

  headerMobile: {
    minHeight: 116,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    rowGap: 10,
  },

  headerBrand: {
    flexShrink: 1,
    justifyContent: 'center',
  },

  headerBrandMobile: {
    width: '100%',
    alignItems: 'flex-start',
  },

  headerLogoImage: {
    width: 210,
    height: 44,
  },

  headerLogoImageMobile: {
    width: 168,
    height: 38,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerActionsMobile: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },

  roleSwitcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  roleSwitcherText: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  signOutButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderColor: '#26394C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleSwitcherBackdrop: {
    position: 'absolute',
    top: 72,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 90,
    backgroundColor: 'transparent',
  },

  roleSwitcherPanel: {
    position: 'absolute',
    top: 64,
    right: 24,
    zIndex: 100,
    width: 340,
    maxWidth: '88%',
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#30475B',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  roleSwitcherPanelMobile: {
    top: 108,
    right: 16,
    left: 16,
    width: 'auto',
    // Pre-existing web value (home.tsx was never type-checked); kept as-is.
    maxWidth: 'none' as any,
  },

  roleSwitcherTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  roleSwitcherSubtitle: {
    color: '#8391A0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 11,
  },

  roleSwitcherOption: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#25394B',
    borderRadius: 9,
    marginTop: 7,
    overflow: 'hidden',
  },

  roleSwitcherAddDivider: {
    height: 1,
    backgroundColor: '#25394B',
    marginTop: 10,
    marginBottom: 14,
  },

  roleSwitcherAddTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  roleSwitcherAddHelp: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 10,
  },

  roleSwitcherAddOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25394B',
    borderRadius: 9,
    padding: 10,
    marginTop: 7,
    gap: 10,
    backgroundColor: Brand.navy800,
  },

  roleSwitcherMainAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  roleSwitcherDeleteButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#25394B',
    backgroundColor: 'rgba(229, 107, 107, 0.04)',
  },

  roleSwitcherOptionIcon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleSwitcherOptionCopy: {
    flex: 1,
    marginLeft: 10,
  },

  roleSwitcherOptionTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  roleSwitcherOptionStatus: {
    color: '#748494',
    fontSize: 10,
    marginTop: 2,
  },

  roleHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderRadius: 11,
    padding: 14,
    marginBottom: 16,
  },

  roleHeroIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleHeroCopy: {
    flex: 1,
  },

  roleHeroEyebrow: {
    color: '#82909E',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  roleHeroTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
  },

  roleHeroText: {
    color: '#9BA7B4',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  careerOverviewCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#3A4652',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  careerOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    minHeight: 44,
  },

  careerOverviewHeadingWrap: {
    flex: 1,
  },

  careerOverviewHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  careerOverviewEyebrow: {
    color: '#D2B95B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.3,
    marginBottom: 5,
  },

  careerOverviewTrade: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.heading,
  },

  careerOverviewLevel: {
    color: '#9BA7B4',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 2,
  },

  careerOverviewBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#182435',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerOverviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },

  careerOverviewStat: {
    flexGrow: 1,
    flexBasis: 92,
    minWidth: 82,
    paddingHorizontal: 8,
  },

  careerOverviewStatDivider: {
    width: 1,
    minHeight: 42,
    backgroundColor: '#26394C',
  },

  careerOverviewStatLabel: {
    color: '#728294',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.9,
    marginBottom: 5,
  },

  careerOverviewStatValue: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  careerOverviewProgressSection: {
    marginBottom: 12,
  },

  careerOverviewProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  careerOverviewProgressLabel: {
    color: '#A9B3BF',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  careerOverviewProgressPercent: {
    color: '#D2B95B',
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  careerOverviewProgressValue: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.display,
    marginTop: 5,
  },

  careerOverviewProgressTrack: {
    height: 7,
    backgroundColor: '#1A2A3A',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 7,
  },

  careerOverviewProgressFill: {
    height: '100%',
    backgroundColor: '#D2B95B',
    borderRadius: 999,
  },

  careerOverviewMilestone: {
    color: '#82909E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  careerOverviewEmptyProgress: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  careerOverviewEmptyText: {
    color: '#82909E',
    fontSize: 12,
    lineHeight: 18,
  },

  careerOverviewTrainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 11,
    padding: 10,
  },

  careerOverviewTrainingIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerOverviewTrainingCopy: {
    flex: 1,
  },

  careerOverviewTrainingTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  careerOverviewTrainingText: {
    color: '#82909E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  careerOverviewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  careerOverviewPrimaryButton: {
    minHeight: 38,
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 9,
    backgroundColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  careerOverviewPrimaryButtonText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  careerOverviewSecondaryButton: {
    minHeight: 38,
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  careerOverviewSecondaryButtonText: {
    color: '#D2B95B',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  careerOverviewOverallNote: {
    color: '#667788',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    textAlign: 'center',
  },

  homeClockSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },

  homeClockSectionTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  homeClockSectionHint: {
    color: '#718193',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
  },

  homeClockCard: {
    backgroundColor: '#151F2B',
    borderWidth: 1.5,
    borderColor: '#D2B95B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  homeClockCardActive: {
    borderColor: '#62B77A',
    backgroundColor: '#10251F',
  },

  homeClockCopy: {
    flex: 1,
  },

  homeClockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },

  homeClockDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#6F8091',
  },

  homeClockDotActive: {
    backgroundColor: '#62B77A',
  },

  homeClockEyebrow: {
    color: '#D2B95B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.0,
  },

  homeClockTitle: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.heading,
  },

  homeClockMeta: {
    color: '#9AA7B4',
    fontSize: 11,
    marginTop: 4,
  },

  homeClockButton: {
    minWidth: 190,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },

  homeClockButtonActive: {
    backgroundColor: '#C94B4B',
  },

  homeClockButtonText: {
    color: '#0B1623',
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  homeClockButtonTextActive: {
    color: '#FFFFFF',
  },

  careerSectionHeader: {
    width: '100%',
    minHeight: 68,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  careerSectionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  careerSectionHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerSectionHeaderTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  careerSectionHeaderMeta: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  contractorOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },

  contractorStatCard: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 160,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 14,
  },

  contractorStatLabel: {
    color: '#7F8C99',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  contractorStatValue: {
    color: Brand.white,
    fontSize: 26,
    fontFamily: FontFamily.display,
    marginTop: 5,
  },

  contractorStatHint: {
    color: '#718193',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  contractorActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },

  contractorPrimaryAction: {
    minHeight: 44,
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 9,
    backgroundColor: '#4D9DE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  contractorPrimaryActionText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  contractorSecondaryAction: {
    minHeight: 44,
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#4D9DE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    backgroundColor: '#101F30',
  },

  contractorSecondaryActionText: {
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  contractorRecentCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },

  contractorRecentRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  contractorRecentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#223547',
  },

  contractorRecentIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contractorRecentTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  contractorRecentMeta: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  contractorStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  contractorStatusActive: {
    backgroundColor: 'rgba(98, 183, 122, 0.15)',
  },

  contractorStatusDraft: {
    backgroundColor: 'rgba(124, 135, 150, 0.15)',
  },

  contractorStatusText: {
    color: '#A9B3BF',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  contractorEmptyState: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  contractorEmptyTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginTop: 8,
  },

  contractorEmptyText: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    maxWidth: 360,
    marginTop: 4,
  },

  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },

  quickActionCard: {
    flexGrow: 1,
    flexBasis: 210,
    minHeight: 64,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  quickActionText: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  dashboardSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  dashboardSectionLink: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
    marginBottom: 9,
  },

  recentActivityCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },

  recentActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  recentActivityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#223547',
  },

  recentActivityIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#162536',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentActivityTitle: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  recentActivityMeta: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  recentActivityDate: {
    color: '#69798A',
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    textAlign: 'right',
    maxWidth: 105,
  },

  recentActivityEmpty: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
  },

  recentActivityEmptyText: {
    color: '#7F8C99',
    fontSize: 10,
  },

  dashboardSectionTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
    marginBottom: 9,
  },

  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  dashboardCard: {
    flexGrow: 1,
    flexBasis: 190,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 13,
  },

  dashboardIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  dashboardCardTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  dashboardCardText: {
    color: '#8F9CAA',
    fontSize: 10,
    lineHeight: 18,
    marginTop: 6,
  },

  feedSection: {
    marginTop: 28,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  pageTitle: {
    color: Brand.white,
    fontSize: 30,
    fontFamily: FontFamily.heading,
  },

  pageSubtitle: {
    color: '#A9B3BF',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 24,
  },

  placeholderCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 22,
    marginTop: 8,
  },

  cardTitle: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.bodyBold,
    marginTop: 14,
  },

  cardText: {
    color: '#A9B3BF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  loadingText: {
    color: '#A9B3BF',
    marginTop: 12,
  },

  careerHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  careerIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#CAAE53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  careerTrade: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.heading,
  },

  careerLevel: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  sectionTitle: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.heading,
    marginTop: 28,
    marginBottom: 12,
  },

  progressCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 20,
  },

  progressRow: {
    flexDirection: 'row',
    minHeight: 64,
  },

  progressIndicatorColumn: {
    width: 32,
    alignItems: 'center',
  },

  progressCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#46576A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.navy800,
  },

  progressCircleCompleted: {
    backgroundColor: '#3FA66B',
    borderColor: '#3FA66B',
  },

  progressCircleCurrent: {
    borderColor: '#CAAE53',
  },

  progressCircleFailed: {
    backgroundColor: '#C94B4B',
    borderColor: '#C94B4B',
  },

  progressCircleHistorical: {
    backgroundColor: Brand.navy800,
    borderColor: '#CAAE53',
  },

  progressCircleLocked: {
    backgroundColor: Brand.navy800,
    borderColor: '#46576A',
  },

  currentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#CAAE53',
  },

  progressLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#33465A',
  },

  progressLineCompleted: {
    backgroundColor: '#3FA66B',
  },

  progressTextContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
  },

  progressLabel: {
    color: '#7C8796',
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  progressLabelCompleted: {
    color: Brand.white,
    textDecorationLine: 'line-through',
    textDecorationColor: '#3FA66B',
  },

  progressLabelCurrent: {
    color: Brand.white,
  },

  progressLabelFailed: {
    color: Brand.white,
  },

  progressLabelHistorical: {
    color: Brand.white,
  },

  progressLabelLocked: {
    color: '#7C8796',
  },

  currentLabel: {
    color: '#CAAE53',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.8,
  },

  completedLabel: {
    color: '#3FA66B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  failedLabel: {
    color: '#E56B6B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  historicalLabel: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  lockedLabel: {
    color: '#667483',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  hoursCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 20,
  },

  hoursTopRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hoursLabel: {
    color: '#A9B3BF',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  hoursValue: {
    color: Brand.white,
    fontSize: 28,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  hoursLoader: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  hoursIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoursHint: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 12,
  },

  addHoursButton: {
    marginTop: 18,
    backgroundColor: '#CAAE53',
    borderRadius: 9,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  addHoursText: {
    color: '#0D1B2A',
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  clockCard: {
    marginTop: 18,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 12,
    padding: 15,
  },

  clockCardActive: {
    borderColor: '#62B77A',
    backgroundColor: 'rgba(98, 183, 122, 0.06)',
  },

  clockCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  clockEyebrow: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.8,
  },

  clockStatusTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  clockStatusMeta: {
    color: '#8F9CAA',
    fontSize: 11,
    marginTop: 4,
  },

  clockLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#46576A',
    marginTop: 3,
  },

  clockLiveDotActive: {
    backgroundColor: '#62B77A',
  },

  clockButton: {
    minHeight: 46,
    borderRadius: 9,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  clockInButton: {
    backgroundColor: '#62B77A',
  },

  clockOutButton: {
    backgroundColor: '#C94B4B',
  },

  clockButtonText: {
    color: '#0D1B2A',
    fontSize: 13,
    fontFamily: FontFamily.display,
    letterSpacing: 0.8,
  },

  clockOutButtonText: {
    color: Brand.white,
  },

  clockMessage: {
    color: Brand.gold500,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  clockDisclaimer: {
    color: '#718092',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
  },

  hoursEntryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  hoursEntrySource: {
    color: '#78A9FF',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  hoursEntryStatus: {
    color: Brand.gold500,
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  overallSectionTitle: {
    color: Brand.white,
    fontSize: 23,
    fontFamily: FontFamily.display,
    marginTop: 30,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  officialProgressCard: {
    backgroundColor: '#121C27',
    borderWidth: 2,
    borderColor: '#CAAE53',
    borderRadius: 16,
    padding: 24,
  },

  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  overallProgressText: {
    flex: 1,
  },

  officialProgressLabel: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.display,
  },

  overallProgressSubLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  officialProgressValue: {
    color: Brand.white,
    fontSize: 30,
    fontFamily: FontFamily.display,
    marginTop: 7,
  },

  officialProgressPercent: {
    color: '#CAAE53',
    fontSize: 24,
    fontFamily: FontFamily.display,
  },

  progressBarTrack: {
    height: 10,
    backgroundColor: '#101D2B',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#CAAE53',
    borderRadius: 999,
  },

  unassignedWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#1B2A37',
    borderWidth: 1,
    borderColor: '#564B2A',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },

  unassignedWarningText: {
    flex: 1,
    color: '#C7CED6',
    fontSize: 12,
    lineHeight: 18,
  },

  periodProgressDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginTop: 20,
  },

  periodProgressItem: {
    paddingVertical: 17,
    paddingHorizontal: 14,
    marginHorizontal: -6,
    borderRadius: 10,
  },

  periodProgressItemCompleted: {
    backgroundColor: 'rgba(63, 166, 107, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#3FA66B',
  },

  periodProgressItemCurrent: {
    backgroundColor: 'rgba(202, 174, 83, 0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#CAAE53',
  },

  periodProgressItemFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#C94B4B',
  },

  periodProgressItemLocked: {
    opacity: 0.72,
  },

  periodProgressItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  periodProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  periodProgressTitleBlock: {
    flex: 1,
  },

  periodProgressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  periodProgressTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
  },

  periodProgressTitleCompleted: {
    textDecorationLine: 'line-through',
    textDecorationColor: '#3FA66B',
  },

  periodProgressTitleLocked: {
    color: '#7C8796',
  },

  periodStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  periodStatusBadgeCompleted: {
    backgroundColor: '#3FA66B',
  },

  periodStatusBadgeCurrent: {
    backgroundColor: '#CAAE53',
  },

  periodStatusBadgeFailed: {
    backgroundColor: '#C94B4B',
  },

  periodStatusBadgeHistorical: {
    backgroundColor: '#6A5A23',
  },

  periodStatusBadgeLocked: {
    backgroundColor: '#33465A',
  },

  periodStatusBadgeText: {
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  periodStatusTextCompleted: {
    color: Brand.white,
  },

  periodStatusTextCurrent: {
    color: '#0D1B2A',
  },

  periodStatusTextFailed: {
    color: Brand.white,
  },

  periodStatusTextHistorical: {
    color: '#FFE8A3',
  },

  periodStatusTextLocked: {
    color: '#C7CED6',
  },

  periodProgressHours: {
    color: '#A9B3BF',
    fontSize: 12,
    marginTop: 6,
  },

  periodRemainingHours: {
    color: '#7C8796',
    fontSize: 11,
    marginTop: 3,
  },

  periodProgressPercent: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.display,
  },

  periodProgressBarTrack: {
    height: 8,
    backgroundColor: '#101D2B',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 11,
    position: 'relative',
  },

  periodProgressBarFill: {
    height: '100%',
    backgroundColor: '#CAAE53',
    borderRadius: 999,
  },

  periodProgressBarCompleted: {
    backgroundColor: '#3FA66B',
  },

  periodProgressBarCurrent: {
    backgroundColor: '#CAAE53',
  },

  periodProgressBarFailed: {
    backgroundColor: '#C94B4B',
  },

  periodProgressBarLocked: {
    backgroundColor: '#46576A',
  },

  periodProgressBarTentative: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#4C8DFF',
    opacity: 0.75,
  },

  carryoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  carryoverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4C8DFF',
  },

  carryoverText: {
    color: '#78A9FF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  carryoverNote: {
    color: '#78A9FF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 7,
  },

  requirementsUnavailableCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  requirementsUnavailableText: {
    flex: 1,
  },

  requirementsUnavailableTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
  },

  requirementsUnavailableSubtitle: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  recentHoursCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    paddingHorizontal: 18,
  },

  hoursEntry: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hoursEntryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  hoursEntryText: {
    flex: 1,
  },

  hoursEntryAmount: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  periodBadgeText: {
    color: '#CAAE53',
    fontSize: 12,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  hoursEntryDate: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  hoursEntryNote: {
    color: '#A9B3BF',
    fontSize: 13,
    marginTop: 5,
  },

  entryMenuButton: {
    padding: 12,
  },

  hoursHistoryCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  hoursViewTabs: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 16,
  },

  hoursViewTab: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#33465A',
    backgroundColor: '#101D2B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoursViewTabSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  hoursViewTabText: {
    color: '#8E9BA8',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  hoursViewTabTextSelected: {
    color: '#0D1B2A',
  },

  hoursViewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 10,
    padding: 10,
  },

  hoursViewSummaryLabel: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
  },

  hoursViewSummaryValue: {
    color: Brand.white,
    fontSize: 25,
    fontFamily: FontFamily.display,
    marginTop: 4,
  },

  hoursBreakdownList: {
    marginTop: 7,
  },

  hoursBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },

  hoursBreakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  hoursBreakdownLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  hoursBreakdownValue: {
    color: '#CAAE53',
    fontSize: 12,
    fontFamily: FontFamily.display,
  },

  hoursHistoryDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 16,
  },

  hoursEntriesTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  hoursEntryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  historicalHoursBadge: {
    backgroundColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  historicalHoursBadgeText: {
    color: '#C7CED6',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  hoursEntryCompany: {
    color: '#A9B3BF',
    fontSize: 12,
    marginTop: 5,
  },

  hoursEmptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
  },

  hoursEmptyStateText: {
    color: '#7C8796',
    fontSize: 12,
  },

  hoursHistoryLimitNote: {
    color: '#718092',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },

  trainingCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    paddingHorizontal: 18,
  },

  trainingRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: -10,
    borderRadius: 10,
  },

  trainingRowPassed: {
    backgroundColor: 'rgba(63, 166, 107, 0.08)',
  },

  trainingRowFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.08)',
  },

  trainingRowInProgress: {
    backgroundColor: 'rgba(202, 174, 83, 0.08)',
  },

  trainingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  trainingRowLocked: {
    opacity: 0.45,
  },

  trainingStatusBanner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: -6,
    marginBottom: 18,
  },

  trainingStatusBannerPassed: {
    backgroundColor: 'rgba(63, 166, 107, 0.12)',
    borderColor: '#3FA66B',
  },

  trainingStatusBannerFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.12)',
    borderColor: '#C94B4B',
  },

  trainingStatusBannerInProgress: {
    backgroundColor: 'rgba(202, 174, 83, 0.12)',
    borderColor: '#CAAE53',
  },

  trainingStatusBannerNotStarted: {
    backgroundColor: '#101D2B',
    borderColor: '#33465A',
  },

  trainingStatusBannerText: {
    color: '#A9B3BF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  trainingStatusBannerTextPassed: {
    color: '#5FBF82',
  },

  trainingStatusBannerTextFailed: {
    color: '#E56B6B',
  },

  trainingStatusBannerTextInProgress: {
    color: '#CAAE53',
  },

  aitUploadCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  aitUploadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  aitUploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#172B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aitUploadHeaderText: {
    flex: 1,
  },

  aitUploadTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  aitUploadSubtitle: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  progressReportGuideToggle: {
    marginTop: 13,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13263A',
  },

  progressReportGuideToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  progressReportGuideToggleText: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  progressReportGuide: {
    marginTop: 10,
    backgroundColor: '#0F1F30',
    borderWidth: 1,
    borderColor: '#263B50',
    borderRadius: 10,
    padding: 12,
  },

  progressReportGuideStep: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 5,
  },

  progressReportPrivacyNote: {
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#263B50',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },

  progressReportPrivacyText: {
    color: '#CAAE53',
    fontSize: 10,
    lineHeight: 15,
    flex: 1,
    fontFamily: FontFamily.bodyBold,
  },

  progressReportSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },

  progressReportSourceText: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  aitUploadButton: {
    marginTop: 13,
    backgroundColor: '#F6C84C',
    borderRadius: 9,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },

  aitUploadButtonText: {
    color: '#0D1B2A',
    fontSize: 12,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  aitUploadFileName: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 7,
  },

  aitUploadMessage: {
    color: '#F59E0B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  aitUploadSuccess: {
    color: '#34D399',
  },

  aitUploadReviewNote: {
    color: '#8F9DAD',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },

  trainingProviderList: {
    backgroundColor: '#13263A',
    borderWidth: 1,
    borderColor: '#263B50',
    borderRadius: 12,
    marginTop: -6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  trainingProviderOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#263B50',
  },
  trainingProviderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  trainingProviderName: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    flexShrink: 1,
  },
  trainingProviderMeta: {
    color: '#97A5B5',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  trainingProviderLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  trainingProviderEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trainingMarksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  trainingMarkField: {
    flex: 1,
  },
  trainingMarkLabel: {
    color: '#AEB9C6',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 6,
  },
  trainingPercentInputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 10,
    backgroundColor: '#102236',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  trainingPercentInput: {
    flex: 1,
    color: Brand.white,
    fontSize: 15,
    paddingVertical: 10,
  },
  trainingPercentSymbol: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },
  trainingResultCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  trainingResultTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginBottom: 5,
  },
  trainingResultText: {
    color: '#CAAE53',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },
  trainingResultNote: {
    color: '#8F9DAD',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  importedTrainingCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 13,
    marginBottom: 16,
  },

  importedTrainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  importedTrainingTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  importedTrainingMeta: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 17,
  },

  importedTrainingSection: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#263B50',
  },

  importedTrainingSectionTitle: {
    color: '#CAAE53',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    marginBottom: 5,
  },

  importedTrainingBreakdownText: {
    color: '#AEB9C6',
    fontSize: 10,
    lineHeight: 16,
  },

  trainingStatusIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trainingStatusPassed: {
    backgroundColor: '#5FBF82',
    borderColor: '#5FBF82',
  },

  trainingStatusCurrent: {
    borderColor: '#CAAE53',
  },

  trainingRowText: {
    flex: 1,
    marginLeft: 13,
  },

  trainingPeriodTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  trainingStatusText: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
    marginTop: 4,
  },

  trainingPassedText: {
    color: '#5FBF82',
  },

  trainingMeta: {
    color: '#A9B3BF',
    fontSize: 11,
    marginTop: 4,
  },

  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  milestoneIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  milestoneTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  milestoneTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  milestoneSubtitle: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  profileCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 22,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CAAE53',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  profileName: {
    color: Brand.white,
    fontSize: 24,
    fontFamily: FontFamily.heading,
  },

  profileTrade: {
    color: '#CAAE53',
    fontSize: 16,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 20,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  profileRowText: {
    marginLeft: 12,
  },

  profileLabel: {
    color: '#7C8796',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  profileValue: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodySemiBold,
    marginTop: 3,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  actionSubtitle: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  jobsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  createJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
    paddingHorizontal: 13,
    minHeight: 42,
    marginTop: 2,
  },

  createJobButtonText: {
    color: '#0B1623',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  jobStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },

  jobStatCard: {
    flex: 1,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 13,
  },

  jobStatValue: {
    color: Brand.white,
    fontSize: 22,
    fontFamily: FontFamily.display,
  },

  jobStatLabel: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
    marginTop: 3,
  },

  jobCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  jobTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.display,
  },

  jobCompany: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginTop: 3,
  },

  jobStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  jobStatusActive: {
    backgroundColor: 'rgba(98, 183, 122, 0.16)',
  },

  jobStatusDraft: {
    backgroundColor: 'rgba(210, 185, 91, 0.16)',
  },

  jobStatusText: {
    color: '#D7DEE6',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  jobMetaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },

  jobMeta: {
    color: '#91A1B2',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  jobWage: {
    color: '#62B77A',
    fontSize: 13,
    fontFamily: FontFamily.display,
    marginTop: 11,
  },

  jobDescription: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  jobOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },

  jobOptionButton: {
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: '#101D2B',
  },

  jobOptionButtonSelected: {
    backgroundColor: '#4D9DE0',
    borderColor: '#4D9DE0',
  },

  jobOptionText: {
    color: '#A9B3BF',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  jobOptionTextSelected: {
    color: '#0B1623',
  },

  jobWageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  jobWageInput: {
    flex: 1,
  },

  jobWageDash: {
    color: '#7C8796',
    fontSize: 18,
    marginBottom: 12,
  },

  jobAuthorizationNote: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 12,
  },

  tradeAwareHint: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
    marginBottom: 9,
  },

  profileCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 18,
  },

  editRoleProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 13,
    minHeight: 40,
    maxWidth: 220,
  },

  editRoleProfileButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  roleOnboardingContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 42,
    justifyContent: 'center',
  },

  roleOnboardingScreen: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },

  roleOnboardingHeader: {
    marginBottom: 26,
  },

  roleOnboardingEyebrow: {
    color: Brand.gold500,
    fontSize: 11,
    fontFamily: FontFamily.display,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  roleOnboardingTitle: {
    color: Brand.white,
    fontSize: 34,
    fontFamily: FontFamily.display,
    marginBottom: 8,
  },

  roleOnboardingSubtitle: {
    color: '#9EABB9',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 650,
  },

  roleOnboardingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  roleOnboardingCard: {
    width: '48%',
    minWidth: 260,
    flexGrow: 1,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },

  roleOnboardingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  roleOnboardingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleOnboardingCardTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.display,
    marginBottom: 7,
  },

  roleOnboardingCardText: {
    color: '#93A1B1',
    fontSize: 12,
    lineHeight: 18,
    minHeight: 38,
  },

  rolePrimaryChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 14,
  },

  rolePrimaryChoiceText: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.4,
  },

  roleOnboardingVerification: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#2B3D50',
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
  },

  roleOnboardingVerificationTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.display,
    marginBottom: 4,
  },

  roleOnboardingVerificationText: {
    color: '#8E9BAA',
    fontSize: 11,
    lineHeight: 17,
  },

  roleOnboardingError: {
    color: '#E56B6B',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 12,
  },

  roleOnboardingContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D2B95B',
    borderRadius: 11,
    minHeight: 52,
    marginTop: 18,
    paddingHorizontal: 18,
  },

  roleOnboardingContinueText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
  },

  verificationCenterCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  verificationCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 14,
  },

  verificationCenterTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.display,
    marginBottom: 4,
  },

  verificationCenterSubtitle: {
    color: '#8E9BAA',
    fontSize: 10,
    lineHeight: 15,
    maxWidth: 600,
  },

  verificationCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderTopWidth: 1,
    borderTopColor: '#26394C',
    paddingVertical: 13,
  },

  verificationCenterIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101D2B',
  },

  verificationCenterRole: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.display,
    marginBottom: 3,
  },

  verificationCenterLater: {
    color: '#7C8796',
    fontSize: 9,
    lineHeight: 13,
  },

  verificationCenterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleManagementCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  roleManagementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },

  roleManagementTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  roleManagementSubtitle: {
    color: '#8F9CAA',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  profileRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26394C',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    marginTop: 9,
    backgroundColor: '#101D2B',
  },

  profileRoleIcon: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileRoleCopy: {
    flex: 1,
    marginLeft: 11,
  },

  profileRoleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  profileRoleTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  profilePrimaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  profilePrimaryBadgeText: {
    color: '#0B1623',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  profileVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  profileVerificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  profileVerificationText: {
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  profileRoleActions: {
    alignItems: 'flex-end',
    gap: 7,
    marginLeft: 8,
  },

  profileRoleActionButton: {
    borderWidth: 1,
    borderColor: '#405568',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  profileRoleActionText: {
    color: '#D6DEE6',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  profileRoleRemoveButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#5A3338',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  availableRolesDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 18,
  },

  availableRolesTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
    marginBottom: 9,
  },

  availableRolesHelp: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
    marginBottom: 12,
  },

  emailVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#2B3D50',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  emailVerificationTitle: {
    color: Brand.white,
    fontSize: 10,
    fontFamily: FontFamily.display,
    marginBottom: 3,
  },

  emailVerificationText: {
    color: '#7C8796',
    fontSize: 9,
    lineHeight: 14,
  },

  roleDeleteConfirmCard: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#172638',
    borderWidth: 1,
    borderColor: '#4A2F36',
    borderRadius: 14,
    padding: 22,
  },

  roleDeleteConfirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 107, 107, 0.12)',
    marginBottom: 14,
  },

  roleDeleteConfirmTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.display,
    marginBottom: 7,
  },

  roleDeleteConfirmQuestion: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },

  roleDeleteWarningBox: {
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#34475A',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },

  roleDeleteWarningTitle: {
    color: '#E7ECF2',
    fontSize: 11,
    fontFamily: FontFamily.display,
    marginBottom: 2,
  },

  roleDeleteWarningText: {
    color: '#91A0AF',
    fontSize: 10,
    lineHeight: 16,
  },

  roleDeleteConfirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  roleDeleteCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#3A4A5B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  roleDeleteCancelText: {
    color: '#C0CAD4',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  roleDeleteConfirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: '#B84F5A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  roleDeleteConfirmText: {
    color: Brand.white,
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  availableRolesGrid: {
    gap: 8,
  },

  availableRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    padding: 10,
    backgroundColor: '#101D2B',
  },

  availableRoleIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  availableRoleText: {
    flex: 1,
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  allRolesAddedText: {
    color: '#7C8796',
    fontSize: 12,
    lineHeight: 18,
  },

  roleMessage: {
    color: Brand.gold500,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  bottomNav: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1D3042',
    backgroundColor: '#101D2B',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  navText: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.bodySemiBold,
  },

  navTextSelected: {
    color: '#CAAE53',
  },

  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.72)',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  },

  fullScreenEditor: {
    flex: 1,
    backgroundColor: Brand.navy900,
  },

  fullScreenEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1D3042',
  },

  fullScreenEditorHeaderAction: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
  },

  fullScreenEditorHeaderActionText: {
    color: '#D2B95B',
    fontSize: 16,
    fontFamily: FontFamily.bodySemiBold,
  },

  fullScreenEditorTitle: {
    flex: 1,
    color: Brand.white,
    fontSize: 17,
    fontFamily: FontFamily.heading,
    textAlign: 'center',
  },

  fullScreenEditorBody: {
    flex: 1,
  },

  fullScreenEditorScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 16,
    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 22,
  },

  modalTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
  },

  modalLabel: {
    color: '#A9B3BF',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 8,
  },

  modalInput: {
    backgroundColor: '#101D2B',
    color: Brand.white,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 16,
  },

  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  periodButton: {
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  periodButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  periodButtonLocked: {
    backgroundColor: '#13202D',
    borderColor: '#2F4153',
    opacity: 0.55,
  },

  periodButtonText: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  periodButtonTextSelected: {
    color: '#0D1B2A',
  },

  periodButtonTextLocked: {
    color: '#7C8796',
  },

  currentPeriodHint: { color: '#CAAE53', fontSize: 11, marginTop: -8, marginBottom: 16 },
  frequentCompanySection: {
    marginTop: -2,
    marginBottom: 12,
  },

  frequentCompanyLabel: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
    marginBottom: 7,
    textTransform: 'uppercase',
  },

  frequentCompanyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  frequentCompanyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  frequentCompanyChipSelected: {
    borderColor: '#CAAE53',
    backgroundColor: '#1A2530',
  },

  frequentCompanyChipText: {
    color: '#D7DEE6',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
  },

  suggestionBox: { backgroundColor: '#101D2B', borderWidth: 1, borderColor: '#33465A', borderRadius: 9, marginTop: -10, marginBottom: 16, overflow: 'hidden' },
  suggestionOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#26394C' },
  suggestionText: { color: Brand.white, fontSize: 14, fontFamily: FontFamily.bodySemiBold },
  companySuggestionText: { flex: 1 },
  companySuggestionMeta: { color: '#7C8796', fontSize: 11, marginTop: 3 },
  companySearchStatus: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  companySearchStatusText: { color: '#A9B3BF', fontSize: 13 },
  addCompanyOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#142334' },
  addCompanyOptionText: { color: '#CAAE53', fontSize: 13, fontFamily: FontFamily.bodyBold },
  selectInput: { backgroundColor: '#101D2B', borderWidth: 1, borderColor: '#33465A', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectInputText: { color: Brand.white, fontSize: 15 },
  selectPlaceholder: { color: '#7C8796', fontSize: 15 },

  manualModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  manualModeButton: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    backgroundColor: '#101D2B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },

  manualModeButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  manualModeButtonText: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.4,
  },

  manualModeButtonTextSelected: {
    color: '#0D1B2A',
  },

  historicalDateCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  historicalDateTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  historicalDateText: {
    color: '#8F9CAA',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },

  manualTimeCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  manualTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  manualTimeField: {
    flex: 1,
  },

  manualTimeLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 7,
  },

  manualTimeInput: {
    backgroundColor: '#101D2B',
    color: Brand.white,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },

  meridiemRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 7,
  },

  meridiemButton: {
    flex: 1,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101D2B',
  },

  meridiemButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  meridiemText: {
    color: '#A9B3BF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  meridiemTextSelected: {
    color: '#0D1B2A',
  },

  calculatedHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1F30',
    borderWidth: 1,
    borderColor: '#3A5267',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: -4,
  },

  calculatedHoursLabel: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  calculatedHoursValue: {
    color: '#CAAE53',
    fontSize: 17,
    fontFamily: FontFamily.display,
  },

  manualTimeHint: {
    color: '#748494',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },

  modalError: {
    color: '#FF7B7B',
    fontSize: 13,
    marginBottom: 12,
  },

  saveHoursButton: {
    backgroundColor: '#CAAE53',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },

  saveHoursText: {
    color: '#0D1B2A',
    fontSize: 14,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  menuCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 16,
    padding: 22,
  },

  menuTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
    marginBottom: 16,
  },

  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
    gap: 12,
  },

  menuOptionText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  deleteOptionText: {
    color: '#FF7B7B',
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  cancelMenuButton: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelMenuText: {
    color: '#CAAE53',
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  deleteTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
    marginTop: 16,
  },

  deleteText: {
    color: '#A9B3BF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },

  deleteButton: {
    backgroundColor: '#C44949',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },
});
