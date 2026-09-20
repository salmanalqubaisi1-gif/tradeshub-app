import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Brand, FontFamily } from '../../constants/theme';

type Props = {
  roleColor: string;
  businessName?: string | null;
  onOpenMarketplace: () => void;
  onOpenProducts: () => void;
  onOpenProfile: () => void;
};

export default function SupplierDashboard({
  roleColor,
  businessName,
  onOpenMarketplace,
  onOpenProducts,
  onOpenProfile,
}: Props) {
  return (
    <>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ACTIVE LISTINGS</Text>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statHint}>Products visible in Marketplace</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>PROMOTIONS</Text>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statHint}>Current trade deals</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>STORE</Text>
          <Text style={styles.storeName} numberOfLines={1}>
            {businessName || 'Store profile'}
          </Text>
          <Text style={styles.statHint}>Supplier presence on Trades Hub</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryAction, { backgroundColor: roleColor }]}
          onPress={onOpenProducts}
        >
          <Ionicons name="add" size={18} color="#0B1623" />
          <Text style={styles.primaryActionText}>ADD PRODUCT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { borderColor: roleColor }]}
          onPress={onOpenMarketplace}
        >
          <Ionicons name="storefront-outline" size={18} color={roleColor} />
          <Text style={[styles.secondaryActionText, { color: roleColor }]}>
            MARKETPLACE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { borderColor: roleColor }]}
          onPress={onOpenProfile}
        >
          <Ionicons name="business-outline" size={18} color={roleColor} />
          <Text style={[styles.secondaryActionText, { color: roleColor }]}>
            STORE PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Supplier workspace</Text>

      <View style={styles.workspaceGrid}>
        <TouchableOpacity style={styles.workspaceCard} onPress={onOpenProducts}>
          <View style={[styles.workspaceIcon, { borderColor: roleColor }]}>
            <Ionicons name="cube-outline" size={20} color={roleColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workspaceTitle}>Products & Inventory</Text>
            <Text style={styles.workspaceText}>
              Add tools, equipment and stock for trade buyers.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6F8091" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.workspaceCard} onPress={onOpenMarketplace}>
          <View style={[styles.workspaceIcon, { borderColor: roleColor }]}>
            <Ionicons name="pricetag-outline" size={20} color={roleColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.workspaceTitle}>Deals & Promotions</Text>
            <Text style={styles.workspaceText}>
              Surface supplier offers inside the shared Marketplace.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6F8091" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    flexGrow: 1, flexBasis: 180, minWidth: 160, backgroundColor: '#101F30',
    borderWidth: 1, borderColor: '#26394C', borderRadius: 10, padding: 14,
  },
  statLabel: { color: '#7F8C99', fontSize: 9, fontFamily: FontFamily.heading, letterSpacing: 0.8 },
  statValue: { color: Brand.white, fontSize: 26, fontFamily: FontFamily.display, marginTop: 5 },
  storeName: { color: Brand.white, fontSize: 15, fontFamily: FontFamily.heading, marginTop: 8 },
  statHint: { color: '#718193', fontSize: 9, lineHeight: 14, marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  primaryAction: {
    minHeight: 44, flexGrow: 1, flexBasis: 180, borderRadius: 9,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingHorizontal: 16,
  },
  primaryActionText: { color: '#0B1623', fontSize: 11, fontFamily: FontFamily.heading, letterSpacing: 0.7 },
  secondaryAction: {
    minHeight: 44, flexGrow: 1, flexBasis: 180, borderRadius: 9, borderWidth: 1,
    backgroundColor: '#101F30', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7, paddingHorizontal: 16,
  },
  secondaryActionText: { fontSize: 11, fontFamily: FontFamily.heading, letterSpacing: 0.6 },
  sectionTitle: { color: Brand.white, fontSize: 16, fontFamily: FontFamily.heading, marginBottom: 9 },
  workspaceGrid: { gap: 9 },
  workspaceCard: {
    minHeight: 68, backgroundColor: '#101F30', borderWidth: 1, borderColor: '#26394C',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  workspaceIcon: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1, backgroundColor: '#162536',
    alignItems: 'center', justifyContent: 'center',
  },
  workspaceTitle: { color: Brand.white, fontSize: 12, fontFamily: FontFamily.heading },
  workspaceText: { color: '#7F8C99', fontSize: 9, lineHeight: 14, marginTop: 2 },
});
