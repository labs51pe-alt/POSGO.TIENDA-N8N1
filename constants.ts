import { StoreSettings } from './types';

export const CATEGORIES = ['General', 'Bebidas', 'Alimentos', 'Limpieza', 'Electrónica', 'Hogar', 'Otros'];

export const DEFAULT_SETTINGS: StoreSettings = {
  name: 'PosGo! Store',
  currency: 'S/',
  taxRate: 0.18, // IGV Peru standard
  pricesIncludeTax: true,
  address: 'Av. Principal 123, Lima',
  phone: '999-999-999'
};

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Inca Kola 600ml', price: 3.50, category: 'Bebidas', stock: 50, barcode: '77501000' },
  { id: '2', name: 'Papas Lays 45g', price: 2.50, category: 'Alimentos', stock: 32, barcode: '75010001' },
  { id: '3', name: 'Galleta Casino', price: 1.20, category: 'Alimentos', stock: 15, barcode: '75010002' },
  { id: '4', name: 'Agua San Mateo', price: 2.00, category: 'Bebidas', stock: 100, barcode: '77502000' },
  { id: '5', name: 'Detergente Bolivar', price: 4.50, category: 'Limpieza', stock: 10, barcode: '77503000' }
];