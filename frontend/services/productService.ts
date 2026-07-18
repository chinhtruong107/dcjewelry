import api from '@/lib/api';
import { Product } from '@/types/product';

export const productService = {
  /**
   * Lấy danh sách tất cả sản phẩm
   * @returns Mảng các Product
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      // Giả sử API Laravel trả về dạng { data: [...] } hoặc trả về mảng trực tiếp
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một sản phẩm dựa trên ID
   * @param id ID của sản phẩm
   * @returns Chi tiết một Product
   */
  getProductById: async (id: string | number): Promise<Product> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }
};
