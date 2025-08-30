import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface MigrationData {
  menuItems?: any[];
  locations?: any[];
  tables?: any[];
  categories?: any[];
  orders?: any[];
  users?: any[];
}

async function loadExistingData(): Promise<MigrationData> {
  console.log('🔍 Loading existing data from project files...');
  
  const data: MigrationData = {};
  
  try {
    // Load menu items from data files
    const menuItemsPath = path.join(process.cwd(), '../../data/menu-items.json');
    if (fs.existsSync(menuItemsPath)) {
      const menuData = JSON.parse(fs.readFileSync(menuItemsPath, 'utf-8'));
      data.menuItems = menuData;
      console.log(`✅ Found ${menuData.length} menu items`);
    }
    
    // Load restaurant locations
    const locationsPath = path.join(process.cwd(), '../../data/restaurant-locations.json');
    if (fs.existsSync(locationsPath)) {
      const locationData = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));
      data.locations = locationData;
      console.log(`✅ Found ${locationData.length} locations`);
    }
    
    // Load user roles
    const usersPath = path.join(process.cwd(), '../../data/user-roles.json');
    if (fs.existsSync(usersPath)) {
      const userData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      data.users = userData;
      console.log(`✅ Found ${userData.length} users`);
    }
    
    // Load static menu if available
    const staticMenuPath = path.join(process.cwd(), '../../data/staticMenu.ts');
    if (fs.existsSync(staticMenuPath)) {
      console.log('✅ Found static menu data (will need manual conversion)');
    }
    
  } catch (error) {
    console.error('⚠️ Error loading existing data:', error);
  }
  
  return data;
}

async function migrateMenuCategories(db: any): Promise<void> {
  console.log('📋 Migrating menu categories...');
  
  const categories = [
    { name: 'Tacos', description: 'Delicious traditional Mexican tacos', display_order: 1 },
    { name: 'Burritos', description: 'Stuffed burritos with fresh ingredients', display_order: 2 },
    { name: 'Quesadillas', description: 'Grilled quesadillas to perfection', display_order: 3 },
    { name: 'Nachos', description: 'Crispy nachos with special sauces', display_order: 4 },
    { name: 'Bebidas', description: 'Refreshing and traditional drinks', display_order: 5 },
    { name: 'Sobremesas', description: 'Traditional Mexican desserts', display_order: 6 }
  ];
  
  for (const category of categories) {
    try {
      await db.execute(`
        INSERT INTO menu_categories (name, description, display_order) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.display_order]);
      console.log(`✅ Category migrated: ${category.name}`);
    } catch (error) {
      console.error(`❌ Error migrating category ${category.name}:`, error);
    }
  }
}

async function migrateMenuItems(db: any, menuItems: any[]): Promise<void> {
  console.log('🍽️ Migrating menu items...');
  
  if (!menuItems || menuItems.length === 0) {
    console.log('⚠️ No menu items found to migrate');
    return;
  }
  
  for (const item of menuItems) {
    try {
      // Get category ID
      const categoryResult = await db.execute(`
        SELECT id FROM menu_categories WHERE name = $1
      `, [item.category || 'Tacos']);
      
      const categoryId = categoryResult[0]?.id || 1;
      
      await db.execute(`
        INSERT INTO menu_items (name, description, price, category_id, image_url, available, prep_time, spice_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category_id = EXCLUDED.category_id,
          image_url = EXCLUDED.image_url,
          available = EXCLUDED.available,
          prep_time = EXCLUDED.prep_time,
          spice_level = EXCLUDED.spice_level
      `, [
        item.name,
        item.description || '',
        parseFloat(item.price) || 0,
        categoryId,
        item.image || null,
        item.available !== false,
        parseInt(item.prepTime) || 15,
        parseInt(item.spiceLevel) || 0
      ]);
      
      console.log(`✅ Menu item migrated: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error migrating menu item ${item.name}:`, error);
    }
  }
}

async function migrateLocations(db: any, locations: any[]): Promise<void> {
  console.log('📍 Migrating restaurant locations...');
  
  const defaultLocations = [
    {
      name: 'Ilha de Luanda',
      address: 'Ilha de Luanda, Angola',
      phone: '+244 949 639 932',
      delivery_fee: 500.00,
      active: true
    },
    {
      name: 'Talatona',
      address: 'Talatona, Luanda, Angola',
      phone: '+244 949 639 932',
      delivery_fee: 800.00,
      active: true
    },
    {
      name: 'Unidade Móvel',
      address: 'Serviço móvel',
      phone: '+244 949 639 932',
      delivery_fee: 1000.00,
      active: true
    }
  ];
  
  const locationsToMigrate = locations && locations.length > 0 ? locations : defaultLocations;
  
  for (const location of locationsToMigrate) {
    try {
      await db.execute(`
        INSERT INTO restaurant_locations (name, address, phone, delivery_fee, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          delivery_fee = EXCLUDED.delivery_fee,
          active = EXCLUDED.active
      `, [
        location.name,
        location.address,
        location.phone || '+244 949 639 932',
        parseFloat(location.delivery_fee) || 0,
        location.active !== false
      ]);
      
      console.log(`✅ Location migrated: ${location.name}`);
    } catch (error) {
      console.error(`❌ Error migrating location ${location.name}:`, error);
    }
  }
}

async function migrateUsers(db: any, users: any[]): Promise<void> {
  console.log('👥 Migrating users...');
  
  const defaultUsers = [
    {
      email: 'admin@lastortilhas.ao',
      password_hash: '$2b$10$hashedpassword', // This should be properly hashed
      name: 'Administrator',
      role: 'admin'
    },
    {
      email: 'cozinha@lastortilhas.ao',
      password_hash: '$2b$10$hashedpassword', // This should be properly hashed
      name: 'Cozinha',
      role: 'kitchen'
    }
  ];
  
  const usersToMigrate = users && users.length > 0 ? users : defaultUsers;
  
  for (const user of usersToMigrate) {
    try {
      await db.execute(`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role
      `, [
        user.email,
        user.password_hash || '$2b$10$defaulthash', // Should implement proper password hashing
        user.name,
        user.role || 'customer'
      ]);
      
      console.log(`✅ User migrated: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error migrating user ${user.email}:`, error);
    }
  }
}

async function createDefaultTables(db: any): Promise<void> {
  console.log('🪑 Creating default restaurant tables...');
  
  // Get location IDs
  const locations = await db.execute('SELECT id, name FROM restaurant_locations');
  
  for (const location of locations) {
    // Create tables for each location
    const tableCount = location.name === 'Unidade Móvel' ? 0 : 10;
    
    for (let i = 1; i <= tableCount; i++) {
      try {
        const tableNumber = `${location.name.charAt(0)}${i.toString().padStart(2, '0')}`;
        
        await db.execute(`
          INSERT INTO restaurant_tables (table_number, capacity, location_id, status)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (table_number) DO NOTHING
        `, [
          tableNumber,
          Math.floor(Math.random() * 6) + 2, // 2-8 people capacity
          location.id,
          'available'
        ]);
        
        console.log(`✅ Table created: ${tableNumber}`);
      } catch (error) {
        console.error(`❌ Error creating table:`, error);
      }
    }
  }
}

async function runDataMigration(): Promise<boolean> {
  console.log('🔄 Starting data migration from Replit to Neon...\n');
  
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found. Configure in .env.local');
    return false;
  }
  
  // Create database client
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 10,
  });
  
  const db = drizzle(client);
  
  try {
    // Load existing data
    const existingData = await loadExistingData();
    
    // Migrate categories first
    await migrateMenuCategories(db);
    
    // Migrate menu items
    if (existingData.menuItems) {
      await migrateMenuItems(db, existingData.menuItems);
    }
    
    // Migrate locations
    await migrateLocations(db, existingData.locations || []);
    
    // Migrate users
    await migrateUsers(db, existingData.users || []);
    
    // Create default tables
    await createDefaultTables(db);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    
    const categoryCount = await db.execute('SELECT COUNT(*) as count FROM menu_categories');
    const itemCount = await db.execute('SELECT COUNT(*) as count FROM menu_items');
    const locationCount = await db.execute('SELECT COUNT(*) as count FROM restaurant_locations');
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    const tableCount = await db.execute('SELECT COUNT(*) as count FROM restaurant_tables');
    
    console.log('📊 Migration Summary:');
    console.log(`   Categories: ${categoryCount[0].count}`);
    console.log(`   Menu Items: ${itemCount[0].count}`);
    console.log(`   Locations: ${locationCount[0].count}`);
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Tables: ${tableCount[0].count}`);
    
    await client.end();
    
    console.log('\n✅ Data migration completed successfully!');
    return true;
    
  } catch (error) {
    await client.end();
    console.error('❌ Data migration failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('📊 === DATA MIGRATION: REPLIT → NEON ===\n');
  
  const success = await runDataMigration();
  
  if (success) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. ✅ Database migrated and populated');
    console.log('2. 🚀 Ready for backend deployment to Render');
    console.log('3. 🌐 Ready for frontend deployment to Vercel');
    process.exit(0);
  } else {
    console.error('\n❌ MIGRATION FAILED');
    console.error('Fix the issues and try again');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});