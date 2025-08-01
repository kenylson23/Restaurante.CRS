import { db } from "../db";
import { printers, orders, orderItems, menuItems } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import type { Order, OrderItem, MenuItem, Printer } from "../../shared/schema";

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

  // Simular impressão (para teste)
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
        
        // Aqui seria a lógica real de impressão baseada no tipo de impressora
        console.log(`Imprimindo na impressora ${printer.name} (${printer.type}):`, ticket);
      } else {
        // Impressão padrão (console para desenvolvimento)
        console.log("Ticket gerado:", ticket);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao imprimir ticket:", error);
      return false;
    }
  }

  // Buscar impressoras ativas por localização
  static async getActivePrinters(locationId: string, printerFor?: string): Promise<Printer[]> {
    const conditions = [
      eq(printers.locationId, locationId),
      eq(printers.isActive, true)
    ];

    if (printerFor) {
      conditions.push(eq(printers.printerFor, printerFor));
    }

    return await db
      .select()
      .from(printers)
      .where(and(...conditions));
  }
}