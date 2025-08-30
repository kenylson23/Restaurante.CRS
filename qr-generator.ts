import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

export interface QRCodeData {
  tableId: number;
  locationId: string;
  tableNumber: number;
  timestamp: number;
  code: string;
}

export async function generateTableQRCode(
  tableId: number,
  locationId: string,
  tableNumber: number,
  baseUrl: string = 'https://lastortillas.replit.app'
): Promise<{ qrCodeUrl: string; qrCode: string; qrCodeData: QRCodeData }> {
  // Gerar código único para a mesa
  const code = nanoid(10);
  
  // Dados do QR Code
  const qrCodeData: QRCodeData = {
    tableId,
    locationId,
    tableNumber,
    timestamp: Date.now(),
    code
  };
  
  // URL que o QR code vai apontar
  const qrCodeUrl = `${baseUrl}/menu?table=${tableId}&location=${locationId}&code=${code}&t=${tableNumber}`;
  
  // Gerar o QR Code como Data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#DC2626', // Vermelho da marca
      light: '#FFFFFF'
    },
    width: 300
  });
  
  return {
    qrCodeUrl,
    qrCode: code,
    qrCodeData
  };
}

export async function generateQRCodeSVG(
  tableId: number,
  locationId: string,
  tableNumber: number,
  baseUrl: string = 'https://lastortillas.replit.app'
): Promise<string> {
  const code = nanoid(10);
  const qrCodeUrl = `${baseUrl}/menu?table=${tableId}&location=${locationId}&code=${code}&t=${tableNumber}`;
  
  return await QRCode.toString(qrCodeUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: {
      dark: '#DC2626',
      light: '#FFFFFF'
    },
    width: 300
  });
}

export function validateQRCode(
  code: string,
  tableId: number,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 horas
): boolean {
  // Validação básica do código QR
  if (!code || code.length !== 10) {
    return false;
  }
  
  // Aqui poderia adicionar validação de timestamp se necessário
  return true;
}