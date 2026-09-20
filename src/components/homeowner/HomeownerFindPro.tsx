import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Brand, FontFamily } from '../../constants/theme';

type Contractor = {
  id: string;
  company: string;
  trade: string;
  city: string;
  phone: string;
  serviceArea: string;
  verification: 'verified' | 'self_declared';
  note: string;
};

type Props = {
  roleColor?: string;
};

export default function HomeownerFindPro({
  roleColor = '#62B77A',
}: Props) {
  const [trade, setTrade] = useState('All trades');
  const [city, setCity] = useState('Edmonton');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const contractors: Contractor[] = [
    {
      id: 'demo-1',
      company: 'Northline Mechanical',
      trade: 'Plumber',
      city: 'Edmonton',
      phone: '780-555-0182',
      serviceArea: 'Edmonton & surrounding area',
      verification: 'verified',
      note: 'Service plumbing, water heaters and renovations.',
    },
    {
      id: 'demo-2',
      company: 'Prairie Spark Electric',
      trade: 'Electrician',
      city: 'Edmonton',
      phone: '780-555-0148',
      serviceArea: 'Edmonton, St. Albert & Sherwood Park',
      verification: 'self_declared',
      note: 'Residential service, lighting and panel work.',
    },
    {
      id: 'demo-3',
      company: 'River City Heating',
      trade: 'HVAC',
      city: 'Edmonton',
      phone: '780-555-0117',
      serviceArea: 'Edmonton metro',
      verification: 'verified',
      note: 'Heating, cooling and seasonal maintenance.',
    },
  ];

  const filteredContractors = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cityQuery = city.trim().toLowerCase();

    return contractors.filter((item) => {
      const tradeMatches = trade === 'All trades' || item.trade === trade;
      const cityMatches =
        !cityQuery ||
        item.city.toLowerCase().includes(cityQuery) ||
        item.serviceArea.toLowerCase().includes(cityQuery);
      const searchMatches =
        !query ||
        item.company.toLowerCase().includes(query) ||
        item.trade.toLowerCase().includes(query) ||
        item.note.toLowerCase().includes(query);

      return tradeMatches && cityMatches && searchMatches;
    });
  }, [trade, city, search]);

  function toggleSaved(id: string) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function callContractor(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  return (
    <View>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Find a Pro</Text>
          <Text style={styles.pageSubtitle}>
            Search trade professionals by trade and service area.
          </Text>
        </View>

        <View style={[styles.headerBadge, { borderColor: roleColor }]}>
          <Ionicons name="search-outline" size={22} color={roleColor} />
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.label}>SEARCH</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#7F8C99" />
          <TextInput
            style={styles.input}
            placeholder="Company, trade or service"
            placeholderTextColor="#667788"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.label}>LOCATION</Text>
        <View style={styles.searchBox}>
          <Ionicons name="location-outline" size={18} color="#7F8C99" />
          <TextInput
            style={styles.input}
            placeholder="Edmonton"
            placeholderTextColor="#667788"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <Text style={styles.label}>TRADE</Text>
        <View style={styles.tradeChips}>
          {['All trades', 'Plumber', 'Electrician', 'HVAC'].map((item) => {
            const selected = item === trade;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.tradeChip,
                  selected && {
                    borderColor: roleColor,
                    backgroundColor: `${roleColor}18`,
                  },
                ]}
                onPress={() => setTrade(item)}
              >
                <Text
                  style={[
                    styles.tradeChipText,
                    selected && { color: roleColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Trade professionals</Text>
        <Text style={styles.resultsCount}>
          {filteredContractors.length} result
          {filteredContractors.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.resultsList}>
        {filteredContractors.map((item) => {
          const saved = savedIds.includes(item.id);
          const verified = item.verification === 'verified';

          return (
            <View key={item.id} style={styles.contractorCard}>
              <View style={styles.contractorTop}>
                <View
                  style={[
                    styles.contractorIcon,
                    { borderColor: roleColor },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={22}
                    color={roleColor}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.contractorName}>{item.company}</Text>
                  <Text style={styles.contractorMeta}>
                    {item.trade} · {item.city}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleSaved(item.id)}
                >
                  <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={19}
                    color={saved ? roleColor : '#7F8C99'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.verificationBadge,
                    {
                      borderColor: verified ? '#62B77A' : '#7F8C99',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      verified
                        ? 'shield-checkmark-outline'
                        : 'information-circle-outline'
                    }
                    size={13}
                    color={verified ? '#62B77A' : '#7F8C99'}
                  />
                  <Text
                    style={[
                      styles.verificationText,
                      {
                        color: verified ? '#62B77A' : '#7F8C99',
                      },
                    ]}
                  >
                    {verified ? 'VERIFIED' : 'SELF-DECLARED'}
                  </Text>
                </View>

                <Text style={styles.serviceArea}>{item.serviceArea}</Text>
              </View>

              <Text style={styles.contractorNote}>{item.note}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: roleColor },
                  ]}
                  onPress={() => callContractor(item.phone)}
                >
                  <Ionicons name="call-outline" size={17} color="#0B1623" />
                  <Text style={styles.primaryButtonText}>CALL</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>VIEW PROFILE</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={roleColor}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredContractors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={24} color={roleColor} />
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptyText}>
              Try another trade, city or search term.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  pageTitle: {
    color: Brand.white,
    fontSize: 28,
    fontFamily: FontFamily.heading,
  },
  pageSubtitle: {
    color: '#9BA7B4',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  headerBadge: {
    width: 46,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 11,
    padding: 14,
    marginBottom: 18,
  },
  label: {
    color: '#9BA7B4',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 8,
  },
  searchBox: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0D1A28',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
  },
  input: {
    flex: 1,
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.body,
  },
  tradeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tradeChip: {
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  tradeChipText: {
    color: '#7F8C99',
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  resultsTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },
  resultsCount: {
    color: '#7F8C99',
    fontSize: 9,
  },
  resultsList: {
    gap: 10,
  },
  contractorCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 11,
    padding: 14,
  },
  contractorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contractorIcon: {
    width: 44,
    height: 44,
    borderRadius: 9,
    borderWidth: 1,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractorName: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },
  contractorMeta: {
    color: '#7F8C99',
    fontSize: 9,
    marginTop: 3,
  },
  saveButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  verificationBadge: {
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verificationText: {
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },
  serviceArea: {
    color: '#8D9AAA',
    fontSize: 9,
  },
  contractorNote: {
    color: '#9BA7B4',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 11,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  primaryButton: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: 130,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#0B1623',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },
  secondaryButton: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: Brand.white,
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },
  emptyCard: {
    minHeight: 180,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
    marginTop: 9,
  },
  emptyText: {
    color: '#7F8C99',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
