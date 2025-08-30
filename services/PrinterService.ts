import { db } from "../db";
import { printers, orders, orderItems, menuItems } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import type { Order, OrderItem, MenuItem, Printer } from "../../shared/schema";
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class PrinterService {
  // Gerar ticket formatado para impressão
  static async generateTicket(orderId: number): Promise<string> {
    // Buscar dados do pedido com itens
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    const items = await db
      .select({
        orderItem: orderItems,
        menuItem: menuItems,
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));

    return this.formatTicket(order, items);
  }

  // Formatar ticket em texto puro com comandos ESC/POS básicos
  static formatTicket(order: Order, items: any[]): string {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    // Comandos ESC/POS básicos
    const INIT = `${ESC}@`; // Inicializar impressora
    const CENTER = `${ESC}a\x01`; // Centralizar texto
    const LEFT = `${ESC}a\x00`; // Alinhar à esquerda
    const BOLD_ON = `${ESC}E\x01`; // Negrito ON
    const BOLD_OFF = `${ESC}E\x00`; // Negrito OFF
    const DOUBLE_SIZE = `${GS}!\x11`; // Texto duplo (altura e largura)
    const NORMAL_SIZE = `${GS}!\x00`; // Texto normal
    const CUT_PAPER = `${GS}V\x01`; // Cortar papel
    const LINE_FEED = '\n';
    const SEPARATOR = '--------------------------------';

    let ticket = INIT;
    
    // Cabeçalho
    ticket += CENTER;
    ticket += BOLD_ON + DOUBLE_SIZE;
    ticket += 'LAS TORTILLAS' + LINE_FEED;
    ticket += 'MEXICAN GRILL' + LINE_FEED;
    ticket += NORMAL_SIZE + BOLD_OFF;
    ticket += 'Cozinha - Ticket' + LINE_FEED;
    ticket += LEFT;
    ticket += SEPARATOR + LINE_FEED;
    
    // Informações do pedido
    ticket += BOLD_ON;
    ticket += `PEDIDO #${order.id}` + LINE_FEED;
    ticket += BOLD_OFF;
    ticket += `Data: ${new Date(order.createdAt!).toLocaleDateString('pt-AO')}` + LINE_FEED;
    ticket += `Hora: ${new Date(order.createdAt!).toLocaleTimeString('pt-AO')}` + LINE_FEED;
    ticket += `Tipo: ${this.getOrderTypeLabel(order.orderType)}` + LINE_FEED;
    
    if (order.orderType === 'dine-in' && order.tableId) {
      ticket += `Mesa: ${order.tableId}` + LINE_FEED;
    }
    
    ticket += `Local: ${this.getLocationLabel(order.locationId)}` + LINE_FEED;
    ticket += SEPARATOR + LINE_FEED;
    
    // Cliente
    ticket += BOLD_ON + 'CLIENTE:' + BOLD_OFF + LINE_FEED;
    ticket += `${order.customerName}` + LINE_FEED;
    ticket += `${order.customerPhone}` + LINE_FEED;
    
    if (order.orderType === 'delivery' && order.deliveryAddress) {
      ticket += `Endereço: ${order.deliveryAddress}` + LINE_FEED;
    }
    
    ticket += SEPARATOR + LINE_FEED;
    
    // Itens agrupados por estação
    const stationGroups = this.groupItemsByStation(items);
    
    Object.entries(stationGroups).forEach(([station, stationItems]) => {
      ticket += BOLD_ON + `=== ${station.toUpperCase()} ===` + BOLD_OFF + LINE_FEED;
      
      stationItems.forEach(item => {
        ticket += `${item.orderItem.quantity}x ${item.menuItem?.name || 'Item desconhecido'}` + LINE_FEED;
        
        if (item.orderItem.customizations && item.orderItem.customizations.length > 0) {
          item.orderItem.customizations.forEach((custom: string) => {
            ticket += `  - ${custom}` + LINE_FEED;
          });
        }
        ticket += LINE_FEED;
      });
    });
    
    ticket += SEPARATOR + LINE_FEED;
    
    // Observações
    if (order.notes) {
      ticket += BOLD_ON + 'OBSERVAÇÕES:' + BOLD_OFF + LINE_FEED;
      ticket += order.notes + LINE_FEED;
      ticket += SEPARATOR + LINE_FEED;
    }
    
    // Resumo
    ticket += BOLD_ON + 'RESUMO:' + BOLD_OFF + LINE_FEED;
    ticket += `Total de itens: ${items.reduce((acc, item) => acc + item.orderItem.quantity, 0)}` + LINE_FEED;
    ticket += `Valor total: ${parseFloat(order.totalAmount).toFixed(2)} Kz` + LINE_FEED;
    ticket += `Pagamento: ${this.getPaymentMethodLabel(order.paymentMethod)}` + LINE_FEED;
    
    if (order.estimatedDeliveryTime) {
      ticket += `Estimativa: ${order.estimatedDeliveryTime}` + LINE_FEED;
    }
    
    ticket += SEPARATOR + LINE_FEED;
    ticket += CENTER;
    ticket += 'Obrigado!' + LINE_FEED;
    ticket += LEFT;
    ticket += LINE_FEED + LINE_FEED + LINE_FEED;
    ticket += CUT_PAPER;
    
    return ticket;
  }

  // Agrupar itens por estação de trabalho
  static groupItemsByStation(items: any[]): Record<string, any[]> {
    const stations: Record<string, any[]> = {
      'grill': [],
      'fritura': [],
      'montagem': [],
      'bebidas': []
    };

    items.forEach(item => {
      const category = item.menuItem?.category?.toLowerCase() || 'montagem';
      
      if (category.includes('carne') || category.includes('frango') || category.includes('taco')) {
        stations.grill.push(item);
      } else if (category.includes('frit') || category.includes('nacho') || category.includes('chips')) {
        stations.fritura.push(item);
      } else if (category.includes('bebida') || category.includes('drink') || category.includes('suco')) {
        stations.bebidas.push(item);
      } else {
        stations.montagem.push(item);
      }
    });

    // Remover estações vazias
    Object.keys(stations).forEach(key => {
      if (stations[key].length === 0) {
        delete stations[key];
      }
    });

    return stations;
  }

  // Labels auxiliares
  static getOrderTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'delivery': 'ENTREGA',
      'takeaway': 'BALCÃO',
      'dine-in': 'MESA'
    };
    return labels[type] || type.toUpperCase();
  }

  static getLocationLabel(locationId: string): string {
    const labels: Record<string, string> = {
      'ilha': 'Ilha de Luanda',
      'talatona': 'Talatona',
      'movel': 'Food Truck'
    };
    return labels[locationId] || locationId;
  }

  static getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'transfer': 'Transferência'
    };
    return labels[method] || method;
  }

  // Sistema de impressão avançado
  static async printTicket(orderId: number, printerId?: number): Promise<boolean> {
    try {
      const ticket = await this.generateTicket(orderId);
      
      // Se printerId for fornecido, buscar configurações da impressora
      if (printerId) {
        const [printer] = await db
          .select()
          .from(printers)
          .where(and(eq(printers.id, printerId), eq(printers.isActive, true)));
          
        if (!printer) {
          throw new Error("Impressora não encontrada ou inativa");
        }
        
        // Criar job de impressão
        await this.createPrintJob(orderId, printerId, ticket);
        
        // Executar impressão baseada no tipo
        return await this.executePrint(printer, ticket);
      } else {
        // Auto-selecionar impressora ativa para cozinha
        const activeKitchenPrinters = await db
          .select()
          .from(printers)
          .where(and(
            eq(printers.isActive, true),
            eq(printers.printerFor, 'kitchen')
          ));
        
        if (activeKitchenPrinters.length > 0) {
          const printer = activeKitchenPrinters[0];
          await this.createPrintJob(orderId, printer.id, ticket);
          return await this.executePrint(printer, ticket);
        } else {
          // Fallback para impressão no console
          console.log("Ticket gerado (sem impressora configurada):", ticket);
          return true;
        }
      }
    } catch (error) {
      console.error("Erro ao imprimir ticket:", error);
      return false;
    }
  }

  // Criar job de impressão no banco
  static async createPrintJob(orderId: number, printerId: number, content: string): Promise<void> {
    try {
      await db.execute(`
        INSERT INTO print_jobs (order_id, printer_id, content, status)
        VALUES (${orderId}, ${printerId}, '${content.replace(/'/g, "''")}', 'pending')
      `);
    } catch (error) {
      console.error("Erro ao criar job de impressão:", error);
    }
  }

  // Executar impressão baseada no tipo da impressora
  static async executePrint(printer: Printer, content: string): Promise<boolean> {
    try {
      switch (printer.type) {
        case 'network':
          return await this.printToNetwork(printer, content);
        case 'usb':
          return await this.printToUSB(printer, content);
        case 'bluetooth':
          return await this.printToBluetooth(printer, content);
        default:
          console.log(`Impressão simulada na ${printer.name}:`, content);
          return true;
      }
    } catch (error) {
      console.error(`Erro ao imprimir na ${printer.name}:`, error);
      return false;
    }
  }

  // Impressão em rede (TCP/IP)
  static async printToNetwork(printer: Printer, content: string): Promise<boolean> {
    try {
      // Simulação de impressão TCP/IP
      console.log(`Enviando para impressora de rede ${printer.ipAddress}:${printer.port}`);
      console.log("Conteúdo:", content);
      
      // Em produção, usar socket TCP aqui
      // const net = require('net');
      // const client = new net.Socket();
      // client.connect(printer.port, printer.ipAddress, () => {
      //   client.write(content);
      //   client.end();
      // });
      
      return true;
    } catch (error) {
      console.error("Erro na impressão de rede:", error);
      return false;
    }
  }

  // Impressão USB
  static async printToUSB(printer: Printer, content: string): Promise<boolean> {
    try {
      console.log(`Enviando para impressora USB ${printer.devicePath}`);
      
      // Em produção, usar comando do sistema
      // await fs.writeFileSync(printer.devicePath!, content);
      // ou usar lp/lpr: await execAsync(`echo "${content}" | lp -d ${printer.name}`);
      
      console.log("Conteúdo enviado via USB:", content);
      return true;
    } catch (error) {
      console.error("Erro na impressão USB:", error);
      return false;
    }
  }

  // Impressão Bluetooth
  static async printToBluetooth(printer: Printer, content: string): Promise<boolean> {
    try {
      console.log(`Enviando para impressora Bluetooth ${printer.name}`);
      
      // Em produção, usar biblioteca Bluetooth
      console.log("Conteúdo enviado via Bluetooth:", content);
      return true;
    } catch (error) {
      console.error("Erro na impressão Bluetooth:", error);
      return false;
    }
  }

  // Testar impressora
  static async testPrinter(printerId: number): Promise<boolean> {
    try {
      const [printer] = await db
        .select()
        .from(printers)
        .where(eq(printers.id, printerId));
        
      if (!printer) {
        throw new Error("Impressora não encontrada");
      }

      const testContent = this.generateTestTicket(printer);
      return await this.executePrint(printer, testContent);
    } catch (error) {
      console.error("Erro ao testar impressora:", error);
      return false;
    }
  }

  // Gerar ticket de teste
  static generateTestTicket(printer: Printer): string {
    const ESC = '\x1B';
    const GS = '\x1D';
    const CENTER = `${ESC}a\x01`;
    const LEFT = `${ESC}a\x00`;
    const BOLD_ON = `${ESC}E\x01`;
    const BOLD_OFF = `${ESC}E\x00`;
    const CUT_PAPER = `${GS}V\x01`;
    const LINE_FEED = '\n';
    const SEPARATOR = '--------------------------------';

    let ticket = `${ESC}@`; // Inicializar
    ticket += CENTER;
    ticket += BOLD_ON + 'TESTE DE IMPRESSORA' + BOLD_OFF + LINE_FEED;
    ticket += LEFT;
    ticket += SEPARATOR + LINE_FEED;
    ticket += `Impressora: ${printer.name}` + LINE_FEED;
    ticket += `Tipo: ${printer.type.toUpperCase()}` + LINE_FEED;
    ticket += `Papel: ${printer.paperWidth}mm` + LINE_FEED;
    ticket += `Data: ${new Date().toLocaleDateString('pt-AO')}` + LINE_FEED;
    ticket += `Hora: ${new Date().toLocaleTimeString('pt-AO')}` + LINE_FEED;
    ticket += SEPARATOR + LINE_FEED;
    ticket += CENTER + 'TESTE REALIZADO COM SUCESSO' + LINE_FEED;
    ticket += LEFT + LINE_FEED + LINE_FEED;
    ticket += CUT_PAPER;
    
    return ticket;
  }

  // Buscar histórico de impressões
  static async getPrintHistory(orderId?: number, limit: number = 50): Promise<any[]> {
    try {
      let query = `
        SELECT 
          pj.*,
          o.customer_name,
          p.name as printer_name
        FROM print_jobs pj
        LEFT JOIN orders o ON pj.order_id = o.id
        LEFT JOIN printers p ON pj.printer_id = p.id
      `;
      
      if (orderId) {
        query += ` WHERE pj.order_id = ${orderId}`;
      }
      
      query += ` ORDER BY pj.created_at DESC LIMIT ${limit}`;
      
      const result = await db.execute(query);
      return (result as any).rows || [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  }

  // Sistema de impressão automática para novos pedidos
  static async autoPrintNewOrder(orderId: number): Promise<void> {
    try {
      // Buscar impressoras com impressão automática ativada
      const autoPrinters = await db
        .select()
        .from(printers)
        .where(and(
          eq(printers.isActive, true),
          eq(printers.autoprint, true),
          eq(printers.printerFor, 'kitchen')
        ));

      // Imprimir em todas as impressoras automáticas
      for (const printer of autoPrinters) {
        await this.printTicket(orderId, printer.id);
      }
    } catch (error) {
      console.error("Erro na impressão automática:", error);
    }
  }

  // Reprocessar jobs falhados
  static async retryFailedJobs(): Promise<void> {
    try {
      const failedJobs = await db.execute(`
        SELECT pj.*, p.* FROM print_jobs pj
        JOIN printers p ON pj.printer_id = p.id
        WHERE pj.status = 'failed' 
        AND pj.retry_count < 3 
        AND p.is_active = true
        ORDER BY pj.created_at ASC
        LIMIT 10
      `);

      for (const job of ((failedJobs as any).rows || [])) {
        console.log(`Reprocessando job ${job.id}...`);
        
        const success = await this.executePrint(job as any, job.content);
        
        if (success) {
          await db.execute(`
            UPDATE print_jobs 
            SET status = 'completed', printed_at = NOW(), retry_count = retry_count + 1
            WHERE id = ${job.id}
          `);
        } else {
          await db.execute(`
            UPDATE print_jobs 
            SET retry_count = retry_count + 1, error_message = 'Retry failed'
            WHERE id = ${job.id}
          `);
        }
      }
    } catch (error) {
      console.error("Erro ao reprocessar jobs:", error);
    }
  }

  // Buscar impressoras ativas por localização
  static async getActivePrinters(locationId: string, printerFor?: string): Promise<Printer[]> {
    const conditions = [
      eq(printers.locationId, locationId),
      eq(printers.isActive, true)
    ];

    if (printerFor) {
      conditions.push(eq(printers.printerFor, printerFor as any));
    }

    return await db
      .select()
      .from(printers)
      .where(and(...conditions));
  }
}