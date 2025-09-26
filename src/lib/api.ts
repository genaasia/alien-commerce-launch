// Genabase API Client for Alien Clothing Store

const API_BASE_URL = 'https://api.genabase.com';
const TENANT_ID = 'google-oauth2|113590440864166206329';
const DB_NAME = 'default';

export interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_published: boolean;
  availability_status: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title?: string;
  description?: string;
  image_url?: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  taxable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  customer_id?: string;
  session_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  cart_id?: string;
  status: string;
  currency: string;
  subtotal_price: number;
  total_discounts: number;
  total_tax: number;
  shipping_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  order_id: string;
  variant_id?: string;
  product_id?: string;
  title?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  unit_tax_amount: number;
  total_discount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderAddress {
  order_id: string;
  type: 'BILLING' | 'SHIPPING';
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country_code?: string;
  created_at: string;
}

// API Request types
interface ApiRequest {
  operation: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  data: any[];
  where_conditions?: WhereCondition[];
  return_columns?: string[];
  limit?: number;
  offset?: number;
  order_by?: OrderByColumn[];
}

interface WhereCondition {
  column: string;
  op: 'eq' | 'not_eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';
  value: any;
}

interface OrderByColumn {
  column: string;
  direction: 'ASC' | 'DESC';
}

interface ApiResponse {
  success: boolean;
  operation: string;
  table: string;
  affected_rows: number;
  execution_time_ms: number;
  returned_data?: any[];
  error?: string;
}

// API Client
class GenabaseClient {
  private async executeRequest(request: ApiRequest): Promise<ApiResponse> {
    const url = `${API_BASE_URL}/tenants/${TENANT_ID}/databases/${DB_NAME}/execute`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await this.executeRequest({
      operation: 'select',
      table: 'products',
      data: [],
      where_conditions: [
        { column: 'is_published', op: 'eq' as const, value: true },
        { column: 'availability_status', op: 'eq' as const, value: 'IN_STOCK' }
      ],
      order_by: [{ column: 'created_at', direction: 'DESC' as const }],
    });

    return response.returned_data || [];
  }

  async getProductVariants(productId?: string): Promise<ProductVariant[]> {
    const whereConditions = productId 
      ? [{ column: 'product_id', op: 'eq' as const, value: productId }]
      : [];

    const response = await this.executeRequest({
      operation: 'select',
      table: 'product_variants',
      data: [],
      where_conditions: whereConditions,
      order_by: [{ column: 'price', direction: 'ASC' as const }],
    });

    return response.returned_data || [];
  }

  // Cart Management
  async createCart(sessionId: string): Promise<Cart> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'carts',
      data: [{ session_id: sessionId, status: 'OPEN' }],
      return_columns: ['id', 'session_id', 'status', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  async getCart(sessionId: string): Promise<Cart | null> {
    const response = await this.executeRequest({
      operation: 'select',
      table: 'carts',
      data: [],
      where_conditions: [
        { column: 'session_id', op: 'eq' as const, value: sessionId },
        { column: 'status', op: 'eq' as const, value: 'OPEN' }
      ],
    });

    return response.returned_data?.[0] || null;
  }

  async addToCart(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    // First try to update existing item
    const existingResponse = await this.executeRequest({
      operation: 'select',
      table: 'cart_items',
      data: [],
      where_conditions: [
        { column: 'cart_id', op: 'eq' as const, value: cartId },
        { column: 'variant_id', op: 'eq' as const, value: variantId }
      ],
    });

    if (existingResponse.returned_data && existingResponse.returned_data.length > 0) {
      // Update existing item
      const existingItem = existingResponse.returned_data[0];
      const newQuantity = existingItem.quantity + quantity;
      
      const updateResponse = await this.executeRequest({
        operation: 'update',
        table: 'cart_items',
        data: [{ quantity: newQuantity }],
        where_conditions: [
          { column: 'cart_id', op: 'eq' as const, value: cartId },
          { column: 'variant_id', op: 'eq' as const, value: variantId }
        ],
        return_columns: ['id', 'cart_id', 'variant_id', 'quantity', 'created_at', 'updated_at'],
      });

      return updateResponse.returned_data?.[0];
    } else {
      // Create new item
      const insertResponse = await this.executeRequest({
        operation: 'insert',
        table: 'cart_items',
        data: [{ cart_id: cartId, variant_id: variantId, quantity }],
        return_columns: ['id', 'cart_id', 'variant_id', 'quantity', 'created_at', 'updated_at'],
      });

      return insertResponse.returned_data?.[0];
    }
  }

  async getCartItems(cartId: string): Promise<CartItem[]> {
    const response = await this.executeRequest({
      operation: 'select',
      table: 'cart_items',
      data: [],
      where_conditions: [{ column: 'cart_id', op: 'eq' as const, value: cartId }],
    });

    return response.returned_data || [];
  }

  async updateCartItemQuantity(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await this.executeRequest({
        operation: 'delete',
        table: 'cart_items',
        data: [],
        where_conditions: [
          { column: 'cart_id', op: 'eq' as const, value: cartId },
          { column: 'variant_id', op: 'eq' as const, value: variantId }
        ],
      });
      return null as any;
    }

    const response = await this.executeRequest({
      operation: 'update',
      table: 'cart_items',
      data: [{ quantity }],
      where_conditions: [
        { column: 'cart_id', op: 'eq' as const, value: cartId },
        { column: 'variant_id', op: 'eq' as const, value: variantId }
      ],
      return_columns: ['id', 'cart_id', 'variant_id', 'quantity', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Admin: Get all products (including drafts)
  async getAllProducts(): Promise<Product[]> {
    const response = await this.executeRequest({
      operation: 'select',
      table: 'products',
      data: [],
      order_by: [{ column: 'created_at', direction: 'DESC' as const }],
    });

    return response.returned_data || [];
  }

  // Admin: Create product
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'products',
      data: [productData],
      return_columns: ['id', 'name', 'description', 'image_url', 'is_published', 'availability_status', 'tags', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Admin: Update product
  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    const response = await this.executeRequest({
      operation: 'update',
      table: 'products',
      data: [productData],
      where_conditions: [{ column: 'id', op: 'eq' as const, value: productId }],
      return_columns: ['id', 'name', 'description', 'image_url', 'is_published', 'availability_status', 'tags', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Admin: Create product variant
  async createProductVariant(variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'product_variants',
      data: [variantData],
      return_columns: ['id', 'product_id', 'title', 'description', 'image_url', 'sku', 'price', 'compare_at_price', 'taxable', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Admin: Update product variant
  async updateProductVariant(variantId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await this.executeRequest({
      operation: 'update',
      table: 'product_variants',
      data: [variantData],
      where_conditions: [{ column: 'id', op: 'eq' as const, value: variantId }],
      return_columns: ['id', 'product_id', 'title', 'description', 'image_url', 'sku', 'price', 'compare_at_price', 'taxable', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Admin: Get orders
  async getOrders(): Promise<Order[]> {
    const response = await this.executeRequest({
      operation: 'select',
      table: 'orders',
      data: [],
      order_by: [{ column: 'created_at', direction: 'DESC' as const }],
    });

    return response.returned_data || [];
  }

  // Admin: Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await this.executeRequest({
      operation: 'update',
      table: 'orders',
      data: [{ status }],
      where_conditions: [{ column: 'id', op: 'eq' as const, value: orderId }],
      return_columns: ['id', 'customer_id', 'cart_id', 'status', 'currency', 'subtotal_price', 'total_discounts', 'total_tax', 'shipping_price', 'total_price', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  // Checkout Process
  async createCustomer(email: string, firstName?: string, lastName?: string, phone?: string): Promise<Customer> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'customers',
      data: [{ email, first_name: firstName, last_name: lastName, phone }],
      return_columns: ['id', 'email', 'first_name', 'last_name', 'phone', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  async createOrder(customerId: string, cartId: string, orderData: Partial<Order>): Promise<Order> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'orders',
      data: [{
        customer_id: customerId,
        cart_id: cartId,
        status: 'PENDING',
        currency: 'USD',
        ...orderData
      }],
      return_columns: ['id', 'customer_id', 'cart_id', 'status', 'currency', 'subtotal_price', 'total_discounts', 'total_tax', 'shipping_price', 'total_price', 'created_at', 'updated_at'],
    });

    return response.returned_data?.[0];
  }

  async createLineItems(lineItems: Partial<LineItem>[]): Promise<LineItem[]> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'line_items',
      data: lineItems,
      return_columns: ['id', 'order_id', 'variant_id', 'product_id', 'title', 'sku', 'quantity', 'unit_price', 'unit_tax_amount', 'total_discount', 'total_price', 'created_at', 'updated_at'],
    });

    return response.returned_data || [];
  }

  async createOrderAddresses(addresses: Partial<OrderAddress>[]): Promise<OrderAddress[]> {
    const response = await this.executeRequest({
      operation: 'insert',
      table: 'order_addresses',
      data: addresses,
      return_columns: ['order_id', 'type', 'first_name', 'last_name', 'company', 'phone', 'line1', 'line2', 'city', 'region', 'postal_code', 'country_code', 'created_at'],
    });

    return response.returned_data || [];
  }
}

export const api = new GenabaseClient();