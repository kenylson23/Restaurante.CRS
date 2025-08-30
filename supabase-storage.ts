import { supabaseAdmin } from '../shared/supabase';
import type { IStorage } from './storage';
import type { 
  Reservation, InsertReservation,
  Contact, InsertContact,
  MenuItem, InsertMenuItem,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Table, InsertTable
} from '../shared/schema';

export class SupabaseStorage implements IStorage {
  private initializationPromise: Promise<void> | null = null;
  
  constructor() {
    // Don't initialize in constructor to avoid blocking the app startup
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSampleMenuItems();
    }
    await this.initializationPromise;
  }

  private async initializeSampleMenuItems(): Promise<void> {
    try {
      // Check if we already have menu items
      const { data: existingItems } = await supabaseAdmin
        .from('menu_items')
        .select('*')
        .limit(1);

      if (existingItems && existingItems.length > 0) {
        console.log('Menu items already exist, skipping initialization');
        return;
      }

      // Sample menu items
      const sampleItems = [
        {
          name: "Tacos al Pastor",
          description: "Tacos tradicionais com carne de porco marinada, abacaxi e coentro",
          price: "2500.00",
          category: "Tacos",
          available: true,
          preparation_time: 15,
          customizations: null
        },
        {
          name: "Burrito Supremo",
          description: "Burrito gigante com carne, feijão, arroz, queijo e molho especial",
          price: "3200.00",
          category: "Burritos",
          available: true,
          preparation_time: 15,
          customizations: null
        },
        {
          name: "Quesadilla de Queijo",
          description: "Tortilla crocante recheada com queijo derretido e temperos",
          price: "2000.00",
          category: "Quesadillas",
          available: true,
          preparation_time: 15,
          customizations: null
        },
        {
          name: "Nachos Especiais",
          description: "Chips de tortilla com queijo derretido, guacamole e molho picante",
          price: "2800.00",
          category: "Aperitivos",
          available: true,
          preparation_time: 15,
          customizations: null
        },
        {
          name: "Enchiladas Verdes",
          description: "Tortillas recheadas com frango e cobertas com molho verde",
          price: "3000.00",
          category: "Enchiladas",
          available: true,
          preparation_time: 15,
          customizations: null
        },
        {
          name: "Fajitas de Frango",
          description: "Frango grelhado com pimentos e cebolas, servido com tortillas",
          price: "3500.00",
          category: "Fajitas",
          available: true,
          preparation_time: 15,
          customizations: null
        }
      ];

      for (const item of sampleItems) {
        const { error } = await supabaseAdmin
          .from('menu_items')
          .insert(item);
        
        if (error) {
          console.error('Error inserting menu item:', error);
        }
      }
      
      console.log('Sample menu items initialized successfully');
    } catch (error) {
      console.error('Error initializing sample menu items:', error);
      // Don't throw here, let the app continue without sample data
    }
  }

  // Reservation operations
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert(insertReservation)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert(insertContact)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAllReservations(): Promise<Reservation[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('date', date)
      .eq('time', time);

    if (error) throw new Error(error.message);
    return !data || data.length === 0;
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('*')
      .eq('date', date);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // Menu item operations
  async getAllMenuItems(): Promise<MenuItem[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*');

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('category', category);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert(insertMenuItem)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateMenuItem(id: number, updates: Partial<InsertMenuItem>): Promise<MenuItem> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.ensureInitialized();
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(insertOrder)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create order items
    for (const item of items) {
      await supabaseAdmin
        .from('order_items')
        .insert({ ...item, order_id: data.id });
    }

    // If it's a dine-in order with a table, mark the table as occupied
    if (data.orderType === 'dine-in' && data.tableId) {
      await supabaseAdmin
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', data.tableId);
    }

    return data;
  }

  async getAllOrders(): Promise<Order[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getOrdersByLocation(locationId: string): Promise<Order[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateOrderEstimatedTime(id: number, estimatedDeliveryTime: string): Promise<Order> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ estimated_delivery_time: estimatedDeliveryTime })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ensureInitialized();
    // First delete order items
    await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', id);

    // Then delete the order
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // Order item operations
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .insert(insertOrderItem)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getOrdersWithItems(): Promise<(Order & { items: OrderItem[] })[]> {
    await this.ensureInitialized();
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw new Error(ordersError.message);

    const ordersWithItems = [];
    for (const order of orders || []) {
      const items = await this.getOrderItems(order.id);
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  // Table operations
  async getAllTables(): Promise<Table[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .order('location_id', { ascending: true })
      .order('table_number', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Convert snake_case to camelCase
    return (data || []).map(table => ({
      id: table.id,
      locationId: table.location_id,
      tableNumber: table.table_number,
      seats: table.seats,
      status: table.status,
      qrCode: table.qr_code,
      qrCodeUrl: table.qr_code_url,
      createdAt: table.created_at
    }));
  }

  async getTablesByLocation(locationId: string): Promise<Table[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('location_id', locationId)
      .order('table_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getTable(id: number): Promise<Table | undefined> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  async updateTable(id: number, updates: Partial<Table>): Promise<Table> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    await this.ensureInitialized();
    
    // Convert camelCase to snake_case for Supabase
    const supabaseData = {
      location_id: insertTable.locationId,
      table_number: insertTable.tableNumber,
      seats: insertTable.seats,
      status: insertTable.status || 'available',
      qr_code: insertTable.qrCode,
      qr_code_url: insertTable.qrCodeUrl
    };
    
    const { data, error } = await supabaseAdmin
      .from('tables')
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Convert back to camelCase for TypeScript
    return {
      id: data.id,
      locationId: data.location_id,
      tableNumber: data.table_number,
      seats: data.seats,
      status: data.status,
      qrCode: data.qr_code,
      qrCodeUrl: data.qr_code_url,
      createdAt: data.created_at
    };
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTable(id: number): Promise<void> {
    await this.ensureInitialized();
    const { error } = await supabaseAdmin
      .from('tables')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getAvailableTables(locationId: string): Promise<Table[]> {
    await this.ensureInitialized();
    const { data, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('location_id', locationId)
      .eq('status', 'available')
      .order('table_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }
}