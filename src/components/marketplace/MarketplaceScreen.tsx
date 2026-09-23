import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Brand, FontFamily } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type MarketplaceView = 'browse' | 'deals' | 'local' | 'retailers' | 'sell' | 'your' | 'saved';

type Listing = {
  id: string;
  title: string;
  meta: string;
  price: string;
  label: 'STORE DEAL' | 'LOCAL LISTING';
  trade: string;
  category: string;
  listerName: string;
  isOwn?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  imageUrls?: string[];
};

type RetailOffer = {
  id: string;
  retailerName: string;
  retailerSlug: string;
  price: number;
  regularPrice?: number | null;
  productUrl?: string | null;
  inStock?: boolean | null;
  onlineAvailable?: boolean | null;
  pickupAvailable?: boolean | null;
  sale: boolean;
  clearance?: boolean;
  storeLocation?: string | null;
  city?: string | null;
  province?: string | null;
  retailerLocationId?: string | null;
  lastCheckedAt?: string | null;
  validUntil?: string | null;
};

type DealProduct = {
  id: string;
  brand: string;
  name: string;
  modelNumber?: string | null;
  category: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  subcategoryId?: string | null;
  subcategoryName?: string | null;
  subcategorySlug?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  mediaUrls?: string[];
  trades: string[];
  relevanceByTrade: Record<string, 'general' | 'trade_specific' | 'specialty'>;
  offers: RetailOffer[];
};

type SellPhoto = {
  uri: string;
  isRemote?: boolean;
};

// Saved listings persist to marketplace_saved_items (see
// supabase/migrations/20260922120000_marketplace_saved_items.sql).
const SAVED_ITEM_SOURCE = 'listing';

// Built-in sample listings have no database row, so they cannot be saved.
function isPersistableListingId(id: string) {
  return !id.startsWith('demo-');
}

type Props = {
  profileTrade?: string | null;
  profileName?: string | null;
};

export default function MarketplaceScreen({
  profileTrade,
  profileName,
}: Props) {
  const [marketplaceView, setMarketplaceView] =
    useState<MarketplaceView>('browse');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceTrade, setMarketplaceTrade] = useState('All trades');
  const [marketplaceCategory, setMarketplaceCategory] = useState('All categories');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const savedPendingRef = useRef<Set<string>>(new Set());
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [marketplaceMessage, setMarketplaceMessage] = useState('');
  const [sellTitle, setSellTitle] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellTrade, setSellTrade] = useState('General');
  const [sellCategory, setSellCategory] = useState('Power Tools');
  const [sellCondition, setSellCondition] = useState('Used');
  const [sellMessage, setSellMessage] = useState('');
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [sellTradeSearch, setSellTradeSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [sellPhotos, setSellPhotos] = useState<SellPhoto[]>([]);
  const [initialRemotePhotoUrls, setInitialRemotePhotoUrls] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [dealLoading, setDealLoading] = useState(false);
  // The Deal Scanner is only shown in the Deals view, so its queries run
  // the first time that view is opened instead of on every Marketplace mount.
  const [dealScannerRequested, setDealScannerRequested] = useState(false);
  const [dealMessage, setDealMessage] = useState('');
  const [dealTrade, setDealTrade] = useState(profileTrade?.trim() || 'Plumber');
  const [dealTradeSearch, setDealTradeSearch] = useState('');
  const [showTradeSheet, setShowTradeSheet] = useState(false);
  const [dealRelevanceFilter, setDealRelevanceFilter] =
    useState<'all' | 'trade_specific' | 'general'>('all');
  const [dealCategoryFilter, setDealCategoryFilter] = useState('all');
  const [dealCity, setDealCity] = useState('Edmonton');

  const marketplaceColor = '#D2B95B';
  const ALBERTA_GST_RATE = 0.05;
  const DEAL_FRESHNESS_HOURS = 24;

  const demoListings: Listing[] = [
    {
      id: 'demo-1',
      title: 'M18 FUEL Hammer Drill Kit',
      meta: 'Milwaukee · New',
      price: '$329',
      label: 'STORE DEAL',
      trade: 'General',
      category: 'Power Tools',
      listerName: 'Milwaukee Dealer',
      icon: 'construct-outline',
    },
    {
      id: 'demo-2',
      title: 'Ridgid 300 Pipe Threader',
      meta: 'Edmonton · Used',
      price: '$1,850',
      label: 'LOCAL LISTING',
      trade: 'Plumber',
      category: 'Equipment',
      listerName: 'Mike R.',
      icon: 'build-outline',
    },
    {
      id: 'demo-3',
      title: 'Klein Electrician Tool Set',
      meta: 'Klein Tools · New',
      price: '$149',
      label: 'STORE DEAL',
      trade: 'Electrician',
      category: 'Hand Tools',
      listerName: 'Klein Tools Dealer',
      icon: 'hammer-outline',
    },
    {
      id: 'demo-4',
      title: 'Milwaukee M12 Copper Tubing Cutter',
      meta: 'Edmonton · New',
      price: '$239',
      label: 'STORE DEAL',
      trade: 'Plumber',
      category: 'Power Tools',
      listerName: 'Edmonton Tool Supply',
      icon: 'cut-outline',
    },
  ];

  const listings = useMemo(
    () => [...userListings, ...demoListings],
    [userListings]
  );

  const tradeAliasMap: Record<string, string> = {
    'Refrigeration and Air Conditioning Mechanic': 'HVAC',
    'Industrial Mechanic (Millwright)': 'Millwright',
    'Automotive Service Technician': 'Automotive Mechanic',
    'Heavy Equipment Technician': 'Heavy Equipment Mechanic',
    'Instrumentation and Control Technician': 'Instrumentation Tech',
    'Insulator (Heat and Frost)': 'Insulator',
    'Painter and Decorator': 'Painter',
    'Sheet Metal Worker': 'Sheet Metal',
    'Powerline Technician': 'Powerline Tech',
    'Steamfitter-Pipefitter': 'Steamfitter / Pipefitter',
    'Construction Craft Worker': 'Construction Labourer',
    'Metal Fabricator (Fitter)': 'Metal Fabricator',
    'Floorcovering Installer': 'Flooring Installer',
    'Lather (Interior Systems Mechanic)': 'Interior Systems Mechanic',
    'Recreation Vehicle Service Technician': 'RV Service Technician',
  };

  const officialTradeProfiles = [
    'Agricultural Equipment Technician',
    'Appliance Service Technician',
    'Appliance Service Technician - Commercial Appliance Service Technician',
    'Auto Body Technician',
    'Auto Body Technician - Auto Body Prepper',
    'Auto Body Technician - Auto Body Refinisher',
    'Auto Body Technician - Auto Body Repairer',
    'Automotive Service Technician',
    'Baker',
    'Barber',
    'Boilermaker',
    'Bricklayer',
    'Cabinetmaker',
    'Carpenter',
    'Cathodic Protection Technician - Level One',
    'Cathodic Protection Technician - Level Two',
    'Communication Technician',
    'Concrete Finisher',
    'Construction Craft Worker',
    'Cook',
    'Crane and Hoisting Equipment Operator - Boom Truck',
    'Crane and Hoisting Equipment Operator - Mobile Crane',
    'Crane and Hoisting Equipment Operator - Tower Crane',
    'Crane and Hoisting Equipment Operator - Wellhead Boom Truck',
    'Electric Motor Systems Technician',
    'Electrician',
    'Elevator Constructor',
    'Field Heat Treatment Technician',
    'Floorcovering Installer',
    'Gas Utility Operator',
    'Gasfitter - Class A',
    'Gasfitter - Class B',
    'Glazier',
    'Hairstylist',
    'Heavy Equipment Technician',
    'Heavy Equipment Technician - Heavy Duty Equipment Mechanic (Off Road)',
    'Heavy Equipment Technician - Transport Trailer Mechanic',
    'Heavy Equipment Technician - Truck and Transport Mechanic',
    'Industrial Construction Crew Supervisor',
    'Industrial Mechanic (Millwright)',
    'Instrumentation and Control Technician',
    'Insulator (Heat and Frost)',
    'Ironworker',
    'Ironworker (Metal Building Systems Erector)',
    'Ironworker (Reinforcing)',
    'Ironworker (Structural/Ornamental)',
    'Landscape Horticulturist',
    'Lather (Interior Systems Mechanic)',
    'Locksmith',
    'Machinist',
    'Metal Fabricator (Fitter)',
    'Motorcycle Mechanic',
    'Natural Gas Compression Technician',
    'Oil and Gas Transportation Services (All Levels)',
    'Outdoor Power Equipment Technician - Power Equipment',
    'Outdoor Power Equipment Technician - Recreational Equipment',
    'Overhead Door Technician - Level One',
    'Overhead Door Technician - Level Two',
    'Painter and Decorator',
    'Parts Technician - Materials Technician',
    'Parts Technician - Parts Technician',
    'Plumber',
    'Power System Electrician',
    'Powerline Technician',
    'Recreation Vehicle Service Technician',
    'Refrigeration and Air Conditioning Mechanic',
    'Residential Construction Site Manager',
    'Roofer',
    'Sheet Metal Worker',
    'Slickline Services (All Levels)',
    'Snubbing Services (All Levels)',
    'Sprinkler Systems Installer',
    'Steamfitter-Pipefitter',
    'Steel Detailer (All Levels)',
    'Transport Refrigeration Technician',
    'Water Well Driller',
    'Water Well Driller - Earth Loop Technician',
    'Welder',
    'Welder - Wire Process Operator',
    'Well Testing Services Supervisor (All Levels)',
  ];

  function getTradeDisplayName(officialName: string) {
    const alias = tradeAliasMap[officialName];
    return alias ? `${alias} — ${officialName}` : officialName;
  }

  const PRIMARY_DEAL_TRADES = [
    'Plumber',
    'Electrician',
    'Refrigeration and Air Conditioning Mechanic',
    'Carpenter',
    'Welder',
  ];

  const tradeOptions = useMemo(() => {
    const next = [...officialTradeProfiles];

    if (profileTrade?.trim() && !next.includes(profileTrade.trim())) {
      next.unshift(profileTrade.trim());
    }

    return next;
  }, [profileTrade]);


  useEffect(() => {
    loadMarketplaceListings();
    loadSavedItems();
  }, []);

  useEffect(() => {
    if (marketplaceView !== 'deals' || dealScannerRequested) return;

    setDealScannerRequested(true);
    loadDealScanner();
  }, [marketplaceView, dealScannerRequested]);

  async function loadSavedItems() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSavedUserId(null);
        setSavedIds([]);
        return;
      }

      setSavedUserId(user.id);

      const { data, error } = await supabase
        .from('marketplace_saved_items')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_source', SAVED_ITEM_SOURCE);

      if (error) throw error;

      setSavedIds((data || []).map((row: any) => String(row.item_id)));
    } catch (error: any) {
      console.error('Marketplace saved items load error:', error);
      setSavedMessage('Could not load your saved listings.');
    }
  }


  async function loadDealScanner() {
    try {
      setDealLoading(true);
      setDealMessage('');

      const [
        { data: products, error: productsError },
        { data: tradeRows, error: tradesError },
        { data: offers, error: offersError },
        { data: retailers, error: retailersError },
        { data: categories, error: categoriesError },
        { data: subcategories, error: subcategoriesError },
        { data: mediaRows, error: mediaError },
      ] = await Promise.all([
        supabase
          .from('marketplace_products')
          .select(
            'id, brand, name, model_number, category, category_id, subcategory_id, image_url, image_urls'
          )
          .order('brand', { ascending: true }),
        supabase
          .from('marketplace_product_trades')
          .select('product_id, trade, relevance_type'),
        supabase
          .from('marketplace_retailer_offers')
          .select(
            'id, product_id, retailer_id, retailer_location_id, price, regular_price, product_url, in_stock, online_available, pickup_available, sale, clearance, store_location, city, province, last_checked_at, valid_until, is_test'
          ),
        supabase
          .from('marketplace_retailers')
          .select('id, name, slug, is_active')
          .eq('is_active', true),
        supabase
          .from('marketplace_tool_categories')
          .select('id, name, slug, display_order')
          .eq('is_active', true),
        supabase
          .from('marketplace_tool_subcategories')
          .select('id, category_id, name, slug, display_order')
          .eq('is_active', true),
        supabase
          .from('marketplace_product_media')
          .select(
            'id, product_id, image_url, image_type, is_primary, display_order'
          )
          .order('is_primary', { ascending: false })
          .order('display_order', { ascending: true }),
      ]);

      if (productsError) throw productsError;
      if (tradesError) throw tradesError;
      if (offersError) throw offersError;
      if (retailersError) throw retailersError;
      if (categoriesError) throw categoriesError;
      if (subcategoriesError) throw subcategoriesError;
      if (mediaError) throw mediaError;

      const retailerMap = new Map(
        (retailers || []).map((retailer: any) => [retailer.id, retailer])
      );

      const tradesByProduct = new Map<string, string[]>();
      const relevanceByProduct = new Map<
        string,
        Record<string, 'general' | 'trade_specific' | 'specialty'>
      >();

      for (const row of tradeRows || []) {
        const productId = (row as any).product_id;
        const trade = (row as any).trade;
        const relevance = ((row as any).relevance_type || 'general') as
          | 'general'
          | 'trade_specific'
          | 'specialty';

        const existing = tradesByProduct.get(productId) || [];
        existing.push(trade);
        tradesByProduct.set(productId, existing);

        const existingRelevance = relevanceByProduct.get(productId) || {};
        existingRelevance[trade] = relevance;
        relevanceByProduct.set(productId, existingRelevance);
      }

      const categoryMap = new Map(
        (categories || []).map((category: any) => [category.id, category])
      );

      const subcategoryMap = new Map(
        (subcategories || []).map((subcategory: any) => [
          subcategory.id,
          subcategory,
        ])
      );

      const offersByProduct = new Map<string, RetailOffer[]>();
      for (const row of offers || []) {
        if ((row as any).is_test) continue;
        const retailer = retailerMap.get((row as any).retailer_id);
        if (!retailer) continue;

        const existing = offersByProduct.get((row as any).product_id) || [];
        existing.push({
          id: (row as any).id,
          retailerName: retailer.name,
          retailerSlug: retailer.slug,
          price: Number((row as any).price),
          regularPrice:
            (row as any).regular_price == null
              ? null
              : Number((row as any).regular_price),
          productUrl: (row as any).product_url,
          inStock: (row as any).in_stock,
          onlineAvailable: (row as any).online_available,
          pickupAvailable: (row as any).pickup_available,
          sale: Boolean((row as any).sale),
          clearance: Boolean((row as any).clearance),
          storeLocation: (row as any).store_location,
          city: (row as any).city,
          province: (row as any).province,
          retailerLocationId: (row as any).retailer_location_id,
          lastCheckedAt: (row as any).last_checked_at,
          validUntil: (row as any).valid_until,
        });
        offersByProduct.set((row as any).product_id, existing);
      }

      const mediaByProduct = new Map<string, string[]>();

      for (const row of mediaRows || []) {
        const productId = (row as any).product_id;
        const imageUrl = String((row as any).image_url || '').trim();
        if (!imageUrl) continue;

        const existing = mediaByProduct.get(productId) || [];
        existing.push(imageUrl);
        mediaByProduct.set(productId, existing);
      }

      const normalized: DealProduct[] = (products || []).map((product: any) => {
        const category = product.category_id
          ? categoryMap.get(product.category_id)
          : null;
        const subcategory = product.subcategory_id
          ? subcategoryMap.get(product.subcategory_id)
          : null;

        return {
          id: product.id,
          brand: product.brand,
          name: product.name,
          modelNumber: product.model_number,
          category: product.category,
          categoryId: product.category_id,
          categoryName: category?.name || product.category || null,
          categorySlug: category?.slug || null,
          subcategoryId: product.subcategory_id,
          subcategoryName: subcategory?.name || null,
          subcategorySlug: subcategory?.slug || null,
          imageUrl: product.image_url,
          imageUrls: Array.isArray(product.image_urls)
            ? product.image_urls
            : [],
          mediaUrls: mediaByProduct.get(product.id) || [],
          trades: tradesByProduct.get(product.id) || [],
          relevanceByTrade: relevanceByProduct.get(product.id) || {},
          offers: (offersByProduct.get(product.id) || []).sort((a, b) => {
            const aAvailable = a.inStock !== false;
            const bAvailable = b.inStock !== false;
            if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;
            return a.price - b.price;
          }),
        };
      });

      setDealProducts(normalized);
    } catch (error: any) {
      console.error('Deal Scanner load error:', error);
      setDealMessage(error?.message || 'Could not load Deal Scanner products.');
    } finally {
      setDealLoading(false);
    }
  }

  async function loadMarketplaceListings() {
    try {
      setListingsLoading(true);
      setMarketplaceMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(
          'id, user_id, title, price, trade, category, condition, city, seller_name, listing_type, status, image_urls, created_at'
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserListings(
        (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          meta: `${row.city || 'Edmonton'} · ${row.condition}`,
          price: `$${Number(row.price).toFixed(2)}`,
          label: row.listing_type === 'store_deal' ? 'STORE DEAL' : 'LOCAL LISTING',
          trade: row.trade,
          category: row.category,
          listerName: row.seller_name || 'Trades Hub User',
          isOwn: Boolean(user && row.user_id === user.id),
          icon: row.listing_type === 'store_deal' ? 'storefront-outline' : 'cube-outline',
          imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
        }))
      );
    } catch (error: any) {
      console.error('Marketplace listings load error:', error);
      setMarketplaceMessage(
        error?.message || 'Could not load Marketplace listings.'
      );
    } finally {
      setListingsLoading(false);
    }
  }

  const availableTrades = useMemo(
    () => ['All trades', ...tradeOptions],
    [tradeOptions]
  );

  const categoryOptions = [
    'Power Tools',
    'Hand Tools',
    'Equipment',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Safety / PPE',
    'Tool Storage',
    'Measuring / Testing',
    'Ladders / Access',
    'Fasteners / Consumables',
    'Parts / Materials',
  ];

  const sellTradeChoices = useMemo(() => {
    const query = sellTradeSearch.trim().toLowerCase();

    if (!query) {
      const popularTrades = [
        'Plumber',
        'Electrician',
        'Refrigeration and Air Conditioning Mechanic',
        'Automotive Service Technician',
        'Carpenter',
      ];

      return popularTrades.filter((item) => tradeOptions.includes(item));
    }

    return tradeOptions
      .filter((item) => {
        const official = item.toLowerCase();
        const display = getTradeDisplayName(item).toLowerCase();
        return official.includes(query) || display.includes(query);
      })
      .slice(0, 10);
  }, [sellTradeSearch, tradeOptions]);


  const dealTradeSheetOptions = useMemo(() => {
    const query = dealTradeSearch.trim().toLowerCase();

    if (!query) {
      return tradeOptions;
    }

    return tradeOptions.filter((trade) =>
      getTradeDisplayName(trade).toLowerCase().includes(query)
    );
  }, [dealTradeSearch, tradeOptions]);

  const dealCategoryOptions = useMemo(() => {
    const seen = new Map<string, string>();

    for (const product of dealProducts) {
      if (!product.trades.includes(dealTrade)) continue;
      const slug = product.categorySlug || product.category || 'other';
      const name = product.categoryName || product.category || 'Other';
      if (!seen.has(slug)) seen.set(slug, name);
    }

    return Array.from(seen.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dealProducts, dealTrade]);

  const dealCityOptions = useMemo(() => {
    const cities = new Set<string>();

    for (const product of dealProducts) {
      for (const offer of product.offers) {
        const city = offer.city?.trim();
        if (city) cities.add(city);
      }
    }

    if (dealCity) cities.add(dealCity);

    return Array.from(cities).sort((a, b) => a.localeCompare(b));
  }, [dealProducts, dealCity]);

  function isOfferFresh(offer: RetailOffer) {
    if (offer.validUntil) {
      const validUntil = new Date(offer.validUntil).getTime();
      if (Number.isFinite(validUntil) && validUntil < Date.now()) return false;
    }

    if (!offer.lastCheckedAt) return false;

    const checkedAt = new Date(offer.lastCheckedAt).getTime();
    if (!Number.isFinite(checkedAt)) return false;

    return Date.now() - checkedAt <= DEAL_FRESHNESS_HOURS * 60 * 60 * 1000;
  }

  function formatOfferAge(lastCheckedAt?: string | null) {
    if (!lastCheckedAt) return 'Update time unavailable';

    const checkedAt = new Date(lastCheckedAt).getTime();
    if (!Number.isFinite(checkedAt)) return 'Update time unavailable';

    const minutes = Math.max(0, Math.floor((Date.now() - checkedAt) / 60000));
    if (minutes < 1) return 'Updated just now';
    if (minutes < 60) return `Updated ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Updated ${hours} hr${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  }

  async function openRetailerOffer(offer: RetailOffer) {
    if (!offer.productUrl) {
      setDealMessage(`${offer.retailerName} product link has not been connected yet.`);
      return;
    }

    try {
      await Linking.openURL(offer.productUrl);
    } catch (error) {
      console.error('Retailer link error:', error);
      setDealMessage('Could not open this retailer link.');
    }
  }

  const filteredDealProducts = useMemo(() => {
    return dealProducts
      .filter((product) => product.trades.includes(dealTrade))
      .map((product) => ({
        ...product,
        offers: product.offers
          .filter(
            (offer) =>
              offer.onlineAvailable === true ||
              offer.city?.trim().toLowerCase() === dealCity.trim().toLowerCase()
          )
          .filter(isOfferFresh)
          .sort((a, b) => {
            const aAvailable = a.inStock !== false;
            const bAvailable = b.inStock !== false;
            if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;
            return a.price - b.price;
          }),
      }))
      .filter((product) => product.offers.length > 0)
      .filter((product) => {
        if (dealRelevanceFilter === 'all') return true;
        return (
          product.relevanceByTrade[dealTrade] === dealRelevanceFilter
        );
      })
      .filter((product) => {
        if (dealCategoryFilter === 'all') return true;
        const slug = product.categorySlug || product.category || 'other';
        return slug === dealCategoryFilter;
      })
      .sort((a, b) => {
        const aPriority =
          a.relevanceByTrade[dealTrade] === 'trade_specific' ? 0 : 1;
        const bPriority =
          b.relevanceByTrade[dealTrade] === 'trade_specific' ? 0 : 1;

        if (aPriority !== bPriority) return aPriority - bPriority;

        const aBest = a.offers[0]?.price ?? Number.POSITIVE_INFINITY;
        const bBest = b.offers[0]?.price ?? Number.POSITIVE_INFINITY;
        return aBest - bBest;
      });
  }, [
    dealProducts,
    dealTrade,
    dealRelevanceFilter,
    dealCategoryFilter,
    dealCity,
  ]);

  const filteredListings = useMemo(() => {
    const search = marketplaceSearch.trim().toLowerCase();

    return listings.filter((item) => {
      if (marketplaceView === 'deals' && item.label !== 'STORE DEAL') {
        return false;
      }

      if (marketplaceView === 'local' && item.label !== 'LOCAL LISTING') {
        return false;
      }

      if (marketplaceView === 'your' && !item.isOwn) {
        return false;
      }

      if (marketplaceView === 'saved' && !savedIds.includes(item.id)) {
        return false;
      }

      const tradeMatches =
        marketplaceTrade === 'All trades' ||
        item.trade === marketplaceTrade ||
        item.trade === 'General';

      const categoryMatches =
        marketplaceCategory === 'All categories' ||
        item.category === marketplaceCategory;

      const searchMatches =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.meta.toLowerCase().includes(search) ||
        item.trade.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return tradeMatches && categoryMatches && searchMatches;
    });
  }, [
    marketplaceView,
    marketplaceSearch,
    marketplaceTrade,
    marketplaceCategory,
    savedIds,
    listings,
  ]);

  const savedListingCount = useMemo(
    () => listings.filter((item) => savedIds.includes(item.id)).length,
    [listings, savedIds]
  );

  async function toggleSaved(id: string) {
    if (!isPersistableListingId(id)) {
      setSavedMessage('Sample listings can’t be saved.');
      return;
    }

    if (!savedUserId) {
      setSavedMessage('Sign in to save listings.');
      return;
    }

    // Ignore repeat taps while this item's save/unsave is in flight.
    if (savedPendingRef.current.has(id)) return;
    savedPendingRef.current.add(id);

    const wasSaved = savedIds.includes(id);
    const addId = (current: string[]) =>
      current.includes(id) ? current : [...current, id];
    const removeId = (current: string[]) =>
      current.filter((item) => item !== id);

    setSavedMessage('');
    setSavedIds(wasSaved ? removeId : addId);

    try {
      if (wasSaved) {
        const { error } = await supabase
          .from('marketplace_saved_items')
          .delete()
          .eq('user_id', savedUserId)
          .eq('item_source', SAVED_ITEM_SOURCE)
          .eq('item_id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketplace_saved_items')
          .upsert(
            {
              user_id: savedUserId,
              item_source: SAVED_ITEM_SOURCE,
              item_id: id,
            },
            {
              onConflict: 'user_id,item_source,item_id',
              ignoreDuplicates: true,
            }
          );

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Marketplace saved item update error:', error);
      setSavedIds(wasSaved ? addId : removeId);
      setSavedMessage(
        wasSaved
          ? 'Could not remove this saved listing. Try again.'
          : 'Could not save this listing. Try again.'
      );
    } finally {
      savedPendingRef.current.delete(id);
    }
  }


  function resetSellForm() {
    setSellTitle('');
    setSellPrice('');
    setSellTrade(profileTrade?.trim() || 'General');
    setSellCategory('Power Tools');
    setSellCondition('Used');
    setEditingListingId(null);
    setSellTradeSearch('');
    setSellPhotos([]);
    setInitialRemotePhotoUrls([]);
  }

  async function pickListingPhotos() {
    setSellMessage('');

    const remaining = 6 - sellPhotos.length;
    if (remaining <= 0) {
      setSellMessage('You can add up to 6 photos.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSellMessage('Allow photo library access to add listing photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled) return;

    const selected = result.assets
      .slice(0, remaining)
      .map((asset) => ({
        uri: asset.uri,
        isRemote: false,
      }));

    setSellPhotos((current) => [...current, ...selected].slice(0, 6));
  }

  function removeSellPhoto(index: number) {
    setSellPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  function getStoragePathFromPublicUrl(url: string) {
    const marker = '/storage/v1/object/public/marketplace-images/';
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(url.slice(markerIndex + marker.length));
  }

  async function uploadNewListingPhotos(
    userId: string,
    listingId: string,
    photos: SellPhoto[]
  ) {
    const remoteUrls = photos.filter((photo) => photo.isRemote).map((photo) => photo.uri);
    const localPhotos = photos.filter((photo) => !photo.isRemote);
    const uploadedUrls: string[] = [];

    for (let index = 0; index < localPhotos.length; index += 1) {
      const photo = localPhotos[index];
      const response = await fetch(photo.uri);
      const arrayBuffer = await response.arrayBuffer();

      const extension =
        photo.uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension)
        ? extension
        : 'jpg';

      const path = `${userId}/${listingId}/${Date.now()}-${index}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(path, arrayBuffer, {
          contentType:
            safeExtension === 'png'
              ? 'image/png'
              : safeExtension === 'webp'
                ? 'image/webp'
                : safeExtension === 'heic'
                  ? 'image/heic'
                  : 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(path);

      uploadedUrls.push(data.publicUrl);
    }

    return [...remoteUrls, ...uploadedUrls].slice(0, 6);
  }

  async function removeDiscardedRemotePhotos(currentUrls: string[]) {
    const removed = initialRemotePhotoUrls.filter(
      (url) => !currentUrls.includes(url)
    );

    const paths = removed
      .map(getStoragePathFromPublicUrl)
      .filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error } = await supabase.storage
        .from('marketplace-images')
        .remove(paths);

      if (error) {
        console.error('Marketplace image cleanup error:', error);
      }
    }
  }

  async function createListing() {
    setSellMessage('');
    setMarketplaceMessage('');

    const cleanTitle = sellTitle.trim().replace(/\s+/g, ' ');
    const cleanPrice = sellPrice.replace(/[^0-9.]/g, '');
    const parsedPrice = Number(cleanPrice);

    if (!cleanTitle) {
      setSellMessage('Enter a listing title.');
      return;
    }

    if (cleanTitle.length > 80) {
      setSellMessage('Keep the listing title under 80 characters.');
      return;
    }

    if (!cleanPrice || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setSellMessage('Enter a valid price greater than $0.');
      return;
    }

    if (parsedPrice > 250000) {
      setSellMessage('Price must be $250,000 or less.');
      return;
    }

    try {
      setPhotoUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSellMessage('You must be signed in.');
        return;
      }

      const basePayload = {
        user_id: user.id,
        title: cleanTitle,
        price: parsedPrice,
        trade: sellTrade,
        category: sellCategory,
        condition: sellCondition,
        city: 'Edmonton',
        seller_name: profileName?.trim() || 'Trades Hub User',
        listing_type: 'local',
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      let listingId = editingListingId;

      if (editingListingId) {
        const { error } = await supabase
          .from('marketplace_listings')
          .update(basePayload)
          .eq('id', editingListingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .insert(basePayload)
          .select('id')
          .single();

        if (error) throw error;
        listingId = data.id;
      }

      if (!listingId) {
        throw new Error('Could not determine the listing ID.');
      }

      const imageUrls = await uploadNewListingPhotos(
        user.id,
        listingId,
        sellPhotos
      );

      const { error: imageUpdateError } = await supabase
        .from('marketplace_listings')
        .update({
          image_urls: imageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (imageUpdateError) throw imageUpdateError;

      if (editingListingId) {
        await removeDiscardedRemotePhotos(imageUrls);
      }

      resetSellForm();
      setMarketplaceView('browse');
      await loadMarketplaceListings();
    } catch (error: any) {
      console.error('Marketplace listing save error:', error);
      setSellMessage(error?.message || 'Could not save this listing.');
    } finally {
      setPhotoUploading(false);
    }
  }

  function editListing(item: Listing) {
    if (!item.isOwn) return;

    setEditingListingId(item.id);
    setSellTitle(item.title);
    setSellPrice(item.price.replace('$', '').replace(/,/g, ''));
    setSellTrade(item.trade);
    setSellCategory(item.category);
    setSellCondition(item.meta.toLowerCase().includes('new') ? 'New' : 'Used');

    const existingPhotos = item.imageUrls || [];
    setSellPhotos(existingPhotos.map((uri) => ({ uri, isRemote: true })));
    setInitialRemotePhotoUrls(existingPhotos);

    setSellTradeSearch('');
    setSellMessage('');
    setMarketplaceView('sell');
  }

  async function deleteListing(id: string) {
    try {
      setMarketplaceMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMarketplaceMessage('You must be signed in.');
        return;
      }

      const { data: storedFiles, error: listError } = await supabase.storage
        .from('marketplace-images')
        .list(`${user.id}/${id}`);

      if (!listError && storedFiles && storedFiles.length > 0) {
        const paths = storedFiles.map(
          (file) => `${user.id}/${id}/${file.name}`
        );

        const { error: storageDeleteError } = await supabase.storage
          .from('marketplace-images')
          .remove(paths);

        if (storageDeleteError) {
          console.error('Marketplace image delete error:', storageDeleteError);
        }
      }

      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedIds((current) => current.filter((item) => item !== id));

      // Best-effort cleanup of the owner's own bookmark for this listing.
      const { error: savedDeleteError } = await supabase
        .from('marketplace_saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_source', SAVED_ITEM_SOURCE)
        .eq('item_id', id);

      if (savedDeleteError) {
        console.error('Marketplace saved item cleanup error:', savedDeleteError);
      }

      await loadMarketplaceListings();
    } catch (error: any) {
      console.error('Marketplace listing delete error:', error);
      setMarketplaceMessage(
        error?.message || 'Could not delete this listing.'
      );
    }
  }

  return (
    <View>
      <View style={styles.marketplaceHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Marketplace</Text>
          <Text style={styles.pageSubtitle}>
            Tools, equipment and local trade deals in one place.
          </Text>
        </View>

        <View style={styles.marketplaceHeaderBadge}>
          <Ionicons
            name="storefront-outline"
            size={22}
            color={marketplaceColor}
          />
        </View>
      </View>

      <View style={styles.marketplaceTabs}>
        {[
          ['browse', 'Browse', 'grid-outline'],
          ['deals', 'Store Deals', 'pricetag-outline'],
          ['local', 'Local Listings', 'location-outline'],
          ['retailers', 'Retailers', 'business-outline'],
          ['sell', 'Sell', 'add-circle-outline'],
          ['your', 'Your Listings', 'person-circle-outline'],
          ['saved', 'Saved', 'bookmark-outline'],
        ].map(([value, label, icon]) => {
          const selected = marketplaceView === value;

          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.marketplaceTab,
                selected && styles.marketplaceTabSelected,
              ]}
              onPress={() => setMarketplaceView(value as MarketplaceView)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={icon as any}
                size={17}
                color={selected ? '#0B1623' : marketplaceColor}
              />
              <Text
                style={[
                  styles.marketplaceTabText,
                  selected && styles.marketplaceTabTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {marketplaceView === 'deals' ? (
        <View>
          <View style={styles.dealScannerHero}>
            <View style={styles.dealScannerHeroIcon}>
              <Ionicons name="scan-outline" size={28} color={marketplaceColor} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.dealScannerEyebrow}>DEAL SCANNER</Text>
              <Text style={styles.dealScannerTitle}>
                Best prices for your trade
              </Text>
              <Text style={styles.dealScannerSubtitle}>
                Trades Hub compares retailer offers and puts the lowest current
                price first.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.dealRefreshButton}
              onPress={loadDealScanner}
              disabled={dealLoading}
            >
              <Ionicons
                name="refresh"
                size={17}
                color={dealLoading ? '#667788' : marketplaceColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dealTradePanel}>
            <Text style={styles.dealTradeLabel}>TRADE</Text>

            <View style={styles.marketplaceTradeChips}>
              {PRIMARY_DEAL_TRADES.concat(
                PRIMARY_DEAL_TRADES.includes(dealTrade) ? [] : [dealTrade]
              ).map((trade) => {
                const selected = dealTrade === trade;

                return (
                  <TouchableOpacity
                    key={trade}
                    style={[
                      styles.marketplaceTradeChip,
                      selected && styles.marketplaceTradeChipSelected,
                    ]}
                    onPress={() => {
                      setDealTrade(trade);
                      setDealRelevanceFilter('all');
                      setDealCategoryFilter('all');
                    }}
                  >
                    <Text
                      style={[
                        styles.marketplaceTradeChipText,
                        selected && styles.marketplaceTradeChipTextSelected,
                      ]}
                    >
                      {tradeAliasMap[trade] || trade}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.marketplaceTradeChipMore}
                onPress={() => setShowTradeSheet(true)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={14}
                  color={marketplaceColor}
                />
                <Text style={styles.marketplaceTradeChipMoreText}>
                  See all trades
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dealTradeCurrent}>
              Showing deals for {getTradeDisplayName(dealTrade)} in {dealCity}
            </Text>

            <Text style={styles.dealFilterSectionLabel}>LOCATION</Text>
            <View style={styles.dealFilterRow}>
              {dealCityOptions.map((city) => {
                const selected = dealCity === city;

                return (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.dealFilterChip,
                      selected && styles.dealFilterChipSelected,
                    ]}
                    onPress={() => setDealCity(city)}
                  >
                    <Text
                      style={[
                        styles.dealFilterChipText,
                        selected && styles.dealFilterChipTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.dealDivider} />

            <Text style={styles.dealFilterSectionLabel}>TOOL TYPE</Text>
            <View style={styles.dealFilterRow}>
              {[
                ['all', 'All Tools'],
                ['trade_specific', 'Trade-Specific'],
                ['general', 'General Tools'],
              ].map(([value, label]) => {
                const selected = dealRelevanceFilter === value;

                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.dealFilterChip,
                      selected && styles.dealFilterChipSelected,
                    ]}
                    onPress={() =>
                      setDealRelevanceFilter(
                        value as 'all' | 'trade_specific' | 'general'
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.dealFilterChipText,
                        selected && styles.dealFilterChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.dealFilterSectionLabel}>CATEGORY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealCategoryRow}
            >
              <TouchableOpacity
                style={[
                  styles.dealCategoryChip,
                  dealCategoryFilter === 'all' &&
                    styles.dealCategoryChipSelected,
                ]}
                onPress={() => setDealCategoryFilter('all')}
              >
                <Text
                  style={[
                    styles.dealCategoryChipText,
                    dealCategoryFilter === 'all' &&
                      styles.dealCategoryChipTextSelected,
                  ]}
                >
                  All Categories
                </Text>
              </TouchableOpacity>

              {dealCategoryOptions.map((category) => {
                const selected = dealCategoryFilter === category.slug;

                return (
                  <TouchableOpacity
                    key={category.slug}
                    style={[
                      styles.dealCategoryChip,
                      selected && styles.dealCategoryChipSelected,
                    ]}
                    onPress={() => setDealCategoryFilter(category.slug)}
                  >
                    <Text
                      style={[
                        styles.dealCategoryChipText,
                        selected && styles.dealCategoryChipTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {dealMessage ? (
            <Text style={styles.marketplaceMessage}>{dealMessage}</Text>
          ) : null}

          {dealLoading || !dealScannerRequested ? (
            <View style={styles.marketplaceLoadingCard}>
              <Text style={styles.marketplaceLoadingText}>
                Comparing retailer prices…
              </Text>
            </View>
          ) : filteredDealProducts.length > 0 ? (
            <View style={styles.dealProductGrid}>
              {filteredDealProducts.map((product) => {
                const bestOffer = product.offers[0];
                const highestOffer =
                  product.offers.length > 1
                    ? product.offers[product.offers.length - 1]
                    : null;
                const savings =
                  highestOffer && highestOffer.price > bestOffer.price
                    ? highestOffer.price - bestOffer.price
                    : 0;

                return (
                  <View key={product.id} style={styles.dealProductCard}>
                    {(product.mediaUrls?.[0] ||
                      product.imageUrl ||
                      product.imageUrls?.[0]) &&
                    !failedImageIds.has(product.id) ? (
                      <Image
                        source={{
                          uri:
                            product.mediaUrls?.[0] ||
                            product.imageUrl ||
                            product.imageUrls?.[0],
                        }}
                        style={styles.dealProductImage}
                        resizeMode="contain"
                        onError={() =>
                          setFailedImageIds((current) => {
                            const next = new Set(current);
                            next.add(product.id);
                            return next;
                          })
                        }
                      />
                    ) : (
                      <View style={styles.dealProductImagePlaceholder}>
                        <Ionicons
                          name="construct-outline"
                          size={44}
                          color={marketplaceColor}
                        />
                        <Text style={styles.dealProductImagePlaceholderText}>
                          No product media yet
                        </Text>
                      </View>
                    )}

                    <View style={styles.dealProductBody}>
                      <Text style={styles.dealProductBrand}>
                        {product.brand.toUpperCase()}
                      </Text>
                      <Text style={styles.dealProductName} numberOfLines={2}>
                        {product.name}
                      </Text>

                      {product.modelNumber ? (
                        <Text style={styles.dealProductModel}>
                          {product.modelNumber}
                        </Text>
                      ) : null}

                      <View style={styles.dealProductTaxonomy}>
                        <Text style={styles.dealProductTaxonomyText}>
                          {product.categoryName || product.category}
                        </Text>
                        {product.subcategoryName ? (
                          <Text style={styles.dealProductTaxonomySubtext}>
                            {product.subcategoryName}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.bestPricePanel}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bestPriceLabel}>BEST AVAILABLE PRICE</Text>
                          <Text style={styles.bestPriceStore}>
                            {bestOffer.storeLocation || bestOffer.retailerName}
                          </Text>
                          {bestOffer.storeLocation ? (
                            <Text style={styles.bestPriceRetailer}>
                              {bestOffer.retailerName}
                            </Text>
                          ) : null}
                          <Text style={styles.bestPriceUpdated}>
                            {formatOfferAge(bestOffer.lastCheckedAt)}
                          </Text>
                        </View>

                        <View style={styles.bestPriceAmountWrap}>
                          <Text style={styles.bestPriceAmount}>
                            ${bestOffer.price.toFixed(2)}
                          </Text>
                          {bestOffer.province === 'Alberta' ? (
                            <Text style={styles.bestPriceGst}>
                              ${(bestOffer.price * (1 + ALBERTA_GST_RATE)).toFixed(2)} est. with GST
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {savings > 0 ? (
                        <View style={styles.dealSavingsBadge}>
                          <Ionicons
                            name="trending-down"
                            size={13}
                            color="#70C78D"
                          />
                          <Text style={styles.dealSavingsText}>
                            Save ${savings.toFixed(2)} vs highest listed price
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.offerCompareHeader}>
                        <View>
                          <Text style={styles.offerCompareHeaderTitle}>
                            SEE ALL PRICES ({product.offers.length})
                          </Text>
                          <Text style={styles.offerCompareHeaderText}>
                            Verified offers currently available in {dealCity}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.offerCompareList}>
                        {product.offers.map((offer, index) => (
                          <TouchableOpacity
                            key={offer.id}
                            style={styles.offerCompareRow}
                            activeOpacity={offer.productUrl ? 0.8 : 1}
                            onPress={() => openRetailerOffer(offer)}
                            disabled={!offer.productUrl}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.offerStoreName}>
                                {offer.storeLocation || offer.retailerName}
                              </Text>
                              {offer.storeLocation ? (
                                <Text style={styles.offerRetailerName}>
                                  {offer.retailerName}
                                </Text>
                              ) : null}
                              <Text style={styles.offerStatusText}>
                                {offer.inStock === false
                                  ? 'Out of stock'
                                  : index === 0
                                    ? 'Lowest available price'
                                    : offer.clearance
                                      ? 'Clearance'
                                      : offer.sale
                                        ? 'Sale price'
                                        : 'Current price'}
                                {' · '}
                                {formatOfferAge(offer.lastCheckedAt)}
                              </Text>
                            </View>

                            <View style={styles.offerPriceColumn}>
                              <Text
                                style={[
                                  styles.offerPrice,
                                  index === 0 && styles.offerPriceBest,
                                ]}
                              >
                                ${offer.price.toFixed(2)}
                              </Text>
                              {offer.province === 'Alberta' ? (
                                <Text style={styles.offerGstText}>
                                  ${(offer.price * (1 + ALBERTA_GST_RATE)).toFixed(2)} w/ GST
                                </Text>
                              ) : null}
                            </View>

                            {index === 0 ? (
                              <View style={styles.bestOfferBadge}>
                                <Text style={styles.bestOfferBadgeText}>BEST</Text>
                              </View>
                            ) : null}

                            {offer.productUrl ? (
                              <View style={styles.offerLinkButton}>
                                <Text style={styles.offerLinkButtonText}>VIEW</Text>
                                <Ionicons
                                  name="open-outline"
                                  size={13}
                                  color={marketplaceColor}
                                />
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.dealPrimaryButton}
                        disabled={!bestOffer.productUrl}
                        onPress={() => openRetailerOffer(bestOffer)}
                      >
                        <Text style={styles.dealPrimaryButtonText}>
                          VIEW BEST DEAL
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color="#0B1623"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="scan-outline"
                size={34}
                color={marketplaceColor}
              />
              <Text style={styles.emptyTitle}>
                No Deal Scanner products yet
              </Text>
              <Text style={styles.emptyText}>
                The comparison engine is connected. Add retailer product records
                for {getTradeDisplayName(dealTrade)} in {dealCity} and they will appear here
                automatically.
              </Text>
            </View>
          )}
        </View>
      ) : marketplaceView === 'retailers' ? (
        <View>
          <View style={styles.marketplaceSectionHeader}>
            <View>
              <Text style={styles.marketplaceSectionTitle}>Retailers</Text>
              <Text style={styles.marketplaceSectionMeta}>
                Browse trade-focused stores and major retailers.
              </Text>
            </View>
          </View>

          <View style={styles.retailerGrid}>
            {[
              ['Home Depot', 'Tools, materials and building supplies'],
              ['RONA', 'Building materials, tools and home improvement'],
              ['KMS Tools', 'Professional tools and shop equipment'],
              ['Princess Auto', 'Tools, shop equipment and industrial supplies'],
              ['Grainger Canada', 'Industrial, safety and maintenance supplies'],
              ['Vallen', 'Industrial tools, safety and MRO supplies'],
              ['Gregg Distributors', 'Industrial parts, tools and shop supplies'],
              ['Bolt Supply House', 'Fasteners, tools and industrial supplies'],
              ['Canadian Tire', 'Automotive, tools and general hardware'],
              ['Local Trade Suppliers', 'Independent supplier stores near you'],
            ].map(([name, description]) => (
              <View key={name} style={styles.retailerCard}>
                <View style={styles.retailerIcon}>
                  <Ionicons
                    name="business-outline"
                    size={24}
                    color={marketplaceColor}
                  />
                </View>
                <Text style={styles.retailerName}>{name}</Text>
                <Text style={styles.retailerText}>{description}</Text>
                <TouchableOpacity style={styles.retailerButton}>
                  <Text style={styles.retailerButtonText}>VIEW STORE</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={marketplaceColor}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : marketplaceView === 'sell' ? (
        <View style={styles.sellCard}>
          <View style={styles.sellHeader}>
            <View style={styles.marketplaceActionIcon}>
              <Ionicons
                name="add-circle-outline"
                size={30}
                color={marketplaceColor}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.marketplaceActionTitle}>
                {editingListingId ? 'Edit listing' : 'Create listing'}
              </Text>
              <Text style={styles.marketplaceActionTextLeft}>
                List tools, equipment and trade-related items for local buyers.
              </Text>
            </View>
          </View>

          <Text style={styles.sellLabel}>TITLE</Text>
          <TextInput
            style={styles.sellInput}
            placeholder="Example: Ridgid 300 Pipe Threader"
            placeholderTextColor="#667788"
            value={sellTitle}
            onChangeText={setSellTitle}
          />

          <Text style={styles.sellLabel}>PRICE</Text>
          <TextInput
            style={styles.sellInput}
            placeholder="1850"
            placeholderTextColor="#667788"
            keyboardType="decimal-pad"
            maxLength={11}
            value={sellPrice}
            onChangeText={setSellPrice}
          />

          <Text style={styles.sellLabel}>PHOTOS</Text>

          <View style={styles.sellPhotoSection}>
            <View style={styles.sellPhotoHeader}>
              <View>
                <Text style={styles.sellPhotoTitle}>Listing photos</Text>
                <Text style={styles.sellPhotoHint}>
                  Add up to 6 photos. The first photo becomes the cover.
                </Text>
              </View>

              <Text style={styles.sellPhotoCount}>{sellPhotos.length}/6</Text>
            </View>

            {sellPhotos.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sellPhotoPreviewRow}
              >
                {sellPhotos.map((photo, index) => (
                  <View key={`${photo.uri}-${index}`} style={styles.sellPhotoPreviewWrap}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.sellPhotoPreview}
                      resizeMode="cover"
                    />

                    {index === 0 ? (
                      <View style={styles.coverPhotoBadge}>
                        <Text style={styles.coverPhotoBadgeText}>COVER</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removeSellPhoto(index)}
                    >
                      <Ionicons name="close" size={14} color={Brand.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <TouchableOpacity
              style={[
                styles.addPhotoButton,
                sellPhotos.length >= 6 && styles.addPhotoButtonDisabled,
              ]}
              onPress={pickListingPhotos}
              disabled={sellPhotos.length >= 6 || photoUploading}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color={sellPhotos.length >= 6 ? '#52606D' : marketplaceColor}
              />
              <Text
                style={[
                  styles.addPhotoButtonText,
                  sellPhotos.length >= 6 && { color: '#52606D' },
                ]}
              >
                {sellPhotos.length > 0 ? 'ADD MORE PHOTOS' : 'ADD PHOTOS'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sellLabel}>TRADE</Text>

          <View style={styles.sellTradeSearchBox}>
            <Ionicons name="search-outline" size={17} color="#7F8C99" />
            <TextInput
              style={styles.sellTradeSearchInput}
              placeholder="Type a trade"
              placeholderTextColor="#667788"
              value={sellTradeSearch}
              onChangeText={setSellTradeSearch}
            />
          </View>

          {sellTradeSearch.trim() ? (
            <View style={styles.tradeSearchResults}>
              {sellTradeChoices.length > 0 ? (
                sellTradeChoices.map((item, index) => {
                  const selected = sellTrade === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.tradeSearchResultRow,
                        index < sellTradeChoices.length - 1 &&
                          styles.tradeSearchResultRowBorder,
                        selected && styles.tradeSearchResultRowSelected,
                      ]}
                      onPress={() => {
                        setSellTrade(item);
                        setSellTradeSearch('');
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tradeSearchResultTitle,
                            selected && { color: marketplaceColor },
                          ]}
                        >
                          {tradeAliasMap[item] || item}
                        </Text>

                        {tradeAliasMap[item] ? (
                          <Text style={styles.tradeSearchResultOfficial}>
                            Official: {item}
                          </Text>
                        ) : null}
                      </View>

                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'chevron-forward'}
                        size={17}
                        color={selected ? marketplaceColor : '#667788'}
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.tradeSearchEmpty}>
                  No matching official Alberta trade found.
                </Text>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.tradeSearchHint}>
                Popular trades — type above to search every Alberta trade profile.
              </Text>

              <View style={styles.marketplaceTradeChips}>
                {sellTradeChoices.map((item) => {
                  const selected = sellTrade === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.marketplaceTradeChip,
                        selected && styles.marketplaceTradeChipSelected,
                      ]}
                      onPress={() => setSellTrade(item)}
                    >
                      <Text
                        style={[
                          styles.marketplaceTradeChipText,
                          selected && styles.marketplaceTradeChipTextSelected,
                        ]}
                      >
                        {tradeAliasMap[item] || item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.sellLabel}>CATEGORY</Text>
          <View style={styles.marketplaceTradeChips}>
            {categoryOptions.map((item) => {
              const selected = sellCategory === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.marketplaceTradeChip,
                    selected && styles.marketplaceTradeChipSelected,
                  ]}
                  onPress={() => setSellCategory(item)}
                >
                  <Text
                    style={[
                      styles.marketplaceTradeChipText,
                      selected && styles.marketplaceTradeChipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sellLabel}>CONDITION</Text>
          <View style={styles.marketplaceTradeChips}>
            {['New', 'Used'].map((item) => {
              const selected = sellCondition === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.marketplaceTradeChip,
                    selected && styles.marketplaceTradeChipSelected,
                  ]}
                  onPress={() => setSellCondition(item)}
                >
                  <Text
                    style={[
                      styles.marketplaceTradeChipText,
                      selected && styles.marketplaceTradeChipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {sellMessage ? (
            <Text style={styles.sellMessage}>{sellMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.marketplacePrimaryButton,
              photoUploading && { opacity: 0.65 },
            ]}
            onPress={createListing}
            disabled={photoUploading}
          >
            <Ionicons
              name={photoUploading ? 'cloud-upload-outline' : 'add-circle-outline'}
              size={18}
              color="#0B1623"
            />
            <Text style={styles.marketplacePrimaryButtonText}>
              {photoUploading
                ? 'UPLOADING PHOTOS...'
                : editingListingId
                  ? 'SAVE CHANGES'
                  : 'CREATE LISTING'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.marketplaceSearchRow}>
            <View style={styles.marketplaceSearchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#7F8C99"
              />

              <TextInput
                style={styles.marketplaceSearchInput}
                placeholder="Search tools, equipment or brands"
                placeholderTextColor="#667788"
                value={marketplaceSearch}
                onChangeText={setMarketplaceSearch}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.marketplaceFilterButton,
                showFilters && styles.marketplaceFilterButtonActive,
              ]}
              onPress={() => setShowFilters((current) => !current)}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={marketplaceColor}
              />
              <Text style={styles.marketplaceFilterText}>FILTERS</Text>
            </TouchableOpacity>
          </View>

          {showFilters ? (
            <View style={styles.filterPanel}>
              <Text style={styles.filterLabel}>TRADE</Text>
              <View style={styles.marketplaceTradeChips}>
                {availableTrades.map((trade) => {
                  const selected = marketplaceTrade === trade;

                  return (
                    <TouchableOpacity
                      key={trade === 'All trades' ? trade : getTradeDisplayName(trade)}
                      style={[
                        styles.marketplaceTradeChip,
                        selected && styles.marketplaceTradeChipSelected,
                      ]}
                      onPress={() => setMarketplaceTrade(trade)}
                    >
                      <Text
                        style={[
                          styles.marketplaceTradeChipText,
                          selected &&
                            styles.marketplaceTradeChipTextSelected,
                        ]}
                      >
                        {trade}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterLabel}>CATEGORY</Text>
              <View style={styles.marketplaceTradeChips}>
                {['All categories', ...categoryOptions].map((category) => {
                  const selected = marketplaceCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.marketplaceTradeChip,
                        selected && styles.marketplaceTradeChipSelected,
                      ]}
                      onPress={() => setMarketplaceCategory(category)}
                    >
                      <Text
                        style={[
                          styles.marketplaceTradeChipText,
                          selected &&
                            styles.marketplaceTradeChipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.marketplaceSectionHeader}>
            <View>
              <Text style={styles.marketplaceSectionTitle}>
                {marketplaceView === 'local'
                  ? 'Local listings'
                  : marketplaceView === 'your'
                    ? 'Your listings'
                    : marketplaceView === 'saved'
                      ? 'Saved listings'
                      : 'Featured near you'}
              </Text>

              <Text style={styles.marketplaceSectionMeta}>
                {marketplaceView === 'saved'
                  ? `${savedListingCount} saved listing${
                      savedListingCount === 1 ? '' : 's'
                    }`
                  : `${filteredListings.length} listing${
                      filteredListings.length === 1 ? '' : 's'
                    }`}
              </Text>
            </View>
          </View>

          {marketplaceMessage ? (
            <Text style={styles.marketplaceMessage}>{marketplaceMessage}</Text>
          ) : null}

          {savedMessage ? (
            <Text style={styles.marketplaceMessage}>{savedMessage}</Text>
          ) : null}

          {marketplaceView === 'your' ? (
            <View style={styles.yourListingsManager}>
              <View style={{ flex: 1 }}>
                <Text style={styles.yourListingsManagerTitle}>
                  Manage your listings
                </Text>
                <Text style={styles.yourListingsManagerText}>
                  Edit, delete, or create another Marketplace listing.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.yourListingsCreateButton}
                onPress={() => {
                  resetSellForm();
                  setMarketplaceView('sell');
                }}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color="#0B1623"
                />
                <Text style={styles.yourListingsCreateButtonText}>
                  NEW LISTING
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {listingsLoading ? (
            <View style={styles.marketplaceLoadingCard}>
              <Text style={styles.marketplaceLoadingText}>
                Loading Marketplace listings…
              </Text>
            </View>
          ) : filteredListings.length > 0 ? (
            <View style={styles.marketplaceGrid}>
              {filteredListings.map((item) => {
                const saved = savedIds.includes(item.id);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setSelectedPhotoIndex(0);
                      setSelectedListing(item);
                    }}
                    onHoverIn={(event: any) => {
                      if (event?.currentTarget?.style) {
                        event.currentTarget.style.borderColor = '#D2B95B';
                      }
                    }}
                    onHoverOut={(event: any) => {
                      if (event?.currentTarget?.style) {
                        event.currentTarget.style.borderColor = '#26394C';
                      }
                    }}
                    style={({ pressed }) => [
                      styles.marketplaceListingCard,
                      pressed && styles.marketplaceListingCardPressed,
                    ]}
                  >
                    {item.imageUrls?.[0] && !failedImageIds.has(item.id) ? (
                      <Image
                        source={{ uri: item.imageUrls[0] }}
                        style={styles.marketplaceListingImage}
                        resizeMode="cover"
                        onError={() =>
                          setFailedImageIds((current) => {
                            const next = new Set(current);
                            next.add(item.id);
                            return next;
                          })
                        }
                      />
                    ) : (
                      <View style={styles.marketplaceListingImagePlaceholder}>
                        <Ionicons
                          name={item.icon}
                          size={34}
                          color={marketplaceColor}
                        />
                      </View>
                    )}

                    <View style={styles.marketplaceListingTop}>
                      <View style={styles.marketplaceListingTopSpacer} />

                      <TouchableOpacity
                        style={[
                          styles.marketplaceSaveButton,
                          saved && styles.marketplaceSaveButtonActive,
                        ]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={(event: any) => {
                          event?.stopPropagation?.();
                          toggleSaved(item.id);
                        }}
                      >
                        <Ionicons
                          name={saved ? 'bookmark' : 'bookmark-outline'}
                          size={19}
                          color={saved ? marketplaceColor : '#7F8C99'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.listingBadgeRow}>
                      <View style={styles.marketplaceListingLabel}>
                        <Text style={styles.marketplaceListingLabelText}>
                          {item.label}
                        </Text>
                      </View>

                      {item.isOwn ? (
                        <View style={styles.ownListingBadge}>
                          <Text style={styles.ownListingBadgeText}>YOUR LISTING</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text
                      style={styles.marketplaceListingTitle}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    <Text style={styles.marketplaceListingTrade}>
                      {getTradeDisplayName(item.trade)}
                    </Text>

                    <Text
                      style={styles.marketplaceListingLocationMeta}
                      numberOfLines={1}
                    >
                      {item.meta}
                    </Text>

                    <View style={styles.marketplaceListingBottom}>
                      <Text style={styles.marketplaceListingPrice}>
                        {item.price}
                      </Text>

                      {item.isOwn ? (
                        <TouchableOpacity
                          style={styles.marketplaceContactButton}
                          onPress={(event: any) => {
                            event?.stopPropagation?.();
                            editListing(item);
                          }}
                        >
                          <Ionicons name="create-outline" size={15} color="#0B1623" />
                          <Text style={styles.marketplaceContactButtonText}>
                            EDIT
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.marketplaceContactButton}
                          onPress={(event: any) => {
                            event?.stopPropagation?.();
                            setMarketplaceMessage(
                              'Seller contact and messaging are coming in the next Marketplace build.'
                            );
                          }}
                        >
                          <Ionicons name="chatbubble-outline" size={15} color="#0B1623" />
                          <Text style={styles.marketplaceContactButtonText}>
                            CONTACT
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  marketplaceView === 'your'
                    ? 'person-circle-outline'
                    : marketplaceView === 'saved'
                      ? 'bookmark-outline'
                      : 'search-outline'
                }
                size={26}
                color={marketplaceColor}
              />

              <Text style={styles.emptyTitle}>
                {marketplaceView === 'saved'
                  ? 'No saved listings yet'
                  : 'No matching listings'}
              </Text>

              <Text style={styles.emptyText}>
                {marketplaceView === 'saved'
                  ? 'Save tools and deals from Browse or Deals and they will appear here.'
                  : 'Try another search term or change your filters.'}
              </Text>
            </View>
          )}
        </>
      )}

      <Modal
        visible={Boolean(selectedListing)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedPhotoIndex(0);
          setSelectedListing(null);
        }}
      >
        <Pressable
          style={styles.listingModalBackdrop}
          onPress={() => {
            setSelectedPhotoIndex(0);
            setSelectedListing(null);
          }}
        >
          <Pressable
            style={styles.listingModalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.listingModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listingModalEyebrow}>
                  {selectedListing?.label}
                </Text>
                <Text style={styles.listingModalTitle}>
                  {selectedListing?.title}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.listingModalClose}
                activeOpacity={0.75}
                onPress={() => {
                  setSelectedPhotoIndex(0);
                  setSelectedListing(null);
                }}
              >
                <Ionicons name="close" size={24} color={Brand.white} />
              </TouchableOpacity>
            </View>

            {selectedListing?.imageUrls?.length ? (
              <View style={styles.listingPhotoGallery}>
                <View style={styles.listingHeroImageWrap}>
                  <Image
                    source={{
                      uri:
                        selectedListing.imageUrls[
                          Math.min(selectedPhotoIndex, selectedListing.imageUrls.length - 1)
                        ],
                    }}
                    style={styles.listingHeroImage}
                    resizeMode="contain"
                  />

                  {selectedListing.imageUrls.length > 1 ? (
                    <>
                      <TouchableOpacity
                        style={[styles.galleryArrow, styles.galleryArrowLeft]}
                        onPress={() => {
                          const total = selectedListing.imageUrls?.length || 1;
                          setSelectedPhotoIndex((current) =>
                            current <= 0 ? total - 1 : current - 1
                          );
                        }}
                      >
                        <Ionicons name="chevron-back" size={22} color={Brand.white} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.galleryArrow, styles.galleryArrowRight]}
                        onPress={() => {
                          const total = selectedListing.imageUrls?.length || 1;
                          setSelectedPhotoIndex((current) =>
                            current >= total - 1 ? 0 : current + 1
                          );
                        }}
                      >
                        <Ionicons name="chevron-forward" size={22} color={Brand.white} />
                      </TouchableOpacity>

                      <View style={styles.galleryCounter}>
                        <Text style={styles.galleryCounterText}>
                          {selectedPhotoIndex + 1}/{selectedListing.imageUrls.length}
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                {selectedListing.imageUrls.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listingThumbnailRow}
                  >
                    {selectedListing.imageUrls.map((uri, index) => (
                      <TouchableOpacity
                        key={`${uri}-${index}`}
                        onPress={() => setSelectedPhotoIndex(index)}
                        style={[
                          styles.listingThumbnailButton,
                          selectedPhotoIndex === index &&
                            styles.listingThumbnailButtonSelected,
                        ]}
                      >
                        <Image
                          source={{ uri }}
                          style={styles.listingThumbnail}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : null}
              </View>
            ) : (
              <View style={styles.listingHeroPlaceholder}>
                <Ionicons
                  name={selectedListing?.icon || 'cube-outline'}
                  size={48}
                  color={marketplaceColor}
                />
                <Text style={styles.listingHeroPlaceholderText}>
                  No photos added
                </Text>
              </View>
            )}

            <Text style={styles.listingModalPrice}>
              {selectedListing?.price}
            </Text>

            <View style={styles.listingDetailGrid}>
              <View style={styles.listingDetailItem}>
                <Text style={styles.listingDetailLabel}>TRADE</Text>
                <Text style={styles.listingDetailValue}>{selectedListing?.trade}</Text>
              </View>

              <View style={styles.listingDetailItem}>
                <Text style={styles.listingDetailLabel}>CATEGORY</Text>
                <Text style={styles.listingDetailValue}>{selectedListing?.category}</Text>
              </View>

              <View style={styles.listingDetailItem}>
                <Text style={styles.listingDetailLabel}>DETAILS</Text>
                <Text style={styles.listingDetailValue}>{selectedListing?.meta}</Text>
              </View>

              <View style={styles.listingDetailItem}>
                <Text style={styles.listingDetailLabel}>SELLER</Text>
                <Text style={styles.listingDetailValue}>{selectedListing?.listerName}</Text>
              </View>
            </View>

            {savedMessage ? (
              <Text style={styles.marketplaceMessage}>{savedMessage}</Text>
            ) : null}

            <View style={styles.listingModalActions}>
              <TouchableOpacity
                style={styles.listingSaveAction}
                onPress={() => {
                  if (selectedListing) toggleSaved(selectedListing.id);
                }}
              >
                <Ionicons
                  name={
                    selectedListing && savedIds.includes(selectedListing.id)
                      ? 'bookmark'
                      : 'bookmark-outline'
                  }
                  size={17}
                  color={marketplaceColor}
                />
                <Text style={styles.listingSaveActionText}>
                  {selectedListing && savedIds.includes(selectedListing.id)
                    ? 'SAVED'
                    : 'SAVE'}
                </Text>
              </TouchableOpacity>

              {selectedListing?.isOwn ? (
                <>
                  <TouchableOpacity
                    style={styles.listingSecondaryAction}
                    onPress={() => {
                      const item = selectedListing;
                      setSelectedListing(null);
                      editListing(item);
                    }}
                  >
                    <Ionicons name="create-outline" size={17} color={Brand.white} />
                    <Text style={styles.listingSecondaryActionText}>EDIT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.listingDeleteAction}
                    onPress={() => {
                      const id = selectedListing.id;
                      setSelectedListing(null);
                      deleteListing(id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={17} color="#E56B6B" />
                    <Text style={styles.listingDeleteActionText}>DELETE</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.listingPrimaryAction}
                  onPress={() => {
                    setMarketplaceMessage(
                      'Seller contact and messaging are coming in the next Marketplace build.'
                    );
                    setSelectedListing(null);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={17} color="#0B1623" />
                  <Text style={styles.listingPrimaryActionText}>CONTACT SELLER</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showTradeSheet}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDealTradeSearch('');
          setShowTradeSheet(false);
        }}
      >
        <Pressable
          style={styles.listingModalBackdrop}
          onPress={() => {
            setDealTradeSearch('');
            setShowTradeSheet(false);
          }}
        >
          <Pressable
            style={styles.tradeSheetCard}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.tradeSheetHeader}>
              <Text style={styles.tradeSheetTitle}>All trades</Text>

              <TouchableOpacity
                style={styles.tradeSheetClose}
                onPress={() => {
                  setDealTradeSearch('');
                  setShowTradeSheet(false);
                }}
              >
                <Ionicons name="close" size={22} color={Brand.white} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.dealTradeSearch}
              placeholder="Search trades"
              placeholderTextColor="#667788"
              value={dealTradeSearch}
              onChangeText={setDealTradeSearch}
              autoFocus
            />

            <ScrollView
              style={styles.tradeSheetList}
              keyboardShouldPersistTaps="handled"
            >
              {dealTradeSheetOptions.map((trade) => {
                const selected = dealTrade === trade;

                return (
                  <TouchableOpacity
                    key={trade}
                    style={[
                      styles.tradeSheetOption,
                      selected && styles.tradeSheetOptionSelected,
                    ]}
                    onPress={() => {
                      setDealTrade(trade);
                      setDealTradeSearch('');
                      setDealRelevanceFilter('all');
                      setDealCategoryFilter('all');
                      setShowTradeSheet(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.tradeSheetOptionText,
                        selected && styles.tradeSheetOptionTextSelected,
                      ]}
                    >
                      {tradeAliasMap[trade] || trade}
                    </Text>

                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={marketplaceColor}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              {dealTradeSheetOptions.length === 0 ? (
                <Text style={styles.tradeSheetEmptyText}>
                  No trades match "{dealTradeSearch}".
                </Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    color: Brand.white,
    fontSize: 30,
    fontFamily: FontFamily.heading,
  },

  pageSubtitle: {
    color: '#9BA7B4',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },

  marketplaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },

  marketplaceHeaderBadge: {
    width: 46,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marketplaceTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  marketplaceTab: {
    minHeight: 40,
    flexGrow: 1,
    flexBasis: 110,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#3A4652',
    backgroundColor: '#101F30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 13,
  },

  marketplaceTabSelected: {
    backgroundColor: '#D2B95B',
    borderColor: '#D2B95B',
  },

  marketplaceTabText: {
    color: '#D2B95B',
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  marketplaceTabTextSelected: {
    color: '#0B1623',
  },

  marketplaceSearchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 11,
  },

  marketplaceSearchBox: {
    flexGrow: 1,
    flexBasis: 360,
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#101F30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
  },

  marketplaceSearchInput: {
    flex: 1,
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.body,
    paddingVertical: 10,
  },

  marketplaceFilterButton: {
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D2B95B',
    backgroundColor: '#101F30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  marketplaceFilterButtonActive: {
    backgroundColor: '#1A2530',
  },

  marketplaceFilterText: {
    color: '#D2B95B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  filterPanel: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  filterLabel: {
    color: '#8D9AAA',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  marketplaceTradeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  marketplaceTradeChip: {
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 999,
    backgroundColor: '#101F30',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  marketplaceTradeChipSelected: {
    borderColor: '#D2B95B',
    backgroundColor: '#1A2530',
  },

  marketplaceTradeChipText: {
    color: '#7F8C99',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
  },

  marketplaceTradeChipTextSelected: {
    color: '#D2B95B',
  },

  marketplaceTradeChipMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 999,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  marketplaceTradeChipMoreText: {
    color: '#A9B8C4',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
  },

  tradeSheetCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0F1C2A',
    padding: 18,
  },

  tradeSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tradeSheetTitle: {
    color: Brand.white,
    fontSize: 17,
    fontFamily: FontFamily.heading,
  },

  tradeSheetClose: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tradeSheetList: {
    marginTop: 12,
  },

  tradeSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 9,
  },

  tradeSheetOptionSelected: {
    backgroundColor: 'rgba(210, 185, 91, 0.12)',
  },

  tradeSheetOptionText: {
    color: '#C7D0D9',
    fontSize: 14,
    fontFamily: FontFamily.bodyMedium,
  },

  tradeSheetOptionTextSelected: {
    color: '#D2B95B',
    fontFamily: FontFamily.bodySemiBold,
  },

  tradeSheetEmptyText: {
    color: '#7F8C99',
    fontSize: 13,
    fontFamily: FontFamily.body,
    textAlign: 'center',
    paddingVertical: 20,
  },

  marketplaceSectionHeader: {
    marginBottom: 10,
  },

  marketplaceSectionTitle: {
    color: Brand.white,
    fontSize: 17,
    fontFamily: FontFamily.heading,
  },

  marketplaceSectionMeta: {
    color: '#718193',
    fontSize: 10,
    marginTop: 3,
  },

  marketplaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  marketplaceListingCard: {
    flexGrow: 1,
    flexBasis: 245,
    minWidth: 220,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 11,
    padding: 14,
  },

  marketplaceListingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  marketplaceListingCardPressed: {
    opacity: 0.97,
    transform: [{ scale: 0.998 }],
  },

  marketplaceListingTrade: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    marginTop: 5,
  },

  marketplaceListingLocationMeta: {
    color: '#7F8C99',
    fontSize: 10,
    fontFamily: FontFamily.body,
    marginTop: 3,
  },

  marketplaceContactButton: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#D2B95B',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  marketplaceContactButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.4,
  },

  marketplaceListingImage: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#132234',
    marginBottom: 12,
  },

  marketplaceListingImagePlaceholder: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#132234',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  marketplaceListingTopSpacer: {
    width: 1,
    height: 1,
  },

  marketplaceListingIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#162536',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marketplaceSaveButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#304457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marketplaceSaveButtonActive: {
    borderColor: '#D2B95B',
    backgroundColor: '#1A2530',
  },

  listingBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 9,
  },

  ownListingBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#62B77A',
    backgroundColor: 'rgba(98, 183, 122, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  ownListingBadgeText: {
    color: '#62B77A',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  marketplaceListingLabel: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(210, 185, 91, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 9,
  },

  marketplaceListingLabelText: {
    color: '#D2B95B',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  marketplaceListingTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    lineHeight: 18,
  },

  marketplaceLister: {
    color: '#A9B3BF',
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    marginTop: 5,
  },

  marketplaceListingMeta: {
    color: '#7F8C99',
    fontSize: 10,
    marginTop: 4,
  },

  marketplaceListingDetail: {
    color: '#667788',
    fontSize: 9,
    marginTop: 4,
  },

  listingBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  viewListingButton: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#D2B95B',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  viewListingButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  listingModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 10, 18, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  listingModalCard: {
    width: '100%',
    maxWidth: 680,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0F1C2A',
    padding: 18,
  },

  listingModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  listingModalEyebrow: {
    color: '#D2B95B',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  listingModalTitle: {
    color: Brand.white,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: FontFamily.heading,
  },

  listingModalClose: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listingPhotoGallery: {
    marginTop: 16,
  },

  listingHeroImageWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#0A1420',
  },

  listingHeroImage: {
    width: '100%',
    height: 390,
    backgroundColor: '#0A1420',
  },

  galleryArrow: {
    position: 'absolute',
    zIndex: 20,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 22, 35, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#304457',
  },

  galleryArrowLeft: {
    left: 12,
  },

  galleryArrowRight: {
    right: 12,
  },

  galleryCounter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    borderRadius: 7,
    backgroundColor: 'rgba(11, 22, 35, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  galleryCounterText: {
    color: Brand.white,
    fontSize: 9,
    fontFamily: FontFamily.heading,
  },

  listingThumbnailRow: {
    gap: 8,
    paddingTop: 10,
  },

  listingThumbnailButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },

  listingThumbnailButtonSelected: {
    borderColor: '#D2B95B',
  },

  listingThumbnail: {
    width: 86,
    height: 68,
    borderRadius: 6,
    backgroundColor: '#132234',
  },

  listingHeroPlaceholder: {
    minHeight: 210,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#132234',
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  listingHeroPlaceholderText: {
    color: '#718193',
    fontSize: 10,
  },

  listingModalPrice: {
    color: Brand.white,
    fontSize: 24,
    fontFamily: FontFamily.heading,
    marginTop: 16,
  },

  listingDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },

  listingDetailItem: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 180,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    padding: 12,
  },

  listingDetailLabel: {
    color: '#667788',
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  listingDetailValue: {
    color: Brand.white,
    fontSize: 11,
    lineHeight: 16,
  },

  listingModalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },

  listingSaveAction: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4330',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  listingSaveActionText: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
  },

  listingSecondaryAction: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  listingSecondaryActionText: {
    color: Brand.white,
    fontSize: 9,
    fontFamily: FontFamily.heading,
  },

  listingDeleteAction: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#59363A',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  listingDeleteActionText: {
    color: '#E56B6B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
  },

  listingPrimaryAction: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#D2B95B',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  listingPrimaryActionText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.4,
  },

  marketplaceListingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  marketplaceListingPrice: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.display,
  },

  ownerActions: {
    flexDirection: 'row',
    gap: 6,
  },

  ownerActionButton: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marketplaceActionPanel: {
    minHeight: 260,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },

  marketplaceActionIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#162536',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  marketplaceActionTitle: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.heading,
  },

  marketplaceActionText: {
    color: '#7F8C99',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 440,
    marginTop: 6,
  },

  marketplacePrimaryButton: {
    minHeight: 44,
    borderRadius: 9,
    backgroundColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    marginTop: 18,
  },

  marketplacePrimaryButtonText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  sellPhotoSection: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    padding: 12,
    marginBottom: 4,
  },

  sellPhotoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },

  sellPhotoTitle: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  sellPhotoHint: {
    color: '#718193',
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },

  sellPhotoCount: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
  },

  sellPhotoPreviewRow: {
    gap: 8,
    paddingBottom: 10,
  },

  sellPhotoPreviewWrap: {
    width: 104,
    height: 88,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#132234',
  },

  sellPhotoPreview: {
    width: '100%',
    height: '100%',
  },

  coverPhotoBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(11, 22, 35, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  coverPhotoBadgeText: {
    color: '#D2B95B',
    fontSize: 6,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(11, 22, 35, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addPhotoButton: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#4A4330',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  addPhotoButtonDisabled: {
    borderColor: '#26394C',
  },

  addPhotoButtonText: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  sellCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 18,
  },

  sellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },

  marketplaceActionTextLeft: {
    color: '#7F8C99',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  sellLabel: {
    color: '#8D9AAA',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
    marginTop: 12,
    marginBottom: 6,
  },

  sellTradeSearchBox: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0D1A28',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    marginBottom: 8,
  },

  sellTradeSearchInput: {
    flex: 1,
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.body,
  },

  tradeSearchEmpty: {
    color: '#7F8C99',
    fontSize: 9,
    marginTop: -3,
    marginBottom: 8,
  },

  tradeSearchResults: {
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 8,
    backgroundColor: '#101F30',
    marginBottom: 10,
    overflow: 'hidden',
  },

  tradeSearchResultRow: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  tradeSearchResultRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  tradeSearchResultRowSelected: {
    backgroundColor: 'rgba(210, 185, 91, 0.08)',
  },

  tradeSearchResultTitle: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  tradeSearchResultOfficial: {
    color: '#718193',
    fontSize: 8,
    marginTop: 2,
  },

  sellInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0D1A28',
    color: Brand.white,
    fontSize: 11,
    paddingHorizontal: 12,
  },

  sellMessage: {
    color: '#D2B95B',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },

  tradeSearchHint: {
    color: '#667788',
    fontSize: 9,
    marginBottom: 8,
  },

  dealScannerHero: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#101F30',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },

  dealScannerHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#172738',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dealScannerEyebrow: {
    color: '#D2B95B',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.1,
    marginBottom: 4,
  },

  dealScannerTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
  },

  dealScannerSubtitle: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
    maxWidth: 520,
  },

  dealRefreshButton: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#304457',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dealTradePanel: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    padding: 14,
    marginBottom: 12,
  },

  dealTradeLabel: {
    color: '#667788',
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  dealTradeSearch: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#0D1926',
    color: Brand.white,
    paddingHorizontal: 12,
    fontSize: 10,
    marginBottom: 10,
  },

  dealTradeCurrent: {
    color: '#D2B95B',
    fontSize: 9,
    marginTop: 7,
  },

  dealDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 13,
  },

  dealFilterSectionLabel: {
    color: '#667788',
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
    marginBottom: 7,
    marginTop: 4,
  },

  dealFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 10,
  },

  dealFilterChip: {
    minHeight: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#304457',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1926',
  },

  dealFilterChipSelected: {
    borderColor: '#D2B95B',
    backgroundColor: 'rgba(210, 185, 91, 0.10)',
  },

  dealFilterChipText: {
    color: '#8A98A7',
    fontSize: 8,
    fontFamily: FontFamily.heading,
  },

  dealFilterChipTextSelected: {
    color: '#D2B95B',
  },

  dealCategoryRow: {
    gap: 7,
    paddingBottom: 2,
  },

  dealCategoryChip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#304457',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1926',
  },

  dealCategoryChipSelected: {
    borderColor: '#D2B95B',
    backgroundColor: '#162536',
  },

  dealCategoryChipText: {
    color: '#8A98A7',
    fontSize: 8,
    fontFamily: FontFamily.heading,
  },

  dealCategoryChipTextSelected: {
    color: '#D2B95B',
  },

  dealProductGrid: {
    gap: 14,
  },

  dealProductCard: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  dealProductImage: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: '#F4F5F6',
  },

  dealProductImagePlaceholder: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: '#132234',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  dealProductImagePlaceholderText: {
    color: '#718193',
    fontSize: 9,
  },

  dealProductBody: {
    flex: 1,
    padding: 16,
  },

  dealProductBrand: {
    color: '#D2B95B',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  dealProductName: {
    color: Brand.white,
    fontSize: 17,
    lineHeight: 23,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  dealProductModel: {
    color: '#718193',
    fontSize: 8,
    marginTop: 3,
  },

  dealProductTaxonomy: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  dealProductTaxonomyText: {
    color: '#D2B95B',
    fontSize: 8,
    fontFamily: FontFamily.heading,
  },

  dealProductTaxonomySubtext: {
    color: '#7F8C99',
    fontSize: 8,
  },

  bestPricePanel: {
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  bestPriceLabel: {
    color: '#D2B95B',
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.9,
  },

  bestPriceStore: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.heading,
    marginTop: 3,
  },

  bestPriceRetailer: {
    color: '#9BA7B4',
    fontSize: 8,
    marginTop: 2,
  },

  bestPriceUpdated: {
    color: '#718193',
    fontSize: 7,
    marginTop: 4,
  },

  bestPriceAmountWrap: {
    alignItems: 'flex-end',
  },

  bestPriceGst: {
    color: '#8D9AAA',
    fontSize: 7,
    marginTop: 3,
  },

  bestPriceAmount: {
    color: Brand.white,
    fontSize: 23,
    fontFamily: FontFamily.heading,
  },

  dealSavingsBadge: {
    alignSelf: 'flex-start',
    marginTop: 9,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#315D42',
    backgroundColor: '#112A1B',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dealSavingsText: {
    color: '#70C78D',
    fontSize: 8,
    fontFamily: FontFamily.heading,
  },

  offerCompareHeader: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  offerCompareHeaderTitle: {
    color: Brand.white,
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  offerCompareHeaderText: {
    color: '#718193',
    fontSize: 7,
    marginTop: 2,
  },

  offerCompareList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#26394C',
  },

  offerCompareRow: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  offerStoreName: {
    color: Brand.white,
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  offerRetailerName: {
    color: '#9BA7B4',
    fontSize: 7,
    marginTop: 2,
  },

  offerStatusText: {
    color: '#718193',
    fontSize: 7,
    marginTop: 2,
  },

  offerPrice: {
    color: '#A6B1BC',
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  offerPriceBest: {
    color: '#D2B95B',
  },

  offerPriceColumn: {
    alignItems: 'flex-end',
  },

  offerGstText: {
    color: '#667788',
    fontSize: 6,
    marginTop: 2,
  },

  offerLinkButton: {
    minHeight: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A4330',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  offerLinkButtonText: {
    color: '#D2B95B',
    fontSize: 7,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.4,
  },

  bestOfferBadge: {
    borderRadius: 5,
    backgroundColor: '#D2B95B',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  bestOfferBadgeText: {
    color: '#0B1623',
    fontSize: 6,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  dealPrimaryButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#D2B95B',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  dealPrimaryButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  retailerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  retailerCard: {
    flexGrow: 1,
    flexBasis: 230,
    minWidth: 220,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 11,
    padding: 14,
  },

  retailerIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#162536',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  retailerName: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  retailerText: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  retailerButton: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304457',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },

  retailerButtonText: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  yourListingsManager: {
    minHeight: 74,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#304457',
    backgroundColor: '#101F30',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  yourListingsManagerTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  yourListingsManagerText: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  yourListingsCreateButton: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: '#D2B95B',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  yourListingsCreateButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  marketplaceMessage: {
    color: '#E56B6B',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 10,
  },

  marketplaceLoadingCard: {
    minHeight: 120,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#26394C',
    backgroundColor: '#101F30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  marketplaceLoadingText: {
    color: '#7F8C99',
    fontSize: 10,
  },

  emptyState: {
    minHeight: 200,
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
    lineHeight: 15,
    marginTop: 4,
    maxWidth: 420,
    textAlign: 'center',
  },
});
