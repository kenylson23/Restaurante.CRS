import { 
  reservations, contacts, menuItems, orders, orderItems, tables,
  type Reservation, type InsertReservation, 
  type Contact, type InsertContact, type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Table, type InsertTable
} from "../shared/schema";
import { db } from "./db";
import { eq, and, ne } from "drizzle-orm";

export interface IStorage {
  // Reservation operations
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  createContact(contact: InsertContact): Promise<Contact>;
  getAllReservations(): Promise<Reservation[]>;
  checkAvailability(date: string, time: string): Promise<boolean>;
  getReservationsByDate(date: string): Promise<Reservation[]>;
  
  // Menu Items
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByLocation(locationId: string): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderEstimatedTime(id: number, estimatedDeliveryTime: string): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Tables
  getAllTables(): Promise<Table[]>;
  getTablesByLocation(locationId: string): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<Table>): Promise<Table>;
  deleteTable(id: number): Promise<void>;
  updateTableStatus(id: number, status: string): Promise<Table>;
}

export class DatabaseStorage implements IStorage {
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
      // Test database connection first
      await db.select().from(menuItems).limit(1);
      
      // Check if menu items already exist
      const existingItems = await db.select().from(menuItems);
      if (existingItems.length === 0) {
        // Add sample menu items
        const sampleItems = [
          {
            name: 'Tacos al Pastor',
            description: 'Tacos tradicionais com carne de porco marinada, abacaxi e coentro',
            price: '2500',
            category: 'Tacos',
            available: true
          },
          {
            name: 'Burrito Supremo',
            description: 'Burrito gigante com carne, feijão, arroz, queijo e molho especial',
            price: '3200',
            category: 'Burritos',
            available: true
          },
          {
            name: 'Quesadilla de Queijo',
            description: 'Tortilla crocante recheada com queijo derretido e temperos',
            price: '2000',
            category: 'Quesadillas',
            available: true
          },
          {
            name: 'Nachos Especiais',
            description: 'Chips de tortilla com queijo derretido, guacamole e molho picante',
            price: '2800',
            category: 'Aperitivos',
            available: true
          },
          {
            name: 'Enchiladas Verdes',
            description: 'Tortillas recheadas com frango e cobertas com molho verde',
            price: '3000',
            category: 'Enchiladas',
            available: true
          },
          {
            name: 'Fajitas de Frango',
            description: 'Frango grelhado com pimentos e cebolas, servido com tortillas',
            price: '3500',
            category: 'Fajitas',
            available: true
          }
        ];

        for (const item of sampleItems) {
          await db.insert(menuItems).values(item);
        }
        console.log('Sample menu items initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample menu items:', error);
      // Don't throw here, let the app continue without sample data
    }
  }
  // Reservation operations
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    await this.ensureInitialized();
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();
    return reservation;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    await this.ensureInitialized();
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getAllReservations(): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await db.select().from(reservations);
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    await this.ensureInitialized();
    const existing = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.date, date), eq(reservations.time, time)));
    return existing.length === 0;
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(reservations)
      .where(eq(reservations.date, date));
  }

  // Menu Items
  async getAllMenuItems(): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await db.select().from(menuItems);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.category, category));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    await this.ensureInitialized();
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    await this.ensureInitialized();
    const [item] = await db
      .insert(menuItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    await this.ensureInitialized();
    // Remove campos que não devem ser atualizados manualmente
    const { id: itemId, createdAt, ...validUpdates } = updates;
    
    const [item] = await db
      .update(menuItems)
      .set(validUpdates)
      .where(eq(menuItems.id, id))
      .returning();
    return item;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.ensureInitialized();
    await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    await this.ensureInitialized();
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    
    // Create order items
    await db.insert(orderItems).values(
      items.map(item => ({ ...item, orderId: order.id }))
    );
    
    // If it's a dine-in order with a table, mark the table as occupied
    if (order.orderType === 'dine-in' && order.tableId) {
      console.log(`Marking table ${order.tableId} as occupied for order ${order.id}`);
      await db
        .update(tables)
        .set({ status: 'occupied' })
        .where(eq(tables.id, order.tableId));
      console.log(`Table ${order.tableId} marked as occupied`);
    } else {
      console.log(`Order ${order.id} - orderType: ${order.orderType}, tableId: ${order.tableId}`);
    }
    
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    await this.ensureInitialized();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    await this.ensureInitialized();
    return await db.select().from(orders);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, status));
  }

  async getOrdersByLocation(locationId: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(orders)
      .where(eq(orders.locationId, locationId));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.ensureInitialized();
    // Get the current order first to check if it has a table
    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    // If the order is completed or cancelled, and it was a dine-in order with a table,
    // mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId && 
        (status === 'delivered' || status === 'cancelled')) {
      await db
        .update(tables)
        .set({ status: 'available' })
        .where(eq(tables.id, currentOrder.tableId));
    }

    return order;
  }

  async updateOrderEstimatedTime(id: number, estimatedDeliveryTime: string): Promise<Order> {
    await this.ensureInitialized();
    const [order] = await db
      .update(orders)
      .set({ estimatedDeliveryTime })
      .where(eq(orders.id, id))
      .returning();

    return order;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ensureInitialized();
    // Get the order first to check if it has a table
    const [currentOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    // First delete order items
    await db
      .delete(orderItems)
      .where(eq(orderItems.orderId, id));
    
    // Then delete the order
    await db
      .delete(orders)
      .where(eq(orders.id, id));

    // If it was a dine-in order with a table, mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId) {
      await db
        .update(tables)
        .set({ status: 'available' })
        .where(eq(tables.id, currentOrder.tableId));
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Tables operations
  async getAllTables(): Promise<Table[]> {
    await this.ensureInitialized();
    return await db.select().from(tables);
  }

  async getTablesByLocation(locationId: string): Promise<Table[]> {
    await this.ensureInitialized();
    return await db
      .select()
      .from(tables)
      .where(eq(tables.locationId, locationId));
  }

  async getTable(id: number): Promise<Table | undefined> {
    await this.ensureInitialized();
    const [table] = await db
      .select()
      .from(tables)
      .where(eq(tables.id, id));
    return table;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    await this.ensureInitialized();
    
    console.log(`🔍 Verificando duplicação para mesa ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    
    // Verificar se já existe uma mesa com o mesmo número no mesmo local
    const existingTable = await db
      .select()
      .from(tables)
      .where(and(
        eq(tables.locationId, insertTable.locationId),
        eq(tables.tableNumber, insertTable.tableNumber)
      ));
    
    console.log(`🔍 Encontradas ${existingTable.length} mesas existentes:`, existingTable);
    
    if (existingTable.length > 0) {
      throw new Error(`Já existe uma mesa número ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    }
    
    const [table] = await db
      .insert(tables)
      .values(insertTable)
      .returning();
    return table;
  }

  async updateTable(id: number, updates: Partial<Table>): Promise<Table> {
    await this.ensureInitialized();
    
    // Se está atualizando o número ou localização, verificar duplicação
    if (updates.tableNumber !== undefined || updates.locationId !== undefined) {
      // Buscar a mesa atual para obter os dados completos
      const currentTable = await this.getTable(id);
      if (!currentTable) {
        throw new Error('Mesa não encontrada');
      }
      
      const newNumber = updates.tableNumber !== undefined ? updates.tableNumber : currentTable.tableNumber;
      const newLocationId = updates.locationId !== undefined ? updates.locationId : currentTable.locationId;
      
      // Verificar se existe outra mesa com o mesmo número no mesmo local
      const existingTable = await db
        .select()
        .from(tables)
        .where(and(
          eq(tables.locationId, newLocationId),
          eq(tables.tableNumber, newNumber),
          ne(tables.id, id) // Excluir a mesa atual da verificação
        ));
      
      if (existingTable.length > 0) {
        throw new Error(`Já existe uma mesa número ${newNumber} no local ${newLocationId}`);
      }
    }
    
    const [table] = await db
      .update(tables)
      .set(updates)
      .where(eq(tables.id, id))
      .returning();
    return table;
  }

  async deleteTable(id: number): Promise<void> {
    await this.ensureInitialized();
    await db
      .delete(tables)
      .where(eq(tables.id, id));
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    await this.ensureInitialized();
    const [table] = await db
      .update(tables)
      .set({ status })
      .where(eq(tables.id, id))
      .returning();
    return table;
  }
}

// Export storage instance - use PostgreSQL
export const storage = new DatabaseStorage();