-- Configuração de políticas RLS para o sistema
-- Esta migração configura as políticas de segurança para todas as tabelas

-- 1. Políticas para menu_items (leitura pública)
DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON menu_items;
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
FOR SELECT USING (true);

-- 2. Políticas para orders (inserção e leitura)
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
CREATE POLICY "Users can insert orders" ON orders
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view orders" ON orders;
CREATE POLICY "Users can view orders" ON orders
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update orders" ON orders
FOR UPDATE USING (true);

-- 3. Políticas para order_items (inserção e leitura)
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
CREATE POLICY "Users can insert order items" ON order_items
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items" ON order_items
FOR SELECT USING (true);

-- 4. Políticas para reservations (inserção e leitura)
DROP POLICY IF EXISTS "Users can insert reservations" ON reservations;
CREATE POLICY "Users can insert reservations" ON reservations
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view reservations" ON reservations;
CREATE POLICY "Users can view reservations" ON reservations
FOR SELECT USING (true);

-- 5. Políticas para contacts (inserção e leitura)
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
CREATE POLICY "Users can insert contacts" ON contacts
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view contacts" ON contacts;
CREATE POLICY "Users can view contacts" ON contacts
FOR SELECT USING (true);

-- 6. Políticas para tables (leitura pública)
DROP POLICY IF EXISTS "Tables are viewable by everyone" ON tables;
CREATE POLICY "Tables are viewable by everyone" ON tables
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update tables" ON tables;
CREATE POLICY "Users can update tables" ON tables
FOR UPDATE USING (true);

-- 7. Políticas para printers (leitura e escrita para admins)
DROP POLICY IF EXISTS "Users can view printers" ON printers;
CREATE POLICY "Users can view printers" ON printers
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert printers" ON printers;
CREATE POLICY "Users can insert printers" ON printers
FOR INSERT WITH CHECK (true);

-- 8. Políticas para sessions (gerenciamento de sessões)
DROP POLICY IF EXISTS "Users can manage sessions" ON sessions;
CREATE POLICY "Users can manage sessions" ON sessions
FOR ALL USING (true);

-- 9. Políticas para users (leitura e escrita)
DROP POLICY IF EXISTS "Users can view users" ON users;
CREATE POLICY "Users can view users" ON users
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert users" ON users;
CREATE POLICY "Users can insert users" ON users
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update users" ON users;
CREATE POLICY "Users can update users" ON users
FOR UPDATE USING (true); 