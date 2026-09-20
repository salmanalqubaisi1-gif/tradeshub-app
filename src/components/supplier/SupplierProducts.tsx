import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Brand, FontFamily } from '../../constants/theme';

type ProductStatus = 'active' | 'draft' | 'out_of_stock';

type ProductItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  inventory: number;
  status: ProductStatus;
};

type Props = {
  roleColor?: string;
};

export default function SupplierProducts({ roleColor = '#E89245' }: Props) {
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 'demo-1', name: 'M18 FUEL Hammer Drill Kit', category: 'Power Tools', price: 329, inventory: 8, status: 'active' },
    { id: 'demo-2', name: 'Ridgid 18V Impact Driver', category: 'Power Tools', price: 219, inventory: 3, status: 'active' },
    { id: 'demo-3', name: 'Klein 11-in-1 Screwdriver', category: 'Hand Tools', price: 24.99, inventory: 0, status: 'out_of_stock' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productInventory, setProductInventory] = useState('');

  const activeCount = useMemo(() => products.filter((p) => p.status === 'active').length, [products]);
  const totalInventory = useMemo(() => products.reduce((sum, p) => sum + p.inventory, 0), [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => p.inventory === 0).length, [products]);

  function addProduct() {
    const price = Number(productPrice);
    const inventory = Number(productInventory);
    if (!productName.trim() || !productCategory.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(inventory) || inventory < 0) return;

    setProducts((current) => [
      {
        id: `local-${Date.now()}`,
        name: productName.trim(),
        category: productCategory.trim(),
        price,
        inventory,
        status: inventory > 0 ? 'active' : 'out_of_stock',
      },
      ...current,
    ]);

    setProductName('');
    setProductCategory('');
    setProductPrice('');
    setProductInventory('');
    setShowAddModal(false);
  }

  function statusLabel(status: ProductStatus) {
    if (status === 'active') return 'ACTIVE';
    if (status === 'draft') return 'DRAFT';
    return 'OUT OF STOCK';
  }

  function statusColor(status: ProductStatus) {
    if (status === 'active') return '#62B77A';
    if (status === 'draft') return '#D2B95B';
    return '#E56B6B';
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Products & Inventory</Text>
          <Text style={styles.pageSubtitle}>Manage supplier products, stock levels and marketplace readiness.</Text>
        </View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: roleColor }]} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={18} color="#0B1623" />
          <Text style={styles.addButtonText}>ADD PRODUCT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statLabel}>ACTIVE PRODUCTS</Text><Text style={styles.statValue}>{activeCount}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>UNITS IN STOCK</Text><Text style={styles.statValue}>{totalInventory}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>OUT OF STOCK</Text><Text style={styles.statValue}>{outOfStockCount}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Products</Text>

      <View style={styles.productList}>
        {products.map((item) => {
          const color = statusColor(item.status);
          return (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productIcon}><Ionicons name="cube-outline" size={22} color={roleColor} /></View>
              <View style={{ flex: 1 }}>
                <View style={styles.productTitleRow}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { borderColor: color }]}><Text style={[styles.statusText, { color }]}>{statusLabel(item.status)}</Text></View>
                </View>
                <Text style={styles.productMeta}>{item.category}</Text>
                <View style={styles.productBottomRow}>
                  <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={[styles.inventoryText, item.inventory === 0 && { color: '#E56B6B' }]}>{item.inventory} in stock</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Product</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowAddModal(false)}><Ionicons name="close" size={20} color="#9BA7B4" /></TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>PRODUCT NAME</Text>
              <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Milwaukee M18 Drill Kit" placeholderTextColor="#667788" />
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <TextInput style={styles.input} value={productCategory} onChangeText={setProductCategory} placeholder="Power Tools" placeholderTextColor="#667788" />
              <Text style={styles.inputLabel}>PRICE</Text>
              <TextInput style={styles.input} value={productPrice} onChangeText={setProductPrice} placeholder="329.00" placeholderTextColor="#667788" keyboardType="decimal-pad" />
              <Text style={styles.inputLabel}>INVENTORY</Text>
              <TextInput style={styles.input} value={productInventory} onChangeText={setProductInventory} placeholder="8" placeholderTextColor="#667788" keyboardType="number-pad" />
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: roleColor }]} onPress={addProduct}><Text style={styles.saveButtonText}>SAVE PRODUCT</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 18 },
  pageTitle: { color: Brand.white, fontSize: 28, fontFamily: FontFamily.heading },
  pageSubtitle: { color: '#9BA7B4', fontSize: 12, lineHeight: 18, marginTop: 6 },
  addButton: { minHeight: 44, borderRadius: 9, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  addButtonText: { color: '#0B1623', fontSize: 10, fontFamily: FontFamily.heading, letterSpacing: 0.7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { flexGrow: 1, flexBasis: 170, minWidth: 150, backgroundColor: '#101F30', borderWidth: 1, borderColor: '#26394C', borderRadius: 10, padding: 14 },
  statLabel: { color: '#7F8C99', fontSize: 8, fontFamily: FontFamily.heading, letterSpacing: 0.8 },
  statValue: { color: Brand.white, fontSize: 25, fontFamily: FontFamily.display, marginTop: 5 },
  sectionTitle: { color: Brand.white, fontSize: 16, fontFamily: FontFamily.heading, marginBottom: 10 },
  productList: { gap: 9 },
  productCard: { backgroundColor: '#101F30', borderWidth: 1, borderColor: '#26394C', borderRadius: 10, padding: 12, flexDirection: 'row', gap: 11 },
  productIcon: { width: 46, height: 46, borderRadius: 9, backgroundColor: '#162536', borderWidth: 1, borderColor: '#34485A', alignItems: 'center', justifyContent: 'center' },
  productTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  productName: { flex: 1, color: Brand.white, fontSize: 12, fontFamily: FontFamily.heading },
  productMeta: { color: '#7F8C99', fontSize: 9, marginTop: 3 },
  productBottomRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 9 },
  productPrice: { color: Brand.white, fontSize: 15, fontFamily: FontFamily.display },
  inventoryText: { color: '#9BA7B4', fontSize: 9, fontFamily: FontFamily.bodyBold },
  statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 7, fontFamily: FontFamily.heading, letterSpacing: 0.5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4, 10, 18, 0.78)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: '#0F1D2C', borderWidth: 1, borderColor: '#304457', borderRadius: 12, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: Brand.white, fontSize: 22, fontFamily: FontFamily.heading },
  closeButton: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: '#304457', alignItems: 'center', justifyContent: 'center' },
  inputLabel: { color: '#9BA7B4', fontSize: 8, fontFamily: FontFamily.heading, letterSpacing: 0.7, marginBottom: 6, marginTop: 10 },
  input: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: '#304457', backgroundColor: '#101F30', color: Brand.white, paddingHorizontal: 12, fontSize: 11 },
  saveButton: { minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  saveButtonText: { color: '#0B1623', fontSize: 10, fontFamily: FontFamily.heading, letterSpacing: 0.7 },
});
