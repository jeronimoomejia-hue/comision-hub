// Mensualista Demo - Complete Mock Data System
// TODO EN PESOS COLOMBIANOS (COP)
// MODELO MERCADO PAGO: SPLIT + RETENCIÓN + ESTADOS (HELD/RELEASED/REFUNDED)

// ============= INTERFACES =============

export interface User {
  id: string;
  role: 'vendor' | 'company' | 'admin';
  name: string;
  email: string;
  country: string;
  createdAt: string;
  status: 'active' | 'paused' | 'blocked';
  companyId?: string;
  avatarUrl?: string;
}

export type CompanyPlan = 'freemium' | 'premium' | 'enterprise';

export interface Company {
  id: string;
  name: string;
  industry: string;
  country: string;
  status: 'active' | 'paused' | 'blocked';
  plan: CompanyPlan;
  pendingPaymentCOP: number;
  nextPaymentDate: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  customDomain?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  country: string;
  status: 'active' | 'paused' | 'blocked';
  pendingCommissionsCOP: number;
  nextPaymentDate: string;
  createdAt: string;
}

export interface RefundPolicy {
  autoRefund: boolean;
  refundWindowDays: 7 | 14 | 30;
}

export interface Material {
  id: string;
  serviceId: string;
  title: string;
  type: 'pdf';
  url: string;
  uploadedAt: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  status: 'available' | 'delivered' | 'expired';
  assignedToSaleId?: string;
  deliveredAt?: string;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  category: string;
  priceCOP: number;
  type: 'suscripción' | 'puntual';
  vendorCommissionPct: number;
  mensualistaPct: number;
  status: 'activo' | 'pausado';
  refundPolicy: RefundPolicy;
  requiresTraining: boolean;
  trainingType?: 'pdf' | 'video';
  trainingUrl?: string;
  materials: Material[];
  activeSubscriptions?: number;
  activationCodes: ActivationCode[];
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  companyId: string;
  serviceName: string;
  category: string;
  serviceType: 'suscripción' | 'puntual';
  priceCOP: number;
  vendorCommissionPct: number;
  description: string;
  countries: string[];
  websiteUrl?: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string;
  refundPolicy: RefundPolicy;
  trainingType?: 'pdf' | 'video';
  trainingUrl?: string;
  materials?: string[];
  status: 'en revisión' | 'reunión agendada' | 'aprobado' | 'rechazado';
  meetingDate?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// VENTA/TRANSACCIÓN - Modelo Mercado Pago con SPLIT y RETENCIÓN
export type TransactionStatus = 'HELD' | 'RELEASED' | 'REFUNDED';

export interface Sale {
  id: string;
  serviceId: string;
  companyId: string;
  vendorId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  // Montos
  grossAmount: number; // Monto total de la venta
  // Splits calculados
  sellerCommissionAmount: number; // Comisión vendedor
  mensualistaFeeAmount: number; // Fee Mensualista
  providerNetAmount: number; // Neto para empresa
  // Fechas de retención
  holdStartAt: string;
  holdEndAt: string; // Fecha esperada de liberación
  releasedAt?: string;
  refundedAt?: string;
  // Estado MP
  status: TransactionStatus;
  paymentProvider: 'MercadoPago';
  mpPaymentId: string;
  isSubscription: boolean;
  subscriptionActive?: boolean;
  notes?: string;
  activationCode?: string; // Code delivered to client
  createdAt: string;
  // Legacy compatibility
  amountCOP?: number;
}

// Notificaciones del sistema
export interface Notification {
  id: string;
  targetRole: 'vendor' | 'company' | 'admin' | 'all';
  targetUserId?: string;
  title: string;
  body: string;
  type: 'system' | 'sale' | 'payment' | 'training' | 'refund';
  isActive: boolean;
  createdAt: string;
}

// Tickets de soporte (sin contacto directo)
export interface SupportTicket {
  id: string;
  createdByRole: 'vendor' | 'company';
  createdById: string;
  relatedTransactionId?: string;
  relatedServiceId?: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: string;
}

export interface Commission {
  id: string;
  saleId: string;
  vendorId: string;
  amountCOP: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  paymentDate?: string;
  createdAt: string;
}

// PAGOS AUTOMÁTICOS (reemplaza retiros) - vinculados a ventas reales
export interface VendorPayment {
  id: string;
  vendorId: string;
  saleId: string; // Vinculado a la venta que generó este pago
  serviceId: string;
  amountCOP: number; // Comisión del vendedor
  grossAmount: number; // Monto bruto de la venta
  mensualistaFee: number; // Fee Mensualista
  providerNet: number; // Neto empresa
  status: 'programado' | 'enviado' | 'falló';
  scheduledDate: string;
  processedAt?: string;
  referenceId?: string;
  failureReason?: string;
  clientName?: string;
}

export interface CompanyPayment {
  id: string;
  companyId: string;
  saleId: string; // Vinculado a la venta que generó este pago
  serviceId: string;
  vendorId: string;
  amountCOP: number; // Neto empresa
  grossAmount: number; // Monto bruto de la venta
  vendorCommission: number; // Comisión vendedor
  mensualistaFee: number; // Fee Mensualista
  status: 'programado' | 'enviado' | 'falló';
  scheduledDate: string;
  processedAt?: string;
  referenceId?: string;
  failureReason?: string;
  clientName?: string;
}

export interface RefundRequest {
  id: string;
  saleId: string;
  vendorId: string;
  companyId: string;
  serviceId: string;
  reason: string;
  createdAt: string;
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'automático';
  decisionBy?: 'empresa' | 'sistema';
  decidedAt?: string;
  rejectionReason?: string;
}

export interface TrainingProgress {
  id: string;
  vendorId: string;
  serviceId: string;
  status: 'not_started' | 'in_progress' | 'declared_completed';
  lastAccessedAt: string;
  completedAt?: string;
  // Sin progressPct - el vendedor declara completado
}

export interface Subscription {
  id: string;
  saleId: string;
  vendorId: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  status: 'active' | 'cancelled';
  startDate: string;
  nextPaymentDate: string;
  monthlyCommissionCOP: number;
  daysActive: number;
}

export interface Training {
  id: string;
  serviceId: string;
  companyId: string;
  type: 'pdf' | 'video';
  assetUrl: string;
  durationMinutes: number;
  status: 'active' | 'paused';
  createdAt: string;
}

// Legacy interfaces for compatibility
export interface VendorPayout {
  id: string;
  vendorId: string;
  amountCOP: number;
  status: 'pendiente' | 'enviado' | 'falló';
  createdAt: string;
  processedAt?: string;
  referenceId?: string;
}

export interface CompanyPayout {
  id: string;
  companyId: string;
  amountCOP: number;
  status: 'pendiente' | 'enviado' | 'falló';
  createdAt: string;
  processedAt?: string;
  referenceId?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function formatCOP(amount: number): string {
  return '$ ' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' COP';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  if (currency === 'COP') return formatCOP(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
}

// Status labels for display
export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    'HELD': 'En retención',
    'RELEASED': 'Liberado',
    'REFUNDED': 'Devuelto'
  };
  return labels[status];
}

export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    'HELD': 'bg-yellow-500/10 text-yellow-600',
    'RELEASED': 'bg-green-500/10 text-green-600',
    'REFUNDED': 'bg-red-500/10 text-red-600'
  };
  return colors[status];
}

// =============================================================================
// CURRENT USER IDS
// =============================================================================

export const CURRENT_VENDOR_ID = 'vendor-001';
export const CURRENT_COMPANY_ID = 'company-001';

// =============================================================================
// VENDOR ↔ COMPANY LINKS (multi-empresa)
// =============================================================================

export interface VendorCompanyLink {
  vendorId: string;
  companyId: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'paused';
}

export const vendorCompanyLinks: VendorCompanyLink[] = [
  // vendor-001 linked to 3 companies
  { vendorId: 'vendor-001', companyId: 'company-001', joinedAt: '2024-06-01', status: 'active' },
  { vendorId: 'vendor-001', companyId: 'company-002', joinedAt: '2024-08-15', status: 'active' },
  { vendorId: 'vendor-001', companyId: 'company-005', joinedAt: '2024-10-01', status: 'active' },
  // other vendors
  { vendorId: 'vendor-002', companyId: 'company-001', joinedAt: '2024-07-01', status: 'active' },
  { vendorId: 'vendor-003', companyId: 'company-003', joinedAt: '2024-08-01', status: 'active' },
  { vendorId: 'vendor-004', companyId: 'company-004', joinedAt: '2024-09-01', status: 'active' },
  { vendorId: 'vendor-005', companyId: 'company-005', joinedAt: '2024-10-01', status: 'active' },
];

// =============================================================================
// DEMO DATA - EMPRESAS DE IA / SAAS
// =============================================================================

// Admin
export const adminUser: User = {
  id: 'admin-001',
  role: 'admin',
  name: 'Carlos Administrador',
  email: 'admin@mensualista.com',
  country: 'Colombia',
  createdAt: '2024-01-01',
  status: 'active'
};

// Companies (8) - Empresas de IA y SaaS
export const companies: Company[] = [
  { id: 'company-001', name: 'Poliza.ai', industry: 'IA para Seguros', country: 'Colombia', status: 'active', plan: 'enterprise', pendingPaymentCOP: 45200000, nextPaymentDate: '2025-01-24', contactEmail: 'contacto@poliza.ai', contactPhone: '+57 300 123 4567', websiteUrl: 'https://poliza.ai', customDomain: 'ventas.poliza.ai', primaryColor: '#5B6FE0', secondaryColor: '#4A5BC7' },
  { id: 'company-002', name: 'LexIA', industry: 'IA Legal', country: 'Colombia', status: 'active', plan: 'premium', pendingPaymentCOP: 78500000, nextPaymentDate: '2025-01-24', contactEmail: 'ventas@lexia.co', contactPhone: '+57 301 234 5678', websiteUrl: 'https://lexia.co', primaryColor: '#00B87A', secondaryColor: '#009965' },
  { id: 'company-003', name: 'Kreativo', industry: 'IA para Marketing', country: 'Colombia', status: 'active', plan: 'premium', pendingPaymentCOP: 22100000, nextPaymentDate: '2025-01-24', contactEmail: 'hola@kreativo.co', contactPhone: '+57 302 345 6789', websiteUrl: 'https://kreativo.co', primaryColor: '#E5294A', secondaryColor: '#C91D3D' },
  { id: 'company-004', name: 'Cierro', industry: 'IA para Ventas', country: 'Colombia', status: 'active', plan: 'freemium', pendingPaymentCOP: 35600000, nextPaymentDate: '2025-01-24', contactEmail: 'info@cierro.co', contactPhone: '+57 303 456 7890', websiteUrl: 'https://cierro.co', primaryColor: '#F59E0B', secondaryColor: '#D97706' },
  { id: 'company-005', name: 'Asista', industry: 'IA para Atención', country: 'Colombia', status: 'active', plan: 'enterprise', pendingPaymentCOP: 95200000, nextPaymentDate: '2025-01-24', contactEmail: 'soporte@asista.co', contactPhone: '+57 304 567 8901', websiteUrl: 'https://asista.co', customDomain: 'vendedores.asista.co', primaryColor: '#5007FA', secondaryColor: '#3D04C2' },
  { id: 'company-006', name: 'NumeroIA', industry: 'IA para Contabilidad', country: 'Colombia', status: 'active', plan: 'freemium', pendingPaymentCOP: 18900000, nextPaymentDate: '2025-01-24', contactEmail: 'contacto@numeroia.co', contactPhone: '+57 305 678 9012', websiteUrl: 'https://numeroia.co', primaryColor: '#6366F1', secondaryColor: '#4F46E5' },
  { id: 'company-007', name: 'Recruta', industry: 'IA para RRHH', country: 'Colombia', status: 'active', plan: 'premium', pendingPaymentCOP: 28400000, nextPaymentDate: '2025-01-24', contactEmail: 'admin@recruta.co', contactPhone: '+57 306 789 0123', websiteUrl: 'https://recruta.co', primaryColor: '#EC4899', secondaryColor: '#DB2777' },
  { id: 'company-008', name: 'Blindaje', industry: 'IA para Ciberseguridad', country: 'Colombia', status: 'active', plan: 'enterprise', pendingPaymentCOP: 67800000, nextPaymentDate: '2025-01-24', contactEmail: 'info@blindaje.co', contactPhone: '+57 307 890 1234', websiteUrl: 'https://blindaje.co', customDomain: 'red.blindaje.co', primaryColor: '#10B981', secondaryColor: '#059669' }
];

// Company Users (8)
export const companyUsers: User[] = companies.map((c, i) => ({
  id: `company-user-${String(i + 1).padStart(3, '0')}`,
  role: 'company' as const,
  name: ['María González', 'Roberto Mejía', 'Lucía Fernández', 'Andrés Paredes', 'Patricia Luna', 'Jorge Quispe', 'Carolina Vélez', 'Fernando Reyes'][i],
  email: ['maria@poliza.ai', 'roberto@lexia.co', 'lucia@kreativo.co', 'andres@cierro.co', 'patricia@asista.co', 'jorge@numeroia.co', 'carolina@recruta.co', 'fernando@blindaje.co'][i],
  country: 'Colombia',
  createdAt: ['2024-03-15', '2024-04-10', '2024-05-20', '2024-06-05', '2024-04-25', '2024-07-15', '2024-08-01', '2024-05-10'][i],
  status: c.status as 'active' | 'paused' | 'blocked',
  companyId: c.id
}));

// Vendors (25)
const vendorNames = [
  'Juan Pérez', 'Ana Martínez', 'Carlos López', 'Laura Sánchez', 'Diego Ramírez',
  'Sofía Torres', 'Miguel Hernández', 'Valentina Castro', 'Andrés Flores', 'Camila Vargas',
  'Roberto Morales', 'Isabella Ruiz', 'Fernando Díaz', 'Paula Reyes', 'Sebastián Ortiz',
  'Luciana Mendoza', 'Mateo Silva', 'Mariana Jiménez', 'Nicolás Rojas', 'Gabriela Herrera',
  'Santiago Gómez', 'Daniela Ospina', 'Alejandro Cruz', 'Natalia Ríos', 'David Cardona'
];

export const vendors: User[] = vendorNames.map((name, i) => ({
  id: `vendor-${String(i + 1).padStart(3, '0')}`,
  role: 'vendor' as const,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
  country: 'Colombia',
  createdAt: `2024-${String(Math.floor(i / 4) + 3).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  status: i === 13 ? 'blocked' : (i === 8 ? 'paused' : 'active') as 'active' | 'paused' | 'blocked'
}));

// =============================================================================
// SERVICIOS DE IA - 24 servicios (precios $100k - $300k COP)
// =============================================================================

export const services: Service[] = [
  // Poliza.ai - IA para Seguros
  { 
    id: 'service-001', companyId: 'company-001', name: 'Poliza Cotizador IA', 
    description: 'IA que genera cotizaciones de seguros en segundos analizando el perfil del cliente.', 
    category: 'IA para Seguros', priceCOP: 179000, type: 'suscripción',
    vendorCommissionPct: 20, mensualistaPct: 8, status: 'activo',
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, trainingType: 'video', trainingUrl: 'https://example.com/poliza-training',
    activeSubscriptions: 42,
    materials: [{ id: 'mat-001', serviceId: 'service-001', title: 'Guion de venta Poliza', type: 'pdf', url: '/materials/guion-poliza.pdf', uploadedAt: '2024-06-01' }], 
    activationCodes: [{ id: 'ac-001-001', code: 'POLIZA-COT-0001', status: 'delivered' as const, assignedToSaleId: 'sale-001', deliveredAt: '2025-01-11' }, { id: 'ac-001-002', code: 'POLIZA-COT-0002', status: 'delivered' as const, assignedToSaleId: 'sale-002', deliveredAt: '2025-01-12' }, { id: 'ac-001-003', code: 'POLIZA-COT-0003', status: 'delivered' as const, assignedToSaleId: 'sale-003', deliveredAt: '2025-01-13' }, { id: 'ac-001-004', code: 'POLIZA-COT-0004', status: 'delivered' as const, assignedToSaleId: 'sale-004', deliveredAt: '2025-01-14' }, { id: 'ac-001-005', code: 'POLIZA-COT-0005', status: 'delivered' as const, assignedToSaleId: 'sale-005', deliveredAt: '2025-01-15' }, { id: 'ac-001-006', code: 'POLIZA-COT-0006', status: 'delivered' as const, assignedToSaleId: 'sale-006', deliveredAt: '2025-01-16' }, { id: 'ac-001-007', code: 'POLIZA-COT-0007', status: 'delivered' as const, assignedToSaleId: 'sale-007', deliveredAt: '2025-01-17' }, { id: 'ac-001-008', code: 'POLIZA-COT-0008', status: 'delivered' as const, assignedToSaleId: 'sale-008', deliveredAt: '2025-01-18' }, { id: 'ac-001-009', code: 'POLIZA-COT-0009', status: 'delivered' as const, assignedToSaleId: 'sale-009', deliveredAt: '2025-01-19' }, { id: 'ac-001-010', code: 'POLIZA-COT-0010', status: 'delivered' as const, assignedToSaleId: 'sale-010', deliveredAt: '2025-01-20' }, { id: 'ac-001-011', code: 'POLIZA-COT-0011', status: 'delivered' as const, assignedToSaleId: 'sale-011', deliveredAt: '2025-01-21' }, { id: 'ac-001-012', code: 'POLIZA-COT-0012', status: 'delivered' as const, assignedToSaleId: 'sale-012', deliveredAt: '2025-01-22' }, { id: 'ac-001-013', code: 'POLIZA-COT-0013', status: 'available' as const }, { id: 'ac-001-014', code: 'POLIZA-COT-0014', status: 'available' as const }, { id: 'ac-001-015', code: 'POLIZA-COT-0015', status: 'available' as const }, { id: 'ac-001-016', code: 'POLIZA-COT-0016', status: 'available' as const }, { id: 'ac-001-017', code: 'POLIZA-COT-0017', status: 'available' as const }, { id: 'ac-001-018', code: 'POLIZA-COT-0018', status: 'available' as const }, { id: 'ac-001-019', code: 'POLIZA-COT-0019', status: 'available' as const }, { id: 'ac-001-020', code: 'POLIZA-COT-0020', status: 'available' as const }, { id: 'ac-001-021', code: 'POLIZA-COT-0021', status: 'available' as const }, { id: 'ac-001-022', code: 'POLIZA-COT-0022', status: 'available' as const }, { id: 'ac-001-023', code: 'POLIZA-COT-0023', status: 'available' as const }, { id: 'ac-001-024', code: 'POLIZA-COT-0024', status: 'available' as const }, { id: 'ac-001-025', code: 'POLIZA-COT-0025', status: 'available' as const }],
    createdAt: '2024-06-01' 
  },
  { 
    id: 'service-002', companyId: 'company-001', name: 'Poliza Claims Bot', 
    description: 'Bot de IA para gestion automatica de reclamos de seguros.',
    category: 'IA para Seguros', priceCOP: 199000, type: 'suscripción',
    vendorCommissionPct: 18, mensualistaPct: 8, status: 'activo',
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, trainingType: 'pdf', trainingUrl: 'https://example.com/poliza-claims.pdf',
    activeSubscriptions: 28,
    materials: [{ id: 'mat-002', serviceId: 'service-002', title: 'Manual Claims Bot', type: 'pdf', url: '/materials/claims-bot.pdf', uploadedAt: '2024-06-15' }], 
    activationCodes: [{ id: 'ac-002-001', code: 'POLIZA-CLM-0001', status: 'delivered' as const, assignedToSaleId: 'sale-001', deliveredAt: '2025-01-11' }, { id: 'ac-002-002', code: 'POLIZA-CLM-0002', status: 'delivered' as const, assignedToSaleId: 'sale-002', deliveredAt: '2025-01-12' }, { id: 'ac-002-003', code: 'POLIZA-CLM-0003', status: 'delivered' as const, assignedToSaleId: 'sale-003', deliveredAt: '2025-01-13' }, { id: 'ac-002-004', code: 'POLIZA-CLM-0004', status: 'delivered' as const, assignedToSaleId: 'sale-004', deliveredAt: '2025-01-14' }, { id: 'ac-002-005', code: 'POLIZA-CLM-0005', status: 'delivered' as const, assignedToSaleId: 'sale-005', deliveredAt: '2025-01-15' }, { id: 'ac-002-006', code: 'POLIZA-CLM-0006', status: 'delivered' as const, assignedToSaleId: 'sale-006', deliveredAt: '2025-01-16' }, { id: 'ac-002-007', code: 'POLIZA-CLM-0007', status: 'delivered' as const, assignedToSaleId: 'sale-007', deliveredAt: '2025-01-17' }, { id: 'ac-002-008', code: 'POLIZA-CLM-0008', status: 'delivered' as const, assignedToSaleId: 'sale-008', deliveredAt: '2025-01-18' }, { id: 'ac-002-009', code: 'POLIZA-CLM-0009', status: 'available' as const }, { id: 'ac-002-010', code: 'POLIZA-CLM-0010', status: 'available' as const }, { id: 'ac-002-011', code: 'POLIZA-CLM-0011', status: 'available' as const }, { id: 'ac-002-012', code: 'POLIZA-CLM-0012', status: 'available' as const }, { id: 'ac-002-013', code: 'POLIZA-CLM-0013', status: 'available' as const }, { id: 'ac-002-014', code: 'POLIZA-CLM-0014', status: 'available' as const }, { id: 'ac-002-015', code: 'POLIZA-CLM-0015', status: 'available' as const }, { id: 'ac-002-016', code: 'POLIZA-CLM-0016', status: 'available' as const }, { id: 'ac-002-017', code: 'POLIZA-CLM-0017', status: 'available' as const }, { id: 'ac-002-018', code: 'POLIZA-CLM-0018', status: 'available' as const }, { id: 'ac-002-019', code: 'POLIZA-CLM-0019', status: 'available' as const }, { id: 'ac-002-020', code: 'POLIZA-CLM-0020', status: 'available' as const }, { id: 'ac-002-021', code: 'POLIZA-CLM-0021', status: 'available' as const }, { id: 'ac-002-022', code: 'POLIZA-CLM-0022', status: 'available' as const }, { id: 'ac-002-023', code: 'POLIZA-CLM-0023', status: 'available' as const }, { id: 'ac-002-024', code: 'POLIZA-CLM-0024', status: 'available' as const }, { id: 'ac-002-025', code: 'POLIZA-CLM-0025', status: 'available' as const }],
    createdAt: '2024-06-15' 
  },
  
  // LexIA - IA Legal
  { 
    id: 'service-003', companyId: 'company-002', name: 'LexIA Contratos', 
    description: 'Generacion y revision de contratos con inteligencia artificial en minutos.',
    category: 'IA Legal', priceCOP: 249000, type: 'suscripción',
    vendorCommissionPct: 18, mensualistaPct: 8, status: 'activo',
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, trainingType: 'video', trainingUrl: 'https://example.com/lexia-training',
    activeSubscriptions: 35,
    materials: [{ id: 'mat-003', serviceId: 'service-003', title: 'Demo LexIA', type: 'pdf', url: '/materials/demo-lexia.pdf', uploadedAt: '2024-07-01' }], 
    activationCodes: [{ id: 'ac-003-001', code: 'LEXIA-CTR-0001', status: 'delivered' as const, assignedToSaleId: 'sale-001', deliveredAt: '2025-01-11' }, { id: 'ac-003-002', code: 'LEXIA-CTR-0002', status: 'delivered' as const, assignedToSaleId: 'sale-002', deliveredAt: '2025-01-12' }, { id: 'ac-003-003', code: 'LEXIA-CTR-0003', status: 'delivered' as const, assignedToSaleId: 'sale-003', deliveredAt: '2025-01-13' }, { id: 'ac-003-004', code: 'LEXIA-CTR-0004', status: 'delivered' as const, assignedToSaleId: 'sale-004', deliveredAt: '2025-01-14' }, { id: 'ac-003-005', code: 'LEXIA-CTR-0005', status: 'delivered' as const, assignedToSaleId: 'sale-005', deliveredAt: '2025-01-15' }, { id: 'ac-003-006', code: 'LEXIA-CTR-0006', status: 'delivered' as const, assignedToSaleId: 'sale-006', deliveredAt: '2025-01-16' }, { id: 'ac-003-007', code: 'LEXIA-CTR-0007', status: 'available' as const }, { id: 'ac-003-008', code: 'LEXIA-CTR-0008', status: 'available' as const }, { id: 'ac-003-009', code: 'LEXIA-CTR-0009', status: 'available' as const }, { id: 'ac-003-010', code: 'LEXIA-CTR-0010', status: 'available' as const }, { id: 'ac-003-011', code: 'LEXIA-CTR-0011', status: 'available' as const }, { id: 'ac-003-012', code: 'LEXIA-CTR-0012', status: 'available' as const }, { id: 'ac-003-013', code: 'LEXIA-CTR-0013', status: 'available' as const }, { id: 'ac-003-014', code: 'LEXIA-CTR-0014', status: 'available' as const }, { id: 'ac-003-015', code: 'LEXIA-CTR-0015', status: 'available' as const }, { id: 'ac-003-016', code: 'LEXIA-CTR-0016', status: 'available' as const }, { id: 'ac-003-017', code: 'LEXIA-CTR-0017', status: 'available' as const }, { id: 'ac-003-018', code: 'LEXIA-CTR-0018', status: 'available' as const }, { id: 'ac-003-019', code: 'LEXIA-CTR-0019', status: 'available' as const }, { id: 'ac-003-020', code: 'LEXIA-CTR-0020', status: 'available' as const }, { id: 'ac-003-021', code: 'LEXIA-CTR-0021', status: 'available' as const }, { id: 'ac-003-022', code: 'LEXIA-CTR-0022', status: 'available' as const }, { id: 'ac-003-023', code: 'LEXIA-CTR-0023', status: 'available' as const }, { id: 'ac-003-024', code: 'LEXIA-CTR-0024', status: 'available' as const }, { id: 'ac-003-025', code: 'LEXIA-CTR-0025', status: 'available' as const }],
    createdAt: '2024-07-01' 
  },
  { 
    id: 'service-004', companyId: 'company-002', name: 'LexIA Due Diligence', 
    description: 'Analisis legal automatizado para procesos de M&A y compliance.',
    category: 'IA Legal', priceCOP: 299000, type: 'puntual',
    vendorCommissionPct: 22, mensualistaPct: 8, status: 'activo',
    refundPolicy: { autoRefund: false, refundWindowDays: 30 }, 
    requiresTraining: true, trainingType: 'video', trainingUrl: 'https://example.com/due-diligence',
    materials: [{ id: 'mat-004', serviceId: 'service-004', title: 'Proceso Due Diligence', type: 'pdf', url: '/materials/due-diligence.pdf', uploadedAt: '2024-07-15' }], 
    activationCodes: [{ id: 'ac-004-001', code: 'LEXIA-DD-0001', status: 'delivered' as const, assignedToSaleId: 'sale-001', deliveredAt: '2025-01-11' }, { id: 'ac-004-002', code: 'LEXIA-DD-0002', status: 'delivered' as const, assignedToSaleId: 'sale-002', deliveredAt: '2025-01-12' }, { id: 'ac-004-003', code: 'LEXIA-DD-0003', status: 'delivered' as const, assignedToSaleId: 'sale-003', deliveredAt: '2025-01-13' }, { id: 'ac-004-004', code: 'LEXIA-DD-0004', status: 'available' as const }, { id: 'ac-004-005', code: 'LEXIA-DD-0005', status: 'available' as const }, { id: 'ac-004-006', code: 'LEXIA-DD-0006', status: 'available' as const }, { id: 'ac-004-007', code: 'LEXIA-DD-0007', status: 'available' as const }, { id: 'ac-004-008', code: 'LEXIA-DD-0008', status: 'available' as const }, { id: 'ac-004-009', code: 'LEXIA-DD-0009', status: 'available' as const }, { id: 'ac-004-010', code: 'LEXIA-DD-0010', status: 'available' as const }, { id: 'ac-004-011', code: 'LEXIA-DD-0011', status: 'available' as const }, { id: 'ac-004-012', code: 'LEXIA-DD-0012', status: 'available' as const }, { id: 'ac-004-013', code: 'LEXIA-DD-0013', status: 'available' as const }, { id: 'ac-004-014', code: 'LEXIA-DD-0014', status: 'available' as const }, { id: 'ac-004-015', code: 'LEXIA-DD-0015', status: 'available' as const }, { id: 'ac-004-016', code: 'LEXIA-DD-0016', status: 'available' as const }, { id: 'ac-004-017', code: 'LEXIA-DD-0017', status: 'available' as const }, { id: 'ac-004-018', code: 'LEXIA-DD-0018', status: 'available' as const }, { id: 'ac-004-019', code: 'LEXIA-DD-0019', status: 'available' as const }, { id: 'ac-004-020', code: 'LEXIA-DD-0020', status: 'available' as const }, { id: 'ac-004-021', code: 'LEXIA-DD-0021', status: 'available' as const }, { id: 'ac-004-022', code: 'LEXIA-DD-0022', status: 'available' as const }, { id: 'ac-004-023', code: 'LEXIA-DD-0023', status: 'available' as const }, { id: 'ac-004-024', code: 'LEXIA-DD-0024', status: 'available' as const }, { id: 'ac-004-025', code: 'LEXIA-DD-0025', status: 'available' as const }],
    createdAt: '2024-07-15' 
  },

  { 
    id: 'service-005', 
    companyId: 'company-003', 
    name: 'Kreativo Copywriter', 
    description: 'IA que crea anuncios, copies y contenido de marketing automáticamente.', 
    category: 'IA para Marketing', 
    priceCOP: 149000, 
    type: 'suscripción', 
    vendorCommissionPct: 20, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/kreativo.pdf',
    activeSubscriptions: 67,
    materials: [{ id: 'mat-005', serviceId: 'service-005', title: 'Guía Kreativo', type: 'pdf', url: '/materials/guia-kreativo.pdf', uploadedAt: '2024-08-01' }], 
    activationCodes: [],
    createdAt: '2024-08-01'
  },
  { 
    id: 'service-006', 
    companyId: 'company-003', 
    name: 'Kreativo Landing Builder', 
    description: 'IA para crear landing pages de venta de alto impacto.', 
    category: 'IA para Marketing', 
    priceCOP: 300000, 
    type: 'puntual', 
    vendorCommissionPct: 25, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/landing-builder',
    materials: [{ id: 'mat-006', serviceId: 'service-006', title: 'Demo Landing Builder', type: 'pdf', url: '/materials/landing-builder.pdf', uploadedAt: '2024-08-15' }], 
    activationCodes: [],
    createdAt: '2024-08-15'
  },

  // Cierro - IA Ventas
  { 
    id: 'service-007', 
    companyId: 'company-004', 
    name: 'Cierro CRM IA', 
    description: 'CRM con IA para seguimiento automático de leads y predicción de cierre.', 
    category: 'IA para Ventas', 
    priceCOP: 229000, 
    type: 'suscripción', 
    vendorCommissionPct: 18, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/cierro-crm',
    activeSubscriptions: 48,
    materials: [{ id: 'mat-007', serviceId: 'service-007', title: 'Manual Cierro CRM', type: 'pdf', url: '/materials/cierro-crm.pdf', uploadedAt: '2024-09-01' }], 
    activationCodes: [],
    createdAt: '2024-09-01'
  },
  { 
    id: 'service-008', 
    companyId: 'company-004', 
    name: 'Cierro Cotizador', 
    description: 'IA que genera cotizaciones personalizadas automáticamente.', 
    category: 'IA para Ventas', 
    priceCOP: 189000, 
    type: 'suscripción', 
    vendorCommissionPct: 20, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: false,
    activeSubscriptions: 33,
    materials: [{ id: 'mat-008', serviceId: 'service-008', title: 'Guía Cotizador', type: 'pdf', url: '/materials/cotizador.pdf', uploadedAt: '2024-09-10' }], 
    activationCodes: [],
    createdAt: '2024-09-10'
  },

  // Asista - IA Atención
  { 
    id: 'service-009', 
    companyId: 'company-005', 
    name: 'Asista WhatsApp IA', 
    description: 'Asistente IA para WhatsApp Business que responde 24/7.', 
    category: 'IA para Atención', 
    priceCOP: 199000, 
    type: 'suscripción', 
    vendorCommissionPct: 22, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/whatsapp-ia',
    activeSubscriptions: 89,
    materials: [{ id: 'mat-009', serviceId: 'service-009', title: 'Setup WhatsApp IA', type: 'pdf', url: '/materials/whatsapp-ia.pdf', uploadedAt: '2024-09-15' }], 
    activationCodes: [],
    createdAt: '2024-09-15'
  },
  { 
    id: 'service-010', 
    companyId: 'company-005', 
    name: 'Asista Soporte IA', 
    description: 'IA para respuestas automáticas de soporte técnico multicanal.', 
    category: 'IA para Atención', 
    priceCOP: 159000, 
    type: 'suscripción', 
    vendorCommissionPct: 22, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/soporte-ia.pdf',
    activeSubscriptions: 56,
    materials: [{ id: 'mat-010', serviceId: 'service-010', title: 'Manual Soporte IA', type: 'pdf', url: '/materials/soporte-ia.pdf', uploadedAt: '2024-10-01' }], 
    activationCodes: [],
    createdAt: '2024-10-01'
  },

  // NumeroIA - IA Contabilidad
  { 
    id: 'service-011', 
    companyId: 'company-006', 
    name: 'NumeroIA Facturas', 
    description: 'IA para lectura y procesamiento automático de facturas.', 
    category: 'IA para Contabilidad', 
    priceCOP: 269000, 
    type: 'suscripción', 
    vendorCommissionPct: 15, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/numeroia',
    activeSubscriptions: 41,
    materials: [{ id: 'mat-011', serviceId: 'service-011', title: 'Demo NumeroIA', type: 'pdf', url: '/materials/demo-numeroia.pdf', uploadedAt: '2024-10-10' }], 
    activationCodes: [],
    createdAt: '2024-10-10'
  },
  { 
    id: 'service-012', 
    companyId: 'company-006', 
    name: 'NumeroIA Reportes',
    description: 'Generación automática de reportes financieros con análisis IA.', 
    category: 'IA para Contabilidad', 
    priceCOP: 219000, 
    type: 'suscripción', 
    vendorCommissionPct: 17, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/reportes-ia.pdf',
    activeSubscriptions: 27,
    materials: [{ id: 'mat-012', serviceId: 'service-012', title: 'Guía Reportes', type: 'pdf', url: '/materials/reportes-ia.pdf', uploadedAt: '2024-10-15' }], 
    activationCodes: [],
    createdAt: '2024-10-15'
  },

  // Recruta - IA RRHH
  { 
    id: 'service-013', 
    companyId: 'company-007', 
    name: 'Recruta Reclutamiento', 
    description: 'IA para filtrado automático de CVs y matching de candidatos.', 
    category: 'IA para RRHH', 
    priceCOP: 219000, 
    type: 'suscripción', 
    vendorCommissionPct: 18, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/recruta',
    activeSubscriptions: 31,
    materials: [{ id: 'mat-013', serviceId: 'service-013', title: 'Manual Recruta', type: 'pdf', url: '/materials/recruta.pdf', uploadedAt: '2024-10-20' }], 
    activationCodes: [],
    createdAt: '2024-10-20'
  },
  { 
    id: 'service-014', 
    companyId: 'company-007', 
    name: 'Recruta Onboarding', 
    description: 'Automatización del proceso de onboarding con IA.', 
    category: 'IA para RRHH', 
    priceCOP: 169000, 
    type: 'suscripción', 
    vendorCommissionPct: 20, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: false,
    activeSubscriptions: 24,
    materials: [{ id: 'mat-014', serviceId: 'service-014', title: 'Guía Onboarding', type: 'pdf', url: '/materials/onboarding.pdf', uploadedAt: '2024-11-01' }], 
    activationCodes: [],
    createdAt: '2024-11-01'
  },

  // Blindaje - IA Ciberseguridad
  { 
    id: 'service-015', 
    companyId: 'company-008', 
    name: 'Blindaje Alertas IA', 
    description: 'IA para detección de amenazas y alertas de seguridad en tiempo real.', 
    category: 'IA para Ciberseguridad', 
    priceCOP: 299000, 
    type: 'suscripción', 
    vendorCommissionPct: 15, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 30 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/blindaje',
    activeSubscriptions: 18,
    materials: [{ id: 'mat-015', serviceId: 'service-015', title: 'Setup Blindaje', type: 'pdf', url: '/materials/blindaje.pdf', uploadedAt: '2024-11-10' }], 
    activationCodes: [],
    createdAt: '2024-11-10'
  },
  { 
    id: 'service-016', 
    companyId: 'company-008', 
    name: 'Blindaje Pentesting IA', 
    description: 'Pruebas de penetración automatizadas con inteligencia artificial.', 
    category: 'IA para Ciberseguridad', 
    priceCOP: 300000, 
    type: 'puntual', 
    vendorCommissionPct: 20, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 30 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/pentesting.pdf',
    materials: [{ id: 'mat-016', serviceId: 'service-016', title: 'Metodología Pentest', type: 'pdf', url: '/materials/pentesting.pdf', uploadedAt: '2024-11-15' }], 
    activationCodes: [],
    createdAt: '2024-11-15'
  },

  // Servicios adicionales
  { 
    id: 'service-017', 
    companyId: 'company-003', 
    name: 'Kreativo Social Manager', 
    description: 'IA para gestión y programación de redes sociales.', 
    category: 'IA para Marketing', 
    priceCOP: 179000, 
    type: 'suscripción', 
    vendorCommissionPct: 20, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/social-manager',
    activeSubscriptions: 54,
    materials: [{ id: 'mat-017', serviceId: 'service-017', title: 'Manual Social Manager', type: 'pdf', url: '/materials/social-manager.pdf', uploadedAt: '2024-11-20' }], 
    activationCodes: [],
    createdAt: '2024-11-20'
  },
  { 
    id: 'service-018', 
    companyId: 'company-004', 
    name: 'Cierro Analytics', 
    description: 'IA para análisis predictivo de ventas y reportes automáticos.', 
    category: 'IA para Ventas', 
    priceCOP: 139000, 
    type: 'suscripción', 
    vendorCommissionPct: 22, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/analytics.pdf',
    activeSubscriptions: 38,
    materials: [{ id: 'mat-018', serviceId: 'service-018', title: 'Guía Analytics', type: 'pdf', url: '/materials/analytics.pdf', uploadedAt: '2024-11-25' }], 
    activationCodes: [],
    createdAt: '2024-11-25'
  },
  { 
    id: 'service-019', 
    companyId: 'company-005', 
    name: 'Asista Chatbot Web', 
    description: 'Chatbot IA para sitios web con integración en minutos.', 
    category: 'IA para Atención', 
    priceCOP: 129000, 
    type: 'suscripción', 
    vendorCommissionPct: 25, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: false,
    activeSubscriptions: 72,
    materials: [{ id: 'mat-019', serviceId: 'service-019', title: 'Setup Chatbot', type: 'pdf', url: '/materials/chatbot-web.pdf', uploadedAt: '2024-12-01' }], 
    activationCodes: [],
    createdAt: '2024-12-01'
  },
  { 
    id: 'service-020', 
    companyId: 'company-001', 
    name: 'Poliza Análisis de Riesgo', 
    description: 'IA para análisis y scoring de riesgo en pólizas de seguros.', 
    category: 'IA para Seguros', 
    priceCOP: 259000, 
    type: 'suscripción', 
    vendorCommissionPct: 18, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/riesgo-ia',
    activeSubscriptions: 19,
    materials: [{ id: 'mat-020', serviceId: 'service-020', title: 'Manual Riesgo IA', type: 'pdf', url: '/materials/riesgo-ia.pdf', uploadedAt: '2024-12-05' }], 
    activationCodes: [],
    createdAt: '2024-12-05'
  },
  { 
    id: 'service-021', 
    companyId: 'company-002', 
    name: 'LexIA Compliance', 
    description: 'Monitoreo automático de cumplimiento normativo con IA.', 
    category: 'IA Legal', 
    priceCOP: 279000, 
    type: 'suscripción', 
    vendorCommissionPct: 17, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/compliance',
    activeSubscriptions: 22,
    materials: [{ id: 'mat-021', serviceId: 'service-021', title: 'Manual Compliance', type: 'pdf', url: '/materials/compliance.pdf', uploadedAt: '2024-12-10' }], 
    activationCodes: [],
    createdAt: '2024-12-10'
  },
  { 
    id: 'service-022', 
    companyId: 'company-006', 
    name: 'NumeroIA Nómina', 
    description: 'Automatización de nómina y cálculos de prestaciones.', 
    category: 'IA para Contabilidad', 
    priceCOP: 239000, 
    type: 'suscripción', 
    vendorCommissionPct: 16, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: false, refundWindowDays: 14 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/nomina',
    activeSubscriptions: 35,
    materials: [{ id: 'mat-022', serviceId: 'service-022', title: 'Manual Nómina IA', type: 'pdf', url: '/materials/nomina.pdf', uploadedAt: '2024-12-15' }], 
    activationCodes: [],
    createdAt: '2024-12-15'
  },
  { 
    id: 'service-023', 
    companyId: 'company-007', 
    name: 'Recruta Performance', 
    description: 'IA para evaluación de desempeño y feedback automatizado.', 
    category: 'IA para RRHH', 
    priceCOP: 189000, 
    type: 'suscripción', 
    vendorCommissionPct: 19, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'pdf', 
    trainingUrl: 'https://example.com/performance.pdf',
    activeSubscriptions: 28,
    materials: [{ id: 'mat-023', serviceId: 'service-023', title: 'Guía Performance', type: 'pdf', url: '/materials/performance.pdf', uploadedAt: '2024-12-20' }], 
    activationCodes: [],
    createdAt: '2024-12-20'
  },
  { 
    id: 'service-024', 
    companyId: 'company-008', 
    name: 'Blindaje Training IA', 
    description: 'Capacitación en ciberseguridad con simulaciones de phishing.', 
    category: 'IA para Ciberseguridad', 
    priceCOP: 149000, 
    type: 'suscripción', 
    vendorCommissionPct: 22, 
    mensualistaPct: 8, 
    status: 'activo', 
    refundPolicy: { autoRefund: true, refundWindowDays: 7 }, 
    requiresTraining: true, 
    trainingType: 'video', 
    trainingUrl: 'https://example.com/cyber-training',
    activeSubscriptions: 45,
    materials: [{ id: 'mat-024', serviceId: 'service-024', title: 'Manual Cyber Training', type: 'pdf', url: '/materials/cyber-training.pdf', uploadedAt: '2024-12-25' }], 
    activationCodes: [],
    createdAt: '2024-12-25'
  }
];

// Service Requests
export const serviceRequests: ServiceRequest[] = [
  { id: 'req-001', companyId: 'company-001', serviceName: 'Poliza Telemedicina IA', category: 'IA para Seguros', serviceType: 'suscripción', priceCOP: 259000, vendorCommissionPct: 18, description: 'IA para gestión de telemedicina en seguros de salud.', countries: ['Colombia'], websiteUrl: 'https://poliza.ai/telemedicina', contactName: 'María González', contactEmail: 'maria@poliza.ai', contactWhatsApp: '+57 300 123 4567', refundPolicy: { autoRefund: true, refundWindowDays: 7 }, trainingType: 'video', status: 'aprobado', createdAt: '2024-11-01', updatedAt: '2024-11-15', adminNotes: 'Aprobado' },
  { id: 'req-002', companyId: 'company-002', serviceName: 'LexIA Arbitraje', category: 'IA Legal', serviceType: 'suscripción', priceCOP: 299000, vendorCommissionPct: 20, description: 'IA para procesos de arbitraje automatizado.', countries: ['Colombia'], contactName: 'Roberto Mejía', contactEmail: 'roberto@lexia.co', contactWhatsApp: '+57 301 234 5678', refundPolicy: { autoRefund: false, refundWindowDays: 14 }, trainingType: 'video', status: 'reunión agendada', meetingDate: '2025-01-25', createdAt: '2024-12-20', updatedAt: '2025-01-10' },
  { id: 'req-003', companyId: 'company-003', serviceName: 'Kreativo Video IA', category: 'IA para Marketing', serviceType: 'puntual', priceCOP: 280000, vendorCommissionPct: 24, description: 'IA para creación automática de videos promocionales.', countries: ['Colombia'], contactName: 'Lucía Fernández', contactEmail: 'lucia@kreativo.co', contactWhatsApp: '+57 302 345 6789', refundPolicy: { autoRefund: false, refundWindowDays: 14 }, trainingType: 'video', status: 'en revisión', createdAt: '2025-01-05', updatedAt: '2025-01-05' },
  { id: 'req-004', companyId: 'company-004', serviceName: 'Cierro Voice IA', category: 'IA para Ventas', serviceType: 'suscripción', priceCOP: 239000, vendorCommissionPct: 19, description: 'IA para llamadas de ventas automatizadas.', countries: ['Colombia'], contactName: 'Andrés Paredes', contactEmail: 'andres@cierro.co', contactWhatsApp: '+57 303 456 7890', refundPolicy: { autoRefund: false, refundWindowDays: 14 }, trainingType: 'video', status: 'en revisión', createdAt: '2025-01-15', updatedAt: '2025-01-15' },
  { id: 'req-005', companyId: 'company-005', serviceName: 'Asista Email IA', category: 'IA para Atención', serviceType: 'suscripción', priceCOP: 169000, vendorCommissionPct: 21, description: 'IA para respuesta automática de emails de soporte.', countries: ['Colombia'], contactName: 'Patricia Luna', contactEmail: 'patricia@asista.co', contactWhatsApp: '+57 304 567 8901', refundPolicy: { autoRefund: true, refundWindowDays: 7 }, trainingType: 'pdf', status: 'aprobado', createdAt: '2024-10-15', updatedAt: '2024-11-01' }
];

// =============================================================================
// NOTIFICACIONES DEL SISTEMA
// =============================================================================

export const notifications: Notification[] = [
  { id: 'notif-001', targetRole: 'vendor', title: '¡Nuevos servicios disponibles!', body: 'Se han añadido 3 nuevos servicios de IA para que puedas vender. Revisa el marketplace.', type: 'system', isActive: true, createdAt: '2025-01-20' },
  { id: 'notif-002', targetRole: 'vendor', title: 'Pagos automáticos mejorados', body: 'Ahora tus comisiones se liberan automáticamente después del período de retención.', type: 'payment', isActive: true, createdAt: '2025-01-18' },
  { id: 'notif-003', targetRole: 'company', title: 'Nuevas métricas de vendedores', body: 'Ahora puedes ver estadísticas detalladas de ventas en tu panel.', type: 'system', isActive: true, createdAt: '2025-01-19' },
  { id: 'notif-004', targetRole: 'all', title: 'Mantenimiento programado', body: 'El sistema estará en mantenimiento el domingo 26 de enero de 2-4am.', type: 'system', isActive: true, createdAt: '2025-01-21' },
];

// =============================================================================
// GENERATE 30 SALES WITH HELD/RELEASED/REFUNDED STATUS (Modelo MP)
// =============================================================================

const clientNames = [
  'Empresa ABC', 'Corporación XYZ', 'Grupo Delta', 'Industrias Beta', 'Soluciones Gamma',
  'Tech Solutions', 'Digital Corp', 'Innovatech', 'DataPro', 'CloudServices',
  'SmartBusiness', 'NextGen Tech', 'ProServices', 'GlobalTech', 'FastGrow',
  'StartupPlus', 'MegaCorp', 'TechStart', 'DigitalOne', 'InfoSystems',
  'Negocios Unidos', 'Inversiones Alfa', 'Grupo Omega', 'Consultores Pro', 'Digital Express',
  'Smart Corp', 'Futuro Tech', 'Innovación Plus', 'Servicios Élite', 'Desarrollos CR'
];

function generateSales(): Sale[] {
  const salesList: Sale[] = [];
  const today = new Date();
  const activeServices = services.filter(s => s.status === 'activo');
  
  // Servicios de Poliza.ai para vendor-001
  const polizaServices = services.filter(s => s.companyId === 'company-001' && s.status === 'activo');
  
  // Generar 18 RELEASED, 9 HELD, 3 REFUNDED = 30 transacciones para vendor-001
  const statusDistribution: TransactionStatus[] = [
    ...Array(18).fill('RELEASED'),
    ...Array(9).fill('HELD'),
    ...Array(3).fill('REFUNDED')
  ];
  
  for (let i = 0; i < 30; i++) {
    const status = statusDistribution[i];
    const daysAgo = status === 'HELD' ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 30) + 7;
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    
    const holdEndDate = new Date(saleDate);
    holdEndDate.setDate(holdEndDate.getDate() + 7); // 7 días de retención
    
    const service = polizaServices[Math.floor(Math.random() * polizaServices.length)];
    const client = clientNames[Math.floor(Math.random() * clientNames.length)];
    
    // Calcular splits
    const grossAmount = service.priceCOP;
    const sellerCommissionAmount = Math.round(grossAmount * (service.vendorCommissionPct / 100));
    const mensualistaFeeAmount = Math.round(grossAmount * (service.mensualistaPct / 100));
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    
    salesList.push({
      id: `sale-v1-${String(i + 1).padStart(3, '0')}`,
      serviceId: service.id,
      companyId: service.companyId,
      vendorId: 'vendor-001',
      clientName: client,
      clientEmail: `contacto@${client.toLowerCase().replace(/\s+/g, '')}.co`,
      grossAmount,
      sellerCommissionAmount,
      mensualistaFeeAmount,
      providerNetAmount,
      holdStartAt: saleDate.toISOString().split('T')[0],
      holdEndAt: holdEndDate.toISOString().split('T')[0],
      releasedAt: status === 'RELEASED' ? holdEndDate.toISOString().split('T')[0] : undefined,
      refundedAt: status === 'REFUNDED' ? saleDate.toISOString().split('T')[0] : undefined,
      status,
      paymentProvider: 'MercadoPago',
      mpPaymentId: `MP-${Date.now()}-${i}`,
      isSubscription: service.type === 'suscripción',
      subscriptionActive: status !== 'REFUNDED' && service.type === 'suscripción',
      createdAt: saleDate.toISOString().split('T')[0],
      amountCOP: grossAmount // Legacy compatibility
    });
  }
  
  // Generar 70 ventas adicionales para otros vendedores
  const otherStatusDistribution: TransactionStatus[] = [
    ...Array(45).fill('RELEASED'),
    ...Array(20).fill('HELD'),
    ...Array(5).fill('REFUNDED')
  ];
  
  for (let i = 0; i < 70; i++) {
    const status = otherStatusDistribution[i];
    const daysAgo = status === 'HELD' ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 30) + 7;
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    
    const holdEndDate = new Date(saleDate);
    holdEndDate.setDate(holdEndDate.getDate() + 7);
    
    const service = activeServices[Math.floor(Math.random() * activeServices.length)];
    const vendor = vendors[Math.floor(Math.random() * 20) + 1];
    const client = clientNames[Math.floor(Math.random() * clientNames.length)];
    
    const grossAmount = service.priceCOP;
    const sellerCommissionAmount = Math.round(grossAmount * (service.vendorCommissionPct / 100));
    const mensualistaFeeAmount = Math.round(grossAmount * (service.mensualistaPct / 100));
    const providerNetAmount = grossAmount - sellerCommissionAmount - mensualistaFeeAmount;
    
    salesList.push({
      id: `sale-${String(i + 1).padStart(3, '0')}`,
      serviceId: service.id,
      companyId: service.companyId,
      vendorId: vendor.id,
      clientName: client,
      clientEmail: `contacto@${client.toLowerCase().replace(/\s+/g, '')}.co`,
      grossAmount,
      sellerCommissionAmount,
      mensualistaFeeAmount,
      providerNetAmount,
      holdStartAt: saleDate.toISOString().split('T')[0],
      holdEndAt: holdEndDate.toISOString().split('T')[0],
      releasedAt: status === 'RELEASED' ? holdEndDate.toISOString().split('T')[0] : undefined,
      refundedAt: status === 'REFUNDED' ? saleDate.toISOString().split('T')[0] : undefined,
      status,
      paymentProvider: 'MercadoPago',
      mpPaymentId: `MP-${Date.now()}-O${i}`,
      isSubscription: service.type === 'suscripción',
      subscriptionActive: status !== 'REFUNDED' && service.type === 'suscripción',
      createdAt: saleDate.toISOString().split('T')[0],
      amountCOP: grossAmount
    });
  }
  
  return salesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const sales: Sale[] = generateSales();

// =============================================================================
// GENERATE COMMISSIONS (basadas en estado de venta)
// =============================================================================

function generateCommissions(): Commission[] {
  return sales.map((sale, i) => ({
    id: `comm-${String(i + 1).padStart(3, '0')}`,
    saleId: sale.id,
    vendorId: sale.vendorId,
    amountCOP: sale.sellerCommissionAmount,
    status: sale.status, // HELD, RELEASED, or REFUNDED
    paymentDate: sale.status === 'RELEASED' ? sale.releasedAt : undefined,
    createdAt: sale.createdAt
  }));
}

export const commissions: Commission[] = generateCommissions();

// =============================================================================
// PAGOS AUTOMÁTICOS A VENDEDORES - derivados de ventas RELEASED
// =============================================================================

function generateVendorPayments(): VendorPayment[] {
  const payments: VendorPayment[] = [];
  
  // Cada venta RELEASED genera un pago al vendedor (su comisión)
  const releasedSales = sales.filter(s => s.status === 'RELEASED');
  
  releasedSales.forEach((sale, i) => {
    const service = services.find(s => s.id === sale.serviceId);
    const scheduledDate = new Date(sale.releasedAt || sale.holdEndAt);
    scheduledDate.setDate(scheduledDate.getDate() + 1); // Día siguiente a liberación
    
    // 95% enviados, 5% fallidos
    let status: VendorPayment['status'];
    if (Math.random() < 0.05) {
      status = 'falló';
    } else {
      status = 'enviado';
    }
    
    payments.push({
      id: `vpay-${String(i + 1).padStart(3, '0')}`,
      vendorId: sale.vendorId,
      saleId: sale.id,
      serviceId: sale.serviceId,
      amountCOP: sale.sellerCommissionAmount,
      grossAmount: sale.grossAmount,
      mensualistaFee: sale.mensualistaFeeAmount,
      providerNet: sale.providerNetAmount,
      status,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      processedAt: status === 'enviado' ? scheduledDate.toISOString().split('T')[0] : undefined,
      referenceId: status === 'enviado' ? `REF-V-${sale.id}` : undefined,
      failureReason: status === 'falló' ? 'Cuenta bancaria inválida o datos incorrectos' : undefined,
      clientName: sale.clientName
    });
  });
  
  // Agregar pagos programados para ventas HELD (próximos pagos)
  const heldSales = sales.filter(s => s.status === 'HELD');
  heldSales.forEach((sale, i) => {
    const scheduledDate = new Date(sale.holdEndAt);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    
    payments.push({
      id: `vpay-sched-${String(i + 1).padStart(3, '0')}`,
      vendorId: sale.vendorId,
      saleId: sale.id,
      serviceId: sale.serviceId,
      amountCOP: sale.sellerCommissionAmount,
      grossAmount: sale.grossAmount,
      mensualistaFee: sale.mensualistaFeeAmount,
      providerNet: sale.providerNetAmount,
      status: 'programado',
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      clientName: sale.clientName
    });
  });
  
  return payments.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
}

export const vendorPayments: VendorPayment[] = generateVendorPayments();

// Legacy export
export const vendorPayouts: VendorPayout[] = vendorPayments.map(p => ({
  id: p.id,
  vendorId: p.vendorId,
  amountCOP: p.amountCOP,
  status: p.status === 'programado' ? 'pendiente' : p.status,
  createdAt: p.scheduledDate,
  processedAt: p.processedAt,
  referenceId: p.referenceId
}));

// =============================================================================
// PAGOS AUTOMÁTICOS A EMPRESAS - derivados de ventas RELEASED
// =============================================================================

function generateCompanyPayments(): CompanyPayment[] {
  const payments: CompanyPayment[] = [];
  
  // Cada venta RELEASED genera un pago a la empresa (su neto)
  const releasedSales = sales.filter(s => s.status === 'RELEASED');
  
  releasedSales.forEach((sale, i) => {
    const scheduledDate = new Date(sale.releasedAt || sale.holdEndAt);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    
    let status: CompanyPayment['status'];
    if (Math.random() < 0.03) {
      status = 'falló';
    } else {
      status = 'enviado';
    }
    
    payments.push({
      id: `cpay-${String(i + 1).padStart(3, '0')}`,
      companyId: sale.companyId,
      saleId: sale.id,
      serviceId: sale.serviceId,
      vendorId: sale.vendorId,
      amountCOP: sale.providerNetAmount,
      grossAmount: sale.grossAmount,
      vendorCommission: sale.sellerCommissionAmount,
      mensualistaFee: sale.mensualistaFeeAmount,
      status,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      processedAt: status === 'enviado' ? scheduledDate.toISOString().split('T')[0] : undefined,
      referenceId: status === 'enviado' ? `REF-C-${sale.id}` : undefined,
      failureReason: status === 'falló' ? 'Error en transferencia bancaria' : undefined,
      clientName: sale.clientName
    });
  });
  
  // Agregar pagos programados para ventas HELD
  const heldSales = sales.filter(s => s.status === 'HELD');
  heldSales.forEach((sale, i) => {
    const scheduledDate = new Date(sale.holdEndAt);
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    
    payments.push({
      id: `cpay-sched-${String(i + 1).padStart(3, '0')}`,
      companyId: sale.companyId,
      saleId: sale.id,
      serviceId: sale.serviceId,
      vendorId: sale.vendorId,
      amountCOP: sale.providerNetAmount,
      grossAmount: sale.grossAmount,
      vendorCommission: sale.sellerCommissionAmount,
      mensualistaFee: sale.mensualistaFeeAmount,
      status: 'programado',
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      clientName: sale.clientName
    });
  });
  
  return payments.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
}

export const companyPayments: CompanyPayment[] = generateCompanyPayments();

// Legacy export
export const companyPayouts: CompanyPayout[] = companyPayments.map(p => ({
  id: p.id,
  companyId: p.companyId,
  amountCOP: p.amountCOP,
  status: p.status === 'programado' ? 'pendiente' : p.status,
  createdAt: p.scheduledDate,
  processedAt: p.processedAt,
  referenceId: p.referenceId
}));

// =============================================================================
// REFUND REQUESTS
// =============================================================================

export const refundRequests: RefundRequest[] = [
  { id: 'refund-v1-001', saleId: 'sale-v1-028', vendorId: 'vendor-001', companyId: 'company-001', serviceId: 'service-002', reason: 'Cliente no quedó satisfecho', createdAt: '2025-01-10', status: 'automático', decisionBy: 'sistema', decidedAt: '2025-01-10' },
  { id: 'refund-v1-002', saleId: 'sale-v1-029', vendorId: 'vendor-001', companyId: 'company-001', serviceId: 'service-001', reason: 'El cliente cambió de proveedor', createdAt: '2025-01-12', status: 'aprobado', decisionBy: 'empresa', decidedAt: '2025-01-14' },
  { id: 'refund-v1-003', saleId: 'sale-v1-030', vendorId: 'vendor-001', companyId: 'company-001', serviceId: 'service-020', reason: 'Error en la compra', createdAt: '2025-01-14', status: 'aprobado', decisionBy: 'empresa', decidedAt: '2025-01-15' },
  { id: 'refund-002', saleId: 'sale-068', vendorId: 'vendor-002', companyId: 'company-002', serviceId: 'service-003', reason: 'No le gustó el servicio', createdAt: '2025-01-05', status: 'aprobado', decisionBy: 'empresa', decidedAt: '2025-01-06' },
  { id: 'refund-003', saleId: 'sale-069', vendorId: 'vendor-003', companyId: 'company-003', serviceId: 'service-005', reason: 'Problema técnico', createdAt: '2025-01-03', status: 'automático', decisionBy: 'sistema', decidedAt: '2025-01-03' },
  { id: 'refund-004', saleId: 'sale-070', vendorId: 'vendor-004', companyId: 'company-004', serviceId: 'service-007', reason: 'Cliente duplicó compra', createdAt: '2025-01-08', status: 'aprobado', decisionBy: 'empresa', decidedAt: '2025-01-09' }
];

// =============================================================================
// TRAINING PROGRESS (Vendedor declara completado)
// =============================================================================

export const trainingProgress: TrainingProgress[] = [
  // Vendor-001 completó varios servicios de Poliza.ai
  { id: 'tp-001', vendorId: 'vendor-001', serviceId: 'service-001', status: 'declared_completed', lastAccessedAt: '2024-12-01', completedAt: '2024-12-01' },
  { id: 'tp-002', vendorId: 'vendor-001', serviceId: 'service-002', status: 'declared_completed', lastAccessedAt: '2024-12-05', completedAt: '2024-12-05' },
  { id: 'tp-003', vendorId: 'vendor-001', serviceId: 'service-020', status: 'declared_completed', lastAccessedAt: '2024-12-10', completedAt: '2024-12-10' },
  // Capacitaciones en progreso para vendor-001
  { id: 'tp-004', vendorId: 'vendor-001', serviceId: 'service-003', status: 'in_progress', lastAccessedAt: '2025-01-15' },
  { id: 'tp-005', vendorId: 'vendor-001', serviceId: 'service-005', status: 'in_progress', lastAccessedAt: '2025-01-14' },
  { id: 'tp-006', vendorId: 'vendor-001', serviceId: 'service-007', status: 'not_started', lastAccessedAt: '2025-01-10' },
  { id: 'tp-007', vendorId: 'vendor-001', serviceId: 'service-009', status: 'not_started', lastAccessedAt: '2025-01-08' },
  // Otros vendedores
  { id: 'tp-008', vendorId: 'vendor-002', serviceId: 'service-003', status: 'declared_completed', lastAccessedAt: '2024-11-20', completedAt: '2024-11-20' },
  { id: 'tp-009', vendorId: 'vendor-002', serviceId: 'service-005', status: 'in_progress', lastAccessedAt: '2025-01-12' },
  { id: 'tp-010', vendorId: 'vendor-003', serviceId: 'service-007', status: 'declared_completed', lastAccessedAt: '2024-12-15', completedAt: '2024-12-15' },
  { id: 'tp-011', vendorId: 'vendor-003', serviceId: 'service-009', status: 'in_progress', lastAccessedAt: '2025-01-16' },
  { id: 'tp-012', vendorId: 'vendor-004', serviceId: 'service-011', status: 'declared_completed', lastAccessedAt: '2024-11-25', completedAt: '2024-11-25' },
  { id: 'tp-013', vendorId: 'vendor-005', serviceId: 'service-013', status: 'declared_completed', lastAccessedAt: '2024-12-20', completedAt: '2024-12-20' },
  { id: 'tp-014', vendorId: 'vendor-006', serviceId: 'service-015', status: 'in_progress', lastAccessedAt: '2025-01-14' }
];

// =============================================================================
// SUBSCRIPTIONS (Active)
// =============================================================================

export const subscriptions: Subscription[] = sales
  .filter(s => s.status !== 'REFUNDED' && s.isSubscription && s.subscriptionActive)
  .slice(0, 40)
  .map((sale, i) => {
    const startDate = new Date(sale.createdAt);
    const nextPayment = new Date(startDate);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    const daysActive = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: `sub-${String(i + 1).padStart(3, '0')}`,
      saleId: sale.id,
      vendorId: sale.vendorId,
      serviceId: sale.serviceId,
      clientName: sale.clientName,
      clientEmail: sale.clientEmail,
      status: 'active' as const,
      startDate: sale.createdAt,
      nextPaymentDate: nextPayment.toISOString().split('T')[0],
      monthlyCommissionCOP: sale.sellerCommissionAmount,
      daysActive
    };
  });

// =============================================================================
// TRAININGS
// =============================================================================

export const trainings: Training[] = services
  .filter(s => s.requiresTraining)
  .map((service, i) => ({
    id: `training-${String(i + 1).padStart(3, '0')}`,
    serviceId: service.id,
    companyId: service.companyId,
    type: service.trainingType || 'pdf',
    assetUrl: service.trainingUrl || '',
    durationMinutes: service.trainingType === 'video' ? 45 : 20,
    status: 'active' as const,
    createdAt: service.createdAt
  }));

// =============================================================================
// SUPPORT TICKETS
// =============================================================================

export const supportTickets: SupportTicket[] = [
  { id: 'ticket-001', createdByRole: 'vendor', createdById: 'vendor-001', relatedTransactionId: 'sale-v1-005', subject: 'Problema con pago de comisión', message: 'No he recibido la comisión de esta venta', status: 'open', createdAt: '2025-01-20' },
  { id: 'ticket-002', createdByRole: 'company', createdById: 'company-001', relatedServiceId: 'service-001', subject: 'Actualizar materiales de venta', message: 'Necesito actualizar el PDF de guión de venta', status: 'pending', createdAt: '2025-01-19' },
];

// =============================================================================
// CHART DATA
// =============================================================================

const today = new Date();
export const weeklyGMV = Array.from({ length: 12 }, (_, i) => {
  const weekDate = new Date(today);
  weekDate.setDate(weekDate.getDate() - (11 - i) * 7);
  return {
    week: `Sem ${i + 1}`,
    gmv: 15000000 + Math.floor(Math.random() * 25000000)
  };
});

export const salesByCategory = [
  { category: 'IA Seguros', sales: 42 },
  { category: 'IA Legal', sales: 35 },
  { category: 'IA Marketing', sales: 48 },
  { category: 'IA Ventas', sales: 55 },
  { category: 'IA Atención', sales: 62 },
  { category: 'IA Contabilidad', sales: 28 },
  { category: 'IA RRHH', sales: 24 },
  { category: 'IA Ciberseguridad', sales: 18 }
];

export const salesStatusDistribution = [
  { status: 'Liberadas', value: 63, fill: 'hsl(142, 76%, 36%)' },
  { status: 'En retención', value: 29, fill: 'hsl(45, 93%, 47%)' },
  { status: 'Devueltas', value: 8, fill: 'hsl(0, 84%, 60%)' }
];

// =============================================================================
// HELPER FUNCTIONS FOR DATA ACCESS
// =============================================================================

export function getServiceById(id: string): Service | undefined {
  return services.find(s => s.id === id);
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find(c => c.id === id);
}

export function getVendorById(id: string): User | undefined {
  return vendors.find(v => v.id === id);
}

export function getAllUsers(): User[] {
  return [adminUser, ...companyUsers, ...vendors];
}

export function getCompanySales(companyId: string): Sale[] {
  return sales.filter(s => s.companyId === companyId);
}

export function getCompanyServices(companyId: string): Service[] {
  return services.filter(s => s.companyId === companyId);
}

export function getCompanyServiceRequests(companyId: string): ServiceRequest[] {
  return serviceRequests.filter(r => r.companyId === companyId);
}

export function getCompanyVendors(companyId: string): User[] {
  const vendorIds = new Set(sales.filter(s => s.companyId === companyId).map(s => s.vendorId));
  return vendors.filter(v => vendorIds.has(v.id));
}

// =============================================================================
// KPI CALCULATION HELPERS
// =============================================================================

export function calculateVendorKPIs(vendorId: string) {
  const vendorSales = sales.filter(s => s.vendorId === vendorId);
  
  return {
    heldCount: vendorSales.filter(s => s.status === 'HELD').length,
    releasedCount: vendorSales.filter(s => s.status === 'RELEASED').length,
    refundedCount: vendorSales.filter(s => s.status === 'REFUNDED').length,
    heldGross: vendorSales.filter(s => s.status === 'HELD').reduce((sum, s) => sum + s.grossAmount, 0),
    releasedGross: vendorSales.filter(s => s.status === 'RELEASED').reduce((sum, s) => sum + s.grossAmount, 0),
    refundedGross: vendorSales.filter(s => s.status === 'REFUNDED').reduce((sum, s) => sum + s.grossAmount, 0),
    commissionHeld: vendorSales.filter(s => s.status === 'HELD').reduce((sum, s) => sum + s.sellerCommissionAmount, 0),
    commissionReleased: vendorSales.filter(s => s.status === 'RELEASED').reduce((sum, s) => sum + s.sellerCommissionAmount, 0),
    commissionRefunded: vendorSales.filter(s => s.status === 'REFUNDED').reduce((sum, s) => sum + s.sellerCommissionAmount, 0),
    activeSubscriptions: vendorSales.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length
  };
}

export function calculateCompanyKPIs(companyId: string) {
  const companySales = sales.filter(s => s.companyId === companyId);
  
  return {
    heldCount: companySales.filter(s => s.status === 'HELD').length,
    releasedCount: companySales.filter(s => s.status === 'RELEASED').length,
    refundedCount: companySales.filter(s => s.status === 'REFUNDED').length,
    heldGross: companySales.filter(s => s.status === 'HELD').reduce((sum, s) => sum + s.grossAmount, 0),
    releasedGross: companySales.filter(s => s.status === 'RELEASED').reduce((sum, s) => sum + s.grossAmount, 0),
    refundedGross: companySales.filter(s => s.status === 'REFUNDED').reduce((sum, s) => sum + s.grossAmount, 0),
    providerHeld: companySales.filter(s => s.status === 'HELD').reduce((sum, s) => sum + s.providerNetAmount, 0),
    providerReleased: companySales.filter(s => s.status === 'RELEASED').reduce((sum, s) => sum + s.providerNetAmount, 0),
    activeSubscriptions: companySales.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length
  };
}

export function calculateAdminKPIs() {
  return {
    totalTransactions: sales.length,
    heldCount: sales.filter(s => s.status === 'HELD').length,
    releasedCount: sales.filter(s => s.status === 'RELEASED').length,
    refundedCount: sales.filter(s => s.status === 'REFUNDED').length,
    feeHeld: sales.filter(s => s.status === 'HELD').reduce((sum, s) => sum + s.mensualistaFeeAmount, 0),
    feeReleased: sales.filter(s => s.status === 'RELEASED').reduce((sum, s) => sum + s.mensualistaFeeAmount, 0),
    feeRefunded: sales.filter(s => s.status === 'REFUNDED').reduce((sum, s) => sum + s.mensualistaFeeAmount, 0),
    totalActiveSubscriptions: sales.filter(s => s.isSubscription && s.subscriptionActive && s.status !== 'REFUNDED').length
  };
}
