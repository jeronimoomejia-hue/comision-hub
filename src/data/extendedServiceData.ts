// Extended service details data for the modal
// This provides all the detailed information for each service

import { services } from './mockData';

interface ExtendedDetails {
  shortDescription: string;
  targetAudience: string;
  problemSolved: string;
  promisedResult: string;
  features: string[];
  notIncluded: string[];
  activationTime: string;
  guarantee: string;
  pitchOneLine: string;
  pitchThreeLines: string;
  objections: { objection: string; response: string }[];
  idealClient: string;
  useCases: string[];
  qualificationQuestions: string[];
  trainingDurationMinutes: number;
  refundPolicy: {
    acceptedReasons: string[];
    policyText: string;
  };
  countries: string[];
  restrictions: string;
  clientRequirements: string[];
  termsHighlights: string;
  slaSupport: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string;
  websiteUrl: string;
  demoUrl: string;
  supportHours: string;
}

// Generate extended details for each service
export const extendedServiceDetails: Record<string, ExtendedDetails> = {
  'service-001': {
    shortDescription: 'IA que genera cotizaciones de seguros en segundos analizando el perfil del cliente automáticamente.',
    targetAudience: 'Corredores de seguros, agencias de seguros, asesores independientes en Colombia.',
    problemSolved: 'Los corredores pierden horas calculando cotizaciones manualmente y comparando entre aseguradoras.',
    promisedResult: 'Reduce el tiempo de cotización de 30 minutos a 30 segundos, aumentando las ventas un 40%.',
    features: [
      'Cotizaciones instantáneas de 15+ aseguradoras',
      'Comparador automático de precios y coberturas',
      'Generación de PDF profesional para el cliente',
      'CRM integrado para seguimiento de leads',
      'Alertas de renovación automáticas',
      'Soporte por WhatsApp 24/7'
    ],
    notIncluded: [
      'Emisión directa de pólizas (requiere plan Pro)',
      'Integración con sistemas legacy personalizados',
      'Entrenamiento presencial (solo virtual)'
    ],
    activationTime: '24 horas después de completar la entrenamiento',
    guarantee: 'Garantía de satisfacción de 14 días o te devolvemos el dinero',
    pitchOneLine: 'Cotiza seguros en 30 segundos con IA, no en 30 minutos.',
    pitchThreeLines: '¿Sabías que los corredores de seguros pierden hasta 5 horas diarias cotizando manualmente? Poliza Cotizador IA reduce ese tiempo a segundos, permitiéndote atender más clientes y cerrar más ventas. Nuestros usuarios reportan un aumento del 40% en conversiones.',
    objections: [
      { objection: '¿Funciona con todas las aseguradoras?', response: 'Sí, tenemos integradas las 15 principales aseguradoras de Colombia.' },
      { objection: '¿Es difícil de aprender?', response: 'No, la entrenamiento dura solo 12 minutos y la plataforma es muy intuitiva.' },
      { objection: '¿Qué pasa si el cliente quiere cambios en la cotización?', response: 'Puedes ajustar cualquier parámetro y regenerar la cotización instantáneamente.' },
      { objection: '¿Tiene soporte?', response: 'Sí, soporte 24/7 por WhatsApp con respuesta en menos de 10 minutos.' },
      { objection: '¿Puedo probarlo antes?', response: 'Tienes 14 días de garantía. Si no te funciona, te devolvemos el dinero.' }
    ],
    idealClient: 'Corredor de seguros con mínimo 5 clientes mensuales, que quiere escalar sin contratar más personal.',
    useCases: [
      'Cotizar seguros de vida en segundos durante una llamada con el cliente',
      'Comparar precios de SOAT automáticamente',
      'Generar propuestas profesionales para empresas'
    ],
    qualificationQuestions: [
      '¿Cuántas cotizaciones de seguros haces por semana?',
      '¿Cuánto tiempo te toma hacer una cotización completa?',
      '¿Con cuántas aseguradoras trabajas actualmente?',
      '¿Tienes algún sistema de CRM o usas Excel?',
      '¿Quién toma la decisión de herramientas en tu agencia?'
    ],
    trainingDurationMinutes: 12,
    refundPolicy: {
      acceptedReasons: ['No cumple expectativas', 'Dificultad técnica', 'No compatible con mis aseguradoras'],
      policyText: 'Devolución sujeta a aprobación. Debes demostrar que completaste la entrenamiento e intentaste usar la herramienta.'
    },
    countries: ['CO'],
    restrictions: 'Solo para corredores de seguros con licencia vigente en Colombia.',
    clientRequirements: ['Tener licencia de corredor de seguros', 'Acceso a internet estable', 'Computador o tablet'],
    termsHighlights: 'El producto se renueva automáticamente cada mes. Puedes cancelar en cualquier momento sin penalidad.',
    slaSupport: 'Respuesta en WhatsApp: máximo 10 minutos. Tickets: 24 horas hábiles.',
    contactName: 'María González',
    contactEmail: 'maria@poliza.ai',
    contactWhatsApp: '+57 300 123 4567',
    websiteUrl: 'www.poliza.ai',
    demoUrl: 'demo.poliza.ai',
    supportHours: 'Lun-Vie 7:00-21:00, Sáb 8:00-14:00 (hora Colombia)'
  },
  'service-002': {
    shortDescription: 'Plataforma de IA que automatiza la revisión de contratos legales, identificando riesgos y cláusulas problemáticas.',
    targetAudience: 'Abogados independientes, estudios jurídicos pequeños, áreas legales de empresas en Colombia.',
    problemSolved: 'Los abogados gastan el 60% de su tiempo revisando contratos manualmente, buscando cláusulas de riesgo.',
    promisedResult: 'Reduce el tiempo de revisión de contratos de 2 horas a 5 minutos, con 98% de precisión.',
    features: [
      'Análisis automático de contratos en español',
      'Detección de cláusulas de riesgo',
      'Sugerencias de mejora con lenguaje legal',
      'Comparación con contratos modelo',
      'Historial de versiones y cambios',
      'Integración con Google Drive y OneDrive'
    ],
    notIncluded: [
      'Redacción de contratos desde cero (solo revisión)',
      'Asesoría legal personalizada',
      'Representación legal'
    ],
    activationTime: '12 horas después de completar la entrenamiento',
    guarantee: 'Prueba gratis de 7 días con acceso completo',
    pitchOneLine: 'Revisa contratos en 5 minutos con IA, no en 2 horas.',
    pitchThreeLines: '¿Cuántas horas a la semana pierdes revisando contratos? LexIA analiza documentos legales con IA, identificando riesgos y cláusulas problemáticas en minutos. Nuestros clientes ahorran 15 horas semanales en revisión de contratos.',
    objections: [
      { objection: '¿Es seguro subir contratos confidenciales?', response: 'Absolutamente. Usamos encriptación de grado bancario y no almacenamos los documentos.' },
      { objection: '¿Funciona con contratos en español colombiano?', response: 'Sí, está entrenado específicamente con legislación colombiana.' },
      { objection: '¿Reemplaza al abogado?', response: 'No, es una herramienta que potencia al abogado, ahorrándole tiempo en tareas repetitivas.' },
      { objection: '¿Qué tipo de contratos analiza?', response: 'Laborales, comerciales, arrendamiento, prestación de productos, y más.' },
      { objection: '¿Tiene algún límite de documentos?', response: 'El plan incluye hasta 50 análisis mensuales, suficiente para la mayoría.' }
    ],
    idealClient: 'Abogado o estudio jurídico que revisa más de 10 contratos al mes y quiere optimizar su tiempo.',
    useCases: [
      'Revisar contratos laborales antes de firma',
      'Analizar contratos de arrendamiento comercial',
      'Comparar propuestas de contratos de proveedores'
    ],
    qualificationQuestions: [
      '¿Cuántos contratos revisas en promedio por semana?',
      '¿Cuánto tiempo te toma revisar un contrato típico?',
      '¿Qué tipo de contratos manejas con más frecuencia?',
      '¿Tienes algún software legal actualmente?',
      '¿Trabajas solo o tienes equipo?'
    ],
    trainingDurationMinutes: 15,
    refundPolicy: {
      acceptedReasons: ['No cumple expectativas', 'Dificultad técnica', 'No compatible con mi práctica legal'],
      policyText: 'Devolución automática dentro de los primeros 14 días, sin preguntas.'
    },
    countries: ['CO', 'MX', 'PE'],
    restrictions: 'El análisis se basa en legislación colombiana, mexicana y peruana únicamente.',
    clientRequirements: ['Ser profesional del derecho o área legal', 'Conexión a internet', 'Navegador actualizado'],
    termsHighlights: 'LexIA es una herramienta de apoyo, no reemplaza el criterio profesional del abogado.',
    slaSupport: 'Soporte prioritario por chat: respuesta en 1 hora. Email: 12 horas hábiles.',
    contactName: 'Roberto Mejía',
    contactEmail: 'roberto@lexia.co',
    contactWhatsApp: '+57 301 234 5678',
    websiteUrl: 'www.lexia.co',
    demoUrl: 'app.lexia.co/demo',
    supportHours: 'Lun-Vie 8:00-20:00 (hora Colombia)'
  }
};

// Generate default details for services that don't have explicit extended details
services.forEach(service => {
  if (!extendedServiceDetails[service.id]) {
    extendedServiceDetails[service.id] = {
      shortDescription: service.description,
      targetAudience: 'Empresas y profesionales en Colombia que buscan automatizar procesos.',
      problemSolved: 'Procesos manuales lentos y propensos a errores que consumen tiempo valioso.',
      promisedResult: 'Ahorro significativo de tiempo y aumento en productividad del equipo.',
      features: [
        'Acceso completo a todas las funcionalidades',
        'Soporte técnico por WhatsApp',
        'Actualizaciones automáticas incluidas',
        'Panel de administración intuitivo',
        'Reportes y métricas en tiempo real',
        'Integraciones con herramientas populares'
      ],
      notIncluded: [
        'Personalización de interfaz',
        'Entrenamiento presencial',
        'Desarrollo de funcionalidades a medida'
      ],
      activationTime: '24-48 horas',
      guarantee: 'Garantía de satisfacción de 14 días',
      pitchOneLine: `${service.name} automatiza y optimiza tu trabajo diario.`,
      pitchThreeLines: `¿Sabías que puedes ahorrar horas cada semana automatizando tareas repetitivas? ${service.name} usa inteligencia artificial para hacer el trabajo pesado por ti. Nuestros clientes reportan hasta un 50% de ahorro en tiempo.`,
      objections: [
        { objection: '¿Es difícil de usar?', response: 'No, la interfaz es muy intuitiva y la entrenamiento dura menos de 15 minutos.' },
        { objection: '¿Funciona para mi tipo de negocio?', response: 'Sí, tenemos clientes en múltiples industrias con excelentes resultados.' },
        { objection: '¿Qué pasa si no me gusta?', response: 'Tienes 14 días de garantía para probarlo sin riesgo.' },
        { objection: '¿Tiene soporte en español?', response: 'Absolutamente, todo el soporte es en español por WhatsApp.' },
        { objection: '¿Puedo cancelar cuando quiera?', response: 'Sí, sin penalidades ni preguntas.' }
      ],
      idealClient: 'Empresas pequeñas y medianas en Colombia que buscan modernizar sus procesos.',
      useCases: [
        'Automatizar tareas repetitivas',
        'Mejorar la atención al cliente',
        'Generar reportes automáticos'
      ],
      qualificationQuestions: [
        '¿Cuántas horas dedicas a esta tarea actualmente?',
        '¿Cuántas personas trabajan en este proceso?',
        '¿Tienes alguna herramienta actualmente?',
        '¿Cuál es tu presupuesto mensual para tecnología?',
        '¿Quién toma las decisiones de compra?'
      ],
      trainingDurationMinutes: 15,
      refundPolicy: {
        acceptedReasons: ['No cumple expectativas', 'Dificultad técnica', 'Cambio de necesidades'],
        policyText: 'Devolución sujeta a las políticas de la empresa proveedora.'
      },
      countries: ['CO'],
      restrictions: 'Producto disponible únicamente en Colombia.',
      clientRequirements: ['Empresa constituida legalmente', 'Acceso a internet', 'Equipo con navegador moderno'],
      termsHighlights: 'El producto se presta bajo los términos vigentes al momento de la compra.',
      slaSupport: 'Respuesta en máximo 24 horas hábiles por WhatsApp.',
      contactName: 'Equipo de Soporte',
      contactEmail: 'soporte@mensualista.com',
      contactWhatsApp: '+57 300 000 0000',
      websiteUrl: 'www.mensualista.com',
      demoUrl: '',
      supportHours: 'Lun-Vie 8:00-18:00 (hora Colombia)'
    };
  }
});

export default extendedServiceDetails;
