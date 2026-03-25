// Training content modules for each service
// Structured like NotebookLM: chapters with content blocks

export interface TrainingChapter {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz';
  content: string;
  videoUrl?: string;
  keyPoints?: string[];
}

export interface TrainingContent {
  serviceId: string;
  title: string;
  overview: string;
  totalDuration: string;
  chapters: TrainingChapter[];
  salesTips: string[];
  commonMistakes: string[];
}

export const trainingContents: Record<string, TrainingContent> = {
  'service-001': {
    serviceId: 'service-001',
    title: 'Cómo vender Poliza Cotizador IA',
    overview: 'Aprende a presentar, demostrar y cerrar ventas del cotizador de seguros con IA. Este curso te dará todas las herramientas para convertirte en un vendedor experto del producto.',
    totalDuration: '12 min',
    chapters: [
      {
        id: 'ch-1',
        title: 'Qué es Poliza Cotizador IA',
        duration: '3 min',
        type: 'video',
        content: 'Poliza Cotizador IA es una herramienta que permite a los corredores de seguros generar cotizaciones en segundos. Analiza el perfil del cliente, compara entre 15+ aseguradoras y genera un PDF profesional listo para enviar.\n\nEl producto resuelve un problema real: los corredores pierden hasta 5 horas diarias cotizando manualmente. Con esta herramienta, ese tiempo se reduce a segundos.\n\nPuntos clave para recordar:\n- Funciona con todas las aseguradoras principales de Colombia\n- No requiere instalación, funciona desde el navegador\n- Incluye CRM para seguimiento de clientes\n- Tiene alertas automáticas de renovación',
        videoUrl: 'https://example.com/poliza-intro',
        keyPoints: [
          'Cotización en 30 segundos vs 30 minutos manual',
          '15+ aseguradoras integradas',
          'PDF profesional automático',
          'CRM incluido sin costo extra'
        ]
      },
      {
        id: 'ch-2',
        title: 'A quién venderle',
        duration: '2 min',
        type: 'text',
        content: 'El cliente ideal es un corredor de seguros que:\n\n1. Maneja más de 5 clientes al mes\n2. Trabaja con múltiples aseguradoras\n3. Usa Excel o papel para cotizar\n4. Quiere escalar sin contratar más personal\n\nSeñales de que un prospecto es bueno:\n- Se queja del tiempo que le toma cotizar\n- Pierde ventas por no responder rápido\n- Ya ha probado otras herramientas pero no le funcionaron\n- Trabaja solo o con un equipo pequeño\n\nNo pierdas tiempo con:\n- Corredores que solo manejan 1-2 aseguradoras\n- Empresas grandes con sistemas propios integrados\n- Personas que no son corredores certificados',
        keyPoints: [
          'Corredor con 5+ clientes/mes',
          'Usa Excel o papel actualmente',
          'Quiere escalar sin más personal',
          'Evitar empresas con sistemas propios'
        ]
      },
      {
        id: 'ch-3',
        title: 'Cómo hacer la demo',
        duration: '4 min',
        type: 'video',
        content: 'La demo es el momento más importante de la venta. Sigue estos pasos:\n\n1. Pregunta qué tipo de seguro cotiza más (vida, auto, hogar)\n2. Pide un caso real (sin datos sensibles) para cotizar en vivo\n3. Muestra cómo en 30 segundos tienes la cotización lista\n4. Compara con el proceso manual que ellos usan\n5. Muestra el PDF que se genera automáticamente\n6. Enseña el CRM y las alertas de renovación\n\nTips para una demo exitosa:\n- Usa datos reales del prospecto, no genéricos\n- Deja que ellos interactúen con la herramienta\n- Muestra el antes y después del tiempo\n- Cierra preguntando: "¿Cuántas horas te ahorrarías por semana?"',
        videoUrl: 'https://example.com/poliza-demo',
        keyPoints: [
          'Usar caso real del prospecto',
          'Dejar que interactúen',
          'Mostrar antes vs después',
          'Cerrar con pregunta de ahorro de tiempo'
        ]
      },
      {
        id: 'ch-4',
        title: 'Manejo de objeciones',
        duration: '3 min',
        type: 'text',
        content: 'Las objeciones más comunes y cómo responder:\n\n"Es muy caro"\n→ "¿Cuánto vale una hora de tu tiempo? Si ahorras 5 horas por semana, son 20 horas al mes. A $50.000/hora, estás ahorrando $1.000.000 mensuales por una inversión de $179.000."\n\n"Ya tengo mi método"\n→ "Entiendo, ¿pero cuántos clientes podrías atender si cotizaras en 30 segundos en vez de 30 minutos? La herramienta no reemplaza tu método, lo potencia."\n\n"No soy bueno con tecnología"\n→ "La entrenamiento dura 12 minutos y la interfaz es tan simple como WhatsApp. Además tienes soporte 24/7 por WhatsApp."\n\n"Necesito pensarlo"\n→ "Claro, ¿qué información necesitas para tomar la decisión? Recuerda que tienes 14 días de garantía, así que puedes probarlo sin riesgo."',
        keyPoints: [
          'Responder con ROI concreto',
          'Garantía de 14 días como respaldo',
          'Soporte 24/7 por WhatsApp',
          'Nunca presionar, informar'
        ]
      }
    ],
    salesTips: [
      'Siempre pide un caso real para cotizar en la demo',
      'Menciona la garantía de 14 días al inicio, no al final',
      'Usa números concretos: "5 horas ahorradas por semana"',
      'Haz seguimiento a las 48 horas si no cierra en la primera llamada',
      'Ofrece ayuda para la primera cotización real después de la compra'
    ],
    commonMistakes: [
      'No hacer demo en vivo (solo enviar PDF)',
      'Hablar de características en vez de beneficios',
      'No calificar al prospecto antes de la demo',
      'Olvidar mencionar el soporte 24/7',
      'No hacer seguimiento post-demo'
    ]
  }
};

// Generate default training content for services without explicit content
import { services } from './mockData';

services.forEach(service => {
  if (!trainingContents[service.id]) {
    trainingContents[service.id] = {
      serviceId: service.id,
      title: `Cómo vender ${service.name}`,
      overview: `Aprende todo lo necesario para vender ${service.name} de forma efectiva. Este curso cubre el producto, el cliente ideal, la demo y el manejo de objeciones.`,
      totalDuration: '15 min',
      chapters: [
        {
          id: `${service.id}-ch-1`,
          title: `Qué es ${service.name}`,
          duration: '4 min',
          type: service.trainingType === 'video' ? 'video' : 'text',
          content: `${service.description}\n\nEste producto está diseñado para resolver problemas reales de las empresas. Su precio de ${new Intl.NumberFormat('es-CO').format(service.priceCOP)} COP refleja el valor que entrega.\n\nComo vendedor, tu comisión es del ${service.vendorCommissionPct}%, lo que significa ${new Intl.NumberFormat('es-CO').format(Math.round(service.priceCOP * service.vendorCommissionPct / 100))} COP por cada venta.\n\nPuntos clave:\n- Resuelve un problema real y medible\n- Fácil de configurar y usar\n- Soporte incluido\n- Resultados desde el primer mes`,
          videoUrl: service.trainingUrl,
          keyPoints: [
            'Producto con valor demostrable',
            `Comisión: ${service.vendorCommissionPct}% por venta`,
            'Fácil configuración',
            'Soporte incluido'
          ]
        },
        {
          id: `${service.id}-ch-2`,
          title: 'Perfil del cliente ideal',
          duration: '3 min',
          type: 'text',
          content: 'El cliente ideal para este producto es una empresa o profesional que:\n\n1. Tiene procesos manuales que quiere automatizar\n2. Busca herramientas de IA para ser más productivo\n3. Tiene presupuesto mensual para tecnología\n4. Toma decisiones rápidas\n\nPreguntas de calificación:\n- ¿Cuánto tiempo dedicas a este proceso actualmente?\n- ¿Cuántas personas trabajan en esto?\n- ¿Has probado otras herramientas?\n- ¿Cuál es tu presupuesto mensual para tecnología?',
          keyPoints: [
            'Empresa con procesos manuales',
            'Presupuesto para tecnología',
            'Calificar antes de hacer demo',
            'Preguntar sobre herramientas actuales'
          ]
        },
        {
          id: `${service.id}-ch-3`,
          title: 'Cómo presentar y cerrar',
          duration: '5 min',
          type: service.trainingType === 'video' ? 'video' : 'text',
          content: `Estructura de la presentación:\n\n1. Identifica el dolor del cliente (2 min)\n2. Presenta la solución (3 min)\n3. Demo en vivo con su caso (5 min)\n4. Muestra el precio y ROI (2 min)\n5. Cierra con la garantía de ${service.refundPolicy.refundWindowDays} días\n\nFrases de cierre efectivas:\n- "¿Te gustaría probarlo con tu equipo esta semana?"\n- "Con la garantía de ${service.refundPolicy.refundWindowDays} días, no hay riesgo"\n- "¿Qué necesitas para tomar la decisión hoy?"`,
          videoUrl: service.trainingUrl,
          keyPoints: [
            'Identificar dolor antes de presentar',
            'Demo con caso real del cliente',
            'Mostrar ROI concreto',
            `Garantía de ${service.refundPolicy.refundWindowDays} días`
          ]
        },
        {
          id: `${service.id}-ch-4`,
          title: 'Objeciones frecuentes',
          duration: '3 min',
          type: 'text',
          content: '"Es muy caro"\n→ Compara el precio con el costo de hacer el proceso manualmente. Muestra cuánto ahorra en tiempo y dinero.\n\n"Ya tengo otra herramienta"\n→ Pregunta qué no les gusta de su herramienta actual. Muestra las ventajas diferenciales.\n\n"Necesito pensarlo"\n→ Respeta su tiempo, pero ofrece agendar una segunda llamada. Envía un resumen por email.\n\n"No confío en la IA"\n→ Muestra casos de éxito reales. Ofrece la garantía como respaldo.',
          keyPoints: [
            'Siempre responder con datos',
            'No presionar, informar',
            'Usar garantía como respaldo',
            'Hacer seguimiento a las 48h'
          ]
        }
      ],
      salesTips: [
        'Califica al prospecto antes de hacer la demo',
        'Usa casos de éxito reales al presentar',
        'Menciona la garantía al inicio de la conversación',
        'Haz seguimiento post-demo a las 48 horas',
        'Ofrece ayuda con la primera configuración'
      ],
      commonMistakes: [
        'No hacer demo en vivo',
        'Hablar demasiado de características técnicas',
        'No calificar al prospecto',
        'Olvidar hacer seguimiento',
        'No usar la garantía como herramienta de cierre'
      ]
    };
  }
});

export default trainingContents;
