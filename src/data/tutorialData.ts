import type { TutorialStep } from "@/components/TutorialOverlay";

// ── VENDOR TUTORIALS ──────────────────────────────────────────────

export const vendorDashboardTutorial: TutorialStep[] = [
  {
    title: "Tu panel de control",
    description: "Aqui ves un resumen de toda tu actividad: comisiones ganadas, ventas realizadas y productos activos. Todo en tiempo real.",
  },
  {
    title: "Metricas principales",
    description: "Las tarjetas superiores muestran tus comisiones del mes, total de ventas, comisiones retenidas (en periodo de devolucion) y comisiones liberadas que ya puedes cobrar.",
  },
  {
    title: "Grafica de rendimiento",
    description: "Haz clic en 'Ver metricas detalladas' para ver tu evolucion de ventas y comisiones de los ultimos 6 meses.",
  },
  {
    title: "Productos activos",
    description: "Abajo veras los servicios que ya puedes vender. Haz clic en cualquiera para ver su detalle, registrar una venta o acceder a material de ventas.",
  },
  {
    title: "Ofertas privadas",
    description: "Si una empresa te asigna un nivel de comision mayor, aparecera aqui como oferta privada con una comision mas alta que la publica.",
  },
];

export const vendorProductsTutorial: TutorialStep[] = [
  {
    title: "Catalogo de productos",
    description: "Aqui encuentras todos los servicios disponibles para vender, organizados por categoria. Usa el buscador para encontrar uno rapidamente.",
  },
  {
    title: "Filtros por categoria",
    description: "Filtra por tipo de industria: salud, seguros, educacion, etc. Cada categoria muestra cuantos servicios tiene disponibles.",
  },
  {
    title: "Estado de capacitacion",
    description: "Cada producto muestra si ya completaste la capacitacion. Los que tienen el candado requieren que te capacites antes de poder venderlos.",
  },
  {
    title: "Detalle del producto",
    description: "Haz clic en un producto para ver su precio, comision, material de ventas, pitch y para registrar una venta directamente.",
  },
];

export const vendorPaymentsTutorial: TutorialStep[] = [
  {
    title: "Tus ventas y pagos",
    description: "Aqui se registran todas tus ventas. Cada una pasa por un flujo: Pendiente, Retenida (periodo de devolucion), Completada o Reembolsada.",
  },
  {
    title: "Registrar nueva venta",
    description: "Usa el boton 'Registrar venta' para crear una nueva transaccion. Selecciona el producto, ingresa los datos del cliente y se generara un link de pago.",
  },
  {
    title: "Estados de las ventas",
    description: "Pendiente: esperando pago. Retenida: el cliente pago pero esta en periodo de devolucion. Completada: ya puedes cobrar tu comision. Reembolsada: el cliente pidio devolucion.",
  },
  {
    title: "Cobrar comisiones",
    description: "Cambia a la vista 'Pagos' para ver el historico de pagos recibidos con su referencia bancaria y periodo correspondiente.",
  },
];

export const vendorCRMTutorial: TutorialStep[] = [
  {
    title: "Tu CRM de clientes",
    description: "Aqui gestionas todos tus prospectos y clientes en un tablero tipo Kanban. Arrastra las tarjetas entre columnas segun avancen en el proceso de venta.",
  },
  {
    title: "Etapas del prospecto",
    description: "Cada prospecto pasa por: Sin contactar, Contactado, Interesado, Negociando y Cerrado. Moverlos te ayuda a dar seguimiento eficiente.",
  },
  {
    title: "Agregar prospectos",
    description: "Usa el boton '+' para agregar un nuevo prospecto. Incluye nombre, telefono, correo y a que servicio le interesa.",
  },
  {
    title: "Seguimiento con notas",
    description: "Dentro de cada prospecto puedes agregar notas y programar fechas de seguimiento para no perder ninguna oportunidad.",
  },
];

export const vendorProfileTutorial: TutorialStep[] = [
  {
    title: "Tu perfil de vendedor",
    description: "Aqui puedes ver y editar tu informacion personal, foto de perfil y datos de contacto. Manten tu perfil actualizado para que las empresas te conozcan.",
  },
];

// ── COMPANY TUTORIALS ──────────────────────────────────────────────

export const companyDashboardTutorial: TutorialStep[] = [
  {
    title: "Panel de tu empresa",
    description: "Este es el centro de control de tu empresa. Aqui ves todas las metricas clave: ventas, suscripciones, productos activos y vendedores en tu red.",
  },
  {
    title: "KPIs principales",
    description: "Las tarjetas superiores muestran las ventas del mes, suscripciones activas, productos publicados y cantidad de vendedores que te estan vendiendo.",
  },
  {
    title: "Plan actual",
    description: "Tu badge de plan aparece arriba. Freemium permite hasta 5 productos. Premium y Enterprise desbloquean funciones avanzadas como chat, cupones y mas.",
  },
  {
    title: "Ultimas transacciones",
    description: "Abajo veras las ventas mas recientes con su estado. Haz clic en cualquiera para ver el desglose completo: monto bruto, comision del vendedor y tu ingreso neto.",
  },
  {
    title: "Grafico de ingresos",
    description: "Haz clic en 'Ver metricas detalladas' para ver la evolucion de ventas e ingresos de los ultimos 6 meses en un grafico interactivo.",
  },
];

export const companyServicesTutorial: TutorialStep[] = [
  {
    title: "Tus productos y servicios",
    description: "Aqui gestionas todos los servicios que ofreces a traves de la plataforma. Cada uno tiene su precio, comision, material de ventas y capacitacion.",
  },
  {
    title: "Crear nuevo servicio",
    description: "Usa el boton 'Nuevo servicio' para publicar un producto. Puedes crearlo manualmente o usar el asistente con IA que genera todo desde un PDF o texto descriptivo.",
  },
  {
    title: "Editar servicio existente",
    description: "Haz clic en cualquier servicio para editar su contenido, cambiar precios, comisiones, material de capacitacion, codigos de activacion y mas.",
  },
  {
    title: "Niveles de comision",
    description: "Dentro de cada servicio puedes configurar hasta 3 niveles de comision (Basico, Premium, Elite). Solo el nivel basico es publico, los otros se asignan individualmente a vendedores.",
  },
];

export const companyVendorsTutorial: TutorialStep[] = [
  {
    title: "Tu red de vendedores",
    description: "Aqui ves todos los vendedores que estan vendiendo tus servicios. Puedes ver sus metricas, nivel de comision y progreso de capacitacion.",
  },
  {
    title: "Invitar vendedores",
    description: "Usa 'Invitar' para crear un link personalizado: selecciona un servicio y un nivel de comision especifico para ese vendedor.",
  },
  {
    title: "Perfil del vendedor",
    description: "Haz clic en cualquier vendedor para ver su perfil completo: ventas realizadas, servicios capacitados, nivel de comision, historial de pagos y mas.",
  },
  {
    title: "Cambiar nivel de comision",
    description: "Dentro del perfil de un vendedor puedes subirlo o bajarlo de nivel en cada servicio para incentivarlo segun su rendimiento.",
  },
];

export const companyPaymentsTutorial: TutorialStep[] = [
  {
    title: "Ventas e ingresos",
    description: "Aqui ves todas las ventas realizadas por tu red de vendedores. Cada transaccion muestra el desglose completo: monto bruto, comision del vendedor, fee de la plataforma y tu neto.",
  },
  {
    title: "Filtrar por estado",
    description: "Usa las pestanas superiores para filtrar: Todas, Pendientes, Retenidas, Completadas y Reembolsadas. Asi identificas rapidamente lo que necesita atencion.",
  },
  {
    title: "Ver ventas por servicio",
    description: "Usa el boton 'Ver ventas por servicio' para ir a tus productos y ver cuanto vende cada uno individualmente.",
  },
];

export const companySettingsTutorial: TutorialStep[] = [
  {
    title: "Configuracion de empresa",
    description: "Aqui personalizas el perfil de tu empresa: logo, colores, informacion de contacto y canales de comunicacion preferidos.",
  },
  {
    title: "Plan y facturacion",
    description: "Revisa tu plan actual y cambia a Premium o Enterprise si necesitas mas productos, vendedores o funcionalidades avanzadas.",
  },
];
