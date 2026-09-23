import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROLE_CONFIG, ROLE_TABS } from '../../constants/home';
import { Brand } from '../../constants/theme';
import type { TabName, TradesHubRole, UserRoleRow } from '../../types/home';
import { styles } from './homeStyles';

// Header, workspace switcher and bottom tab bar for the Home screen.
// JSX moved verbatim from src/app/home.tsx.

type IoniconName = keyof typeof Ionicons.glyphMap;

export type HomeTab = TabName | 'Marketplace';

export function HomeHeader({
  isMobile,
  rolesLoading,
  userRoles,
  activeRole,
  showRoleSwitcher,
  setShowRoleSwitcher,
  handleSignOut,
}: {
  isMobile: boolean;
  rolesLoading: boolean;
  userRoles: UserRoleRow[];
  activeRole: TradesHubRole;
  showRoleSwitcher: boolean;
  setShowRoleSwitcher: (update: (current: boolean) => boolean) => void;
  handleSignOut: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        isMobile && styles.headerMobile,
        {
          paddingTop:
            (isMobile ? styles.headerMobile.paddingTop : styles.header.paddingVertical) +
            insets.top,
        },
      ]}
    >
      <View style={[styles.headerBrand, isMobile && styles.headerBrandMobile]}>
        <Image
          source={require('../../../assets/images/trades-hub-logo.png')}
          style={[
            styles.headerLogoImage,
            isMobile && styles.headerLogoImageMobile,
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
        {!rolesLoading && userRoles.length > 0 ? (
          <TouchableOpacity
            style={[
              styles.roleSwitcherButton,
              { borderColor: ROLE_CONFIG[activeRole].color },
            ]}
            onPress={() =>
              setShowRoleSwitcher((current) => !current)
            }
          >
            <View
              style={[
                styles.roleDot,
                { backgroundColor: ROLE_CONFIG[activeRole].color },
              ]}
            />

            <Text style={styles.roleSwitcherText}>
              {ROLE_CONFIG[activeRole].shortLabel}
            </Text>

            <Ionicons
              name={
                showRoleSwitcher
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              }
              size={16}
              color="#A9B3BF"
            />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#D2B95B"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function RoleSwitcherPanel({
  isMobile,
  userRoles,
  activeRole,
  switchingRole,
  managingRoles,
  deletingRole,
  setShowRoleSwitcher,
  switchPrimaryRole,
  requestRemoveUserRole,
  addUserRole,
}: {
  isMobile: boolean;
  userRoles: UserRoleRow[];
  activeRole: TradesHubRole;
  switchingRole: boolean;
  managingRoles: boolean;
  deletingRole: boolean;
  setShowRoleSwitcher: (value: boolean) => void;
  switchPrimaryRole: (role: TradesHubRole) => void;
  requestRemoveUserRole: (role: TradesHubRole) => void;
  addUserRole: (role: TradesHubRole) => void;
}) {
  // The header grows by the top safe-area inset, so the panel's fixed
  // offset must too or it covers the switcher button on notched iPhones.
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity
        style={styles.roleSwitcherBackdrop}
        activeOpacity={1}
        onPress={() => setShowRoleSwitcher(false)}
      />

      <View
        style={[
          styles.roleSwitcherPanel,
          isMobile && styles.roleSwitcherPanelMobile,
          insets.top > 0 && {
            top:
              (isMobile
                ? styles.roleSwitcherPanelMobile.top
                : styles.roleSwitcherPanel.top) + insets.top,
          },
        ]}
      >
      <Text style={styles.roleSwitcherTitle}>
        Switch workspace
      </Text>

      <Text style={styles.roleSwitcherSubtitle}>
        Choose which workspace you want to use.
      </Text>

      {userRoles.map((row) => {
        const config = ROLE_CONFIG[row.role];
        const selected = row.role === activeRole;

        return (
          <View
            key={row.id}
            style={[
              styles.roleSwitcherOption,
              selected && {
                borderColor: config.color,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.roleSwitcherMainAction}
              onPress={() => switchPrimaryRole(row.role)}
              disabled={switchingRole}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.roleSwitcherOptionIcon,
                  {
                    backgroundColor: selected
                      ? config.color
                      : '#152536',
                    borderColor: config.color,
                  },
                ]}
              >
                <Ionicons
                  name={config.icon as IoniconName}
                  size={19}
                  color={selected ? '#0B1623' : config.color}
                />
              </View>

              <View style={styles.roleSwitcherOptionCopy}>
                <Text style={styles.roleSwitcherOptionTitle}>
                  {config.label}
                </Text>

                <Text style={styles.roleSwitcherOptionStatus}>
                  {selected ? 'Current workspace' : 'Switch to this role'}
                </Text>
              </View>

              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={config.color}
                />
              ) : null}
            </TouchableOpacity>

            {userRoles.length > 1 ? (
              <TouchableOpacity
                style={styles.roleSwitcherDeleteButton}
                onPress={() => requestRemoveUserRole(row.role)}
                disabled={
                  switchingRole ||
                  managingRoles ||
                  deletingRole
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#E56B6B"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {(['tradesperson', 'contractor', 'supplier', 'homeowner'] as TradesHubRole[]).some(
        (role) => !userRoles.some((row) => row.role === role)
      ) ? (
        <>
          <View style={styles.roleSwitcherAddDivider} />

          <Text style={styles.roleSwitcherAddTitle}>
            Add role
          </Text>

          <Text style={styles.roleSwitcherAddHelp}>
            Add another workspace to this account. New roles start as self-declared and can be verified later.
          </Text>

          {(['tradesperson', 'contractor', 'supplier', 'homeowner'] as TradesHubRole[])
            .filter(
              (role) => !userRoles.some((row) => row.role === role)
            )
            .map((role) => {
              const config = ROLE_CONFIG[role];

              return (
                <TouchableOpacity
                  key={`add-${role}`}
                  style={styles.roleSwitcherAddOption}
                  onPress={() => addUserRole(role)}
                  disabled={
                    managingRoles ||
                    switchingRole ||
                    deletingRole
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.roleSwitcherOptionIcon,
                      {
                        backgroundColor: Brand.navy800,
                        borderColor: config.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as IoniconName}
                      size={19}
                      color={config.color}
                    />
                  </View>

                  <View style={styles.roleSwitcherOptionCopy}>
                    <Text style={styles.roleSwitcherOptionTitle}>
                      {config.label}
                    </Text>

                    <Text style={styles.roleSwitcherOptionStatus}>
                      Add to your account
                    </Text>
                  </View>

                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={config.color}
                  />
                </TouchableOpacity>
              );
            })}
        </>
      ) : null}
    </View>
    </>
  );
}

export function HomeBottomNav({
  activeRole,
  activeTab,
  setActiveTab,
}: {
  activeRole: TradesHubRole;
  activeTab: HomeTab;
  setActiveTab: (tab: HomeTab) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomNav,
        // Keep tab labels clear of the iPhone home indicator.
        insets.bottom > 0 && {
          height: styles.bottomNav.height + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {[
        ...ROLE_TABS[activeRole],
        {
          name: 'Marketplace' as any,
          label: 'Market',
          icon: 'storefront-outline' as const,
        },
      ].map((tab) => {
        const selected = activeTab === tab.name;

        return (
          <TouchableOpacity
            key={`${activeRole}-${tab.name}`}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.name)}
          >
            <Ionicons
              name={tab.icon as IoniconName}
              size={23}
              color={
                selected
                  ? ROLE_CONFIG[activeRole].color
                  : '#7C8796'
              }
            />

            <Text
              style={[
                styles.navText,
                selected && styles.navTextSelected,
                selected && {
                  color: ROLE_CONFIG[activeRole].color,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
