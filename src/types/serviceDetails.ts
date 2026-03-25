// Extended Service Details for Modal and Request Form
// All fields that companies must provide when requesting a new service

export interface ServiceDetails {
  // TAB 1 - RESUMEN
  name: string;
  companyId: string;
  category: string;
  type: 'suscripción' | 'puntual';
  shortDescription: string;
  targetAudience: string;
  problemSolved: string;
  promisedResult: string;
  status: 'activo' | 'pausado';

  // TAB 2 - PRECIO Y COMISIONES
  priceCOP: number;
  frequency: 'mensual' | 'único';
  vendorCommissionPct: number;
  estimatedCommissionCOP: number;
  paymentFrequency: 'semanal' | 'quincenal';

  // TAB 3 - QUÉ INCLUYE
  features: string[];
  notIncluded: string[];
  activationTime: string;
  guarantee: string;

  // TAB 4 - CÓMO SE VENDE
  pitchOneLine: string;
  pitchThreeLines: string;
  objections: { objection: string; response: string }[];
  idealClient: string;
  useCases: string[];
  qualificationQuestions: string[];

  // TAB 5 - CAPACITACIÓN Y MATERIALES
  requiresTraining: boolean;
  trainingType: 'pdf' | 'video';
  trainingUrl: string;
  trainingDurationMinutes: number;
  materials: {
    brochureUrl: string;
    salesScriptUrl: string;
    priceListUrl: string;
    faqUrl: string;
    comparisonUrl: string;
  };

  // TAB 6 - DEVOLUCIONES
  refundPolicy: {
    autoRefund: boolean;
    refundWindowDays: 7 | 14 | 30;
    acceptedReasons: string[];
    policyText: string;
  };

  // TAB 7 - REQUISITOS Y CONDICIONES
  countries: string[];
  restrictions: string;
  clientRequirements: string[];
  termsHighlights: string;
  slaSupport: string;

  // TAB 8 - EMPRESA / CONTACTO
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string;
  websiteUrl: string;
  demoUrl: string;
  supportHours: string;
}

// Categories for services
export const SERVICE_CATEGORIES = [
  'IA para Seguros',
  'IA Legal',
  'IA para Ventas',
  'IA para Marketing',
  'IA para Atención al Cliente',
  'IA para Contabilidad',
  'IA para RRHH',
  'IA para Ciberseguridad',
  'IA para Analítica / BI',
  'Automatización (sin código)'
];

// Refund accepted reasons
export const REFUND_REASONS = [
  'No cumple expectativas',
  'Dificultad técnica',
  'Cambio de necesidades',
  'Problemas de integración',
  'Producto no funciona',
  'Precio muy alto',
  'Otro motivo'
];

// Countries
export const AVAILABLE_COUNTRIES = [
  { code: 'CO', name: 'Colombia' },
  { code: 'MX', name: 'México' },
  { code: 'PE', name: 'Perú' },
  { code: 'CL', name: 'Chile' },
  { code: 'AR', name: 'Argentina' },
  { code: 'EC', name: 'Ecuador' }
];

// Default service details template
export const getDefaultServiceDetails = (): Partial<ServiceDetails> => ({
  type: 'suscripción',
  frequency: 'mensual',
  vendorCommissionPct: 20,
  paymentFrequency: 'semanal',
  requiresTraining: true,
  trainingType: 'pdf',
  trainingDurationMinutes: 15,
  countries: ['CO'],
  refundPolicy: {
    autoRefund: false,
    refundWindowDays: 14,
    acceptedReasons: ['No cumple expectativas', 'Dificultad técnica'],
    policyText: 'Devolución sujeta a aprobación de la empresa.'
  },
  features: [],
  notIncluded: [],
  objections: [],
  useCases: [],
  qualificationQuestions: [],
  clientRequirements: [],
  materials: {
    brochureUrl: '',
    salesScriptUrl: '',
    priceListUrl: '',
    faqUrl: '',
    comparisonUrl: ''
  }
});
