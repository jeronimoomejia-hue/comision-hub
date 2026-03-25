

# Prompt completo para Rork — Panel del Vendedor Mensualista

Este no es un plan de implementación para Lovable. Es la generación del prompt solicitado para Rork. A continuación el prompt completo listo para copiar y pegar:

---

## PROMPT PARA RORK

Construye una aplicación móvil nativa en React Native (Expo) que es el panel de gestión de un vendedor independiente en la plataforma Mensualista. Mensualista es un marketplace B2B2C donde empresas (proveedores de servicios) publican sus productos y vendedores independientes los comercializan a cambio de comisiones. Esta app es EXCLUSIVAMENTE el panel del vendedor. No hay vista de comprador, no hay storefront público, no hay panel de empresa ni de administrador. Todo lo que se construya es para que un vendedor gestione su negocio desde su celular.

El diseño debe seguir al máximo la estética de Apple iOS: tipografía SF Pro, componentes con aspecto nativo de iOS, navegación con feel nativo, bottom sheets con handle, tab bar con efecto blur, transiciones fluidas tipo UIKit, colores limpios con mucho espacio en blanco, y jerarquía visual clara. Rork adapta automáticamente al estilo Apple, así que potencia ese estilo al máximo en cada pantalla sin excepción.

---

### 1. VISION GENERAL DE LA APP

Mensualista para Vendedores es una app móvil que permite a vendedores independientes gestionar su actividad comercial: ver las empresas con las que trabajan, explorar y vender sus servicios, completar capacitaciones, registrar ventas, hacer seguimiento de comisiones y pagos, solicitar devoluciones, chatear con empresas, y administrar su perfil y datos bancarios.

La propuesta de valor principal es: un vendedor puede trabajar con múltiples empresas simultáneamente desde una sola app, vendiendo los servicios de cada una y ganando comisiones que se liberan automáticamente tras un periodo de retención (modelo similar a Mercado Pago con split de pagos).

Flujo central del vendedor:
1. Abre la app y ve su dashboard con KPIs del mes (comisiones, ventas, tasa de retención)
2. Selecciona una empresa de las que está vinculado
3. Dentro de esa empresa ve los servicios disponibles, completa la capacitación si es necesaria, y registra ventas
4. Las comisiones pasan por un periodo de retención (7, 14 o 30 días según el servicio) y se liberan automáticamente

Las 3 acciones más frecuentes que el vendedor realiza cada día:
1. Registrar una nueva venta de un servicio (nombre y email del cliente)
2. Consultar el estado de sus comisiones (retenidas vs liberadas)
3. Revisar material de capacitación y argumentos de venta para preparar reuniones

---

### 2. SISTEMA DE DISENO GLOBAL

Paleta de colores (hex):
- Fondo principal: #FFFFFF (blanco puro)
- Fondo de tarjetas: #FFFFFF con borde #F0F0F0
- Fondo secundario (muted): #F5F5F7
- Color primario (acento principal): #007AFF (azul iOS)
- Color primario light: rgba(0, 122, 255, 0.08)
- Texto principal (foreground): #1C1C1E
- Texto secundario: #8E8E93
- Texto terciario: #AEAEB2
- Separadores y bordes: #E5E5EA
- Color de éxito: #34C759 (verde iOS)
- Color de éxito light: rgba(52, 199, 89, 0.08)
- Color de advertencia/retención: #FF9500 (ámbar iOS)
- Color de advertencia light: rgba(255, 149, 0, 0.08)
- Color de error/destructivo: #FF3B30 (rojo iOS)
- Color de error light: rgba(255, 59, 48, 0.08)
- Color info/suscripción: #5856D6 (púrpura iOS)
- Negro para tarjeta balance: #1C1C1E
- Background del tab bar: rgba(255, 255, 255, 0.92) con blur

Tipografía:
- Familia: SF Pro (system font de iOS, se usa automáticamente)
- H1 (título principal de pantalla): 28pt, peso 700 (bold)
- H2 (subtítulo/sección): 20pt, peso 600 (semibold)
- H3 (título de tarjeta): 17pt, peso 600
- Body (texto normal): 15pt, peso 400
- Caption (texto auxiliar): 13pt, peso 400
- Label (etiquetas uppercase): 10pt, peso 600, letter-spacing 0.8, uppercase
- Botones: 15pt, peso 600
- KPI números grandes: 34pt, peso 700
- KPI números medianos: 22pt, peso 700
- Monospace (IDs, códigos): SF Mono, 12pt, peso 500

Espaciado:
- Padding horizontal de pantalla: 16pt
- Padding interno de tarjetas: 16pt
- Margen entre secciones: 24pt
- Margen entre tarjetas en lista: 12pt
- Margen entre elementos dentro de tarjeta: 8pt
- Altura mínima de fila de lista: 56pt
- Safe area top: 44pt (notch)
- Safe area bottom: 34pt (home indicator)

Bordes redondeados:
- Tarjetas: 16pt
- Botones: 12pt
- Inputs: 10pt
- Badges/pills: 999pt (full round)
- Imágenes miniatura: 12pt
- Avatar: 999pt (círculo)
- Bottom sheet: 20pt (solo esquinas superiores)
- Tab bar: 0pt (borde completo)

Sombras:
- Tarjeta normal: ninguna (solo borde de 1pt color #E5E5EA)
- Tarjeta hover/pressed: shadow con offset 0,2 blur 8 color rgba(0,0,0,0.06)
- Bottom sheet: shadow con offset 0,-4 blur 20 color rgba(0,0,0,0.08)

Iconos:
- Usar Ionicons o SF Symbols style
- Tamaño en tab bar: 24pt
- Tamaño en botones y filas: 20pt
- Tamaño en badges: 12pt
- Grosor: línea fina (outline), no relleno excepto cuando está activo en tab bar
- Sin emojis en ningún lugar de la app

---

### 3. ARQUITECTURA DE NAVEGACION COMPLETA

Navegación raíz: Tab Bar inferior con efecto blur (vibrancy) estilo iOS, con 3 tabs.

Tab 1 — Inicio
- Icono: house.fill (Ionicons: home-outline / home)
- Label: "Inicio"
- Stack de pantallas:
  - VendorDashboard (pantalla raíz)
  - VendorCompanyDetail (al tocar una empresa)
  - VendorServiceDetail (al tocar un servicio dentro de una empresa)
  - VendorTrainingDetail (al tocar "Capacitarme" en un servicio)

Tab 2 — Pagos
- Icono: dollarsign.circle.fill (Ionicons: cash-outline / cash)
- Label: "Pagos"
- Stack de pantallas:
  - VendorPayments (pantalla raíz con lista de todas las transacciones)

Tab 3 — Perfil
- Icono: person.fill (Ionicons: person-outline / person)
- Label: "Perfil"
- Stack de pantallas:
  - VendorProfile (pantalla raíz con info personal, datos de pago, preferencias, seguridad)

Navegación entre pantallas:
- De Dashboard a CompanyDetail: push navigation estándar (swipe back gesture habilitado)
- De CompanyDetail a ServiceDetail: push navigation
- De ServiceDetail a TrainingDetail: push navigation
- Formulario de registrar venta: Bottom sheet modal (medio tamaño, dismissable por swipe down)
- Formulario de solicitar devolución: Bottom sheet modal
- Cada pantalla secundaria tiene botón back nativo de iOS (chevron left + título de la pantalla anterior)

No hay pantalla de autenticación en este prototipo. La app arranca directamente en el Tab Bar con el dashboard del vendedor.

---

### 4. PANTALLA POR PANTALLA — DESCRIPCION EXHAUSTIVA

#### 4.1 VendorDashboard (Tab Inicio — Pantalla raíz)

Propósito: Es el hub central del vendedor. Muestra su rendimiento financiero del mes, empresas vinculadas, y acceso rápido a todo.

Estructura visual de arriba a abajo:

1. SALUDO: Texto ligero "Buenos días" (13pt, peso 300, color #8E8E93). Debajo: nombre del vendedor "Juan" (28pt, peso 600, color #1C1C1E). Ambos alineados a la izquierda.

2. TARJETA DE BALANCE (estilo Apple Wallet): Tarjeta de ancho completo con fondo #1C1C1E (negro), bordes redondeados 20pt. Contenido en blanco:
   - Label: "COMISIONES DEL MES" (10pt, uppercase, tracking wider, opacidad 60%)
   - Monto: formato COP con separador de miles, ej "$ 2.450.000 COP" (34pt, peso 600)
   - Fila inferior: "$ 1.200.000 retenidas" y "$ 1.250.000 liberadas" (12pt, opacidad 70%), separados por espacio
   - Al tocar: navega al Tab de Pagos
   - Feedback háptico medio al tocar

3. FILA DE KPIs: Grid de 2x2 con tarjetas de borde #E5E5EA:
   - "Ventas totales" → monto acumulado en COP (22pt bold) + trend "+12%" en verde
   - "Transacciones" → número total (22pt bold) + trend "+3" en verde
   - "Tasa de retención" → porcentaje (22pt bold) + "Excelente" en verde si >= 80%, "Mejorar" en rojo si < 80%
   - "Devoluciones" → número (22pt bold) + "Perfecto" en verde si 0, o "-N" en rojo
   - Cada KPI: label en uppercase 10pt #8E8E93, valor en 22pt bold #1C1C1E, trend en 10pt con icono flecha arriba/abajo

4. MINI CHART (estilo Apple Health): Tarjeta con gráfico de área suave mostrando ingresos semanales de las últimas 6 semanas. Línea de color primario (#007AFF), relleno gradiente del primario con opacidad 15% arriba a 0% abajo. Título "Ingresos semanales" (13pt peso 500), subtítulo "Últimas 6 semanas" (10pt #8E8E93).

5. OFERTA DESTACADA: Tarjeta con imagen de cover del servicio de mayor comisión. La imagen ocupa la parte superior con gradiente negro desde abajo. Sobre la imagen: nombre de la empresa (10pt uppercase, blanco 50% opacidad) y nombre del servicio (17pt bold blanco). Debajo de la imagen: monto de comisión en color primario (20pt bold), grid 2x2 de beneficios con checks verdes, y fila de precio/tipo/porcentaje. Al tocar: navega al CompanyDetail.

6. TUTORIAL (descartable): Tarjeta con 4 pasos tipo checklist:
   - "Explora tus empresas" (completado con check verde y tachado)
   - "Completa capacitaciones" (completado)
   - "Registra tu primera venta" (pendiente, con descripción)
   - "Cobra tus comisiones" (pendiente)
   - Barra de progreso arriba (1pt altura, fondo muted, relleno primario)
   - Botón X para cerrar en esquina superior derecha

7. MIS EMPRESAS: Título "Mis empresas" (15pt peso 500). Grid de tarjetas de empresa (1 columna en móvil). Cada tarjeta:
   - Imagen de cover de la industria (aspect ratio 16:9 aprox, 130pt altura)
   - Gradiente negro desde abajo sobre la imagen
   - Logo de empresa (letra inicial en cuadrado redondeado de 32pt con color primario de la empresa) + nombre + industria (sobre la imagen, parte inferior)
   - Debajo de la imagen: fila con "N servicios", "N ventas", badge del plan (Free/Premium/Enterprise)
   - Al tocar: navega a VendorCompanyDetail
   - Efecto scale 0.98 al presionar

8. DESCUBRE MÁS EMPRESAS: Mismas tarjetas pero con filtro grayscale, opacidad 60%. Overlay centrado con badge "Unirte para acceder" con icono candado. Al tocar: navega a CompanyDetail.

Cálculos de KPIs:
- Comisiones del mes: suma de todas las comisiones del vendedor del mes actual donde status !== 'REFUNDED'
- Ventas totales: suma de grossAmount de todas las ventas donde status !== 'REFUNDED'
- Transacciones: conteo de ventas donde status !== 'REFUNDED'
- Tasa de retención: (ventas activas / (ventas activas + reembolsadas)) * 100
- Devoluciones: conteo de ventas con status === 'REFUNDED'

Estados:
- Cargando: skeleton screens en cada sección
- Vacío (sin empresas): ilustración centrada con icono Building, texto "Aún no tienes empresas activas", subtexto "Explora las empresas disponibles y empieza a vender."
- Con datos: el layout descrito arriba

---

#### 4.2 VendorCompanyDetail

Propósito: Contexto privado de una empresa específica. Aquí el vendedor ve toda su relación con esa empresa: información, servicios, ventas, devoluciones, cupones y chat.

Navegación: Push desde Dashboard. Botón back con nombre "Empresas".

Estructura:

1. HEADER EMPRESA: Logo (letra inicial en cuadrado 56pt con color primario de la empresa) + nombre (22pt bold) + badge del plan (outline) + industria (13pt #8E8E93)

2. QUICK STATS: Grid de 3 columnas:
   - "Servicios" → número total (20pt bold)
   - "Mis ventas" → conteo de ventas no reembolsadas (20pt bold)
   - "Comisiones" → monto total en COP, color primario (20pt bold)

3. ALERTA DE CAPACITACIONES: Si hay capacitaciones en progreso, mostrar banner ámbar con icono BookOpen, texto "N capacitación(es) en curso".

4. TABS INTERNOS: Scrollable horizontal con los siguientes tabs:
   - Acerca de (icono Info)
   - Servicios (icono Package)
   - Ventas (icono ShoppingCart)
   - Devoluciones (icono RotateCcw)
   - Cupones (icono Tag) — solo visible si plan es premium o enterprise
   - Chat (icono MessageCircle) — solo visible si plan es premium o enterprise

   Diseño de tabs: texto 12pt peso 500, border-bottom de 2pt. Tab activo: color primario + borde primario. Tab inactivo: #8E8E93 + borde transparente.

TAB ACERCA DE:
- Imagen hero del servicio (aspect ratio 2.4:1, bordes redondeados 12pt)
- Tagline de la empresa sobre la imagen con gradiente
- Párrafo de descripción (15pt, #1C1C1E, leading 1.6)
- Grid 2x2 de datos: Fundada (año), Equipo (N personas), País, Plan
- Sección "Lo que ofrece": lista de highlights con bullet points primario
- Sección "Contacto": email y teléfono en tarjetas con iconos
- Botón "Visitar sitio web" con icono ExternalLink

TAB SERVICIOS:
- Barra de búsqueda con icono Search, placeholder "Buscar servicios..."
- Grid de tarjetas de servicio (1 columna en móvil). Cada tarjeta:
  - Imagen de cover de la categoría (140pt altura)
  - Gradiente negro desde abajo
  - Badges sobre la imagen: "Top" (dorado, si es top 3 por ventas), "Recurrente" (azul) o "Puntual" (púrpura), "Agotado" (rojo, si 0 códigos disponibles)
  - Si servicio no activado: overlay oscuro con badge "Sin activar" + icono candado, filtro grayscale en toda la tarjeta
  - Comisión por venta sobre la imagen (abajo derecha): "Tu comisión" label + monto en blanco bold
  - Debajo de la imagen: nombre del servicio (15pt bold), descripción (11pt #8E8E93, 2 líneas max), fila footer con "Nd" (días devolución) + "Auto/Aprob." + precio del servicio
  - Al tocar servicio activo: navega a ServiceDetail
  - Al tocar servicio inactivo: navega a TrainingDetail
- Estado vacío: icono Search + "Sin resultados"

TAB VENTAS:
- Contador "N venta(s) activa(s)" (12pt #8E8E93)
- Lista de TransactionCards (componente reutilizable, descripción completa más adelante)
- Estado vacío: icono ShoppingCart + "Sin ventas aún"

TAB DEVOLUCIONES:
- Contador "N devolución(es)"
- Lista de TransactionCards con statusType="refund"
- Estado vacío: icono RotateCcw + "Sin devoluciones"

TAB CUPONES:
- Contador "N cupones disponibles"
- Lista de tarjetas de cupón:
  - Icono Percent en cuadrado redondeado primario
  - Código en monospace bold + badge con porcentaje o monto
  - Descripción + fecha de vencimiento + usos restantes
  - Botón "Copiar" que copia al clipboard con feedback háptico y toast de confirmación
- Mock data: 3 cupones (NUEVO20 20%, PROMO50K $50.000, LANZAMIENTO 10%)

TAB CHAT:
- Lista de mensajes tipo iMessage:
  - Mensajes del vendedor: burbuja azul primario, texto blanco, alineado a la derecha, esquina inferior derecha recta
  - Mensajes de la empresa: burbuja #F5F5F7, texto negro, alineado a la izquierda, esquina inferior izquierda recta
  - Hora debajo de cada burbuja (9pt, opacidad 60%)
- Input de texto en la parte inferior: campo redondeado full con placeholder "Escribe un mensaje...", botón de enviar circular azul
- Auto-scroll al último mensaje
- Al enviar: agrega el mensaje y simula respuesta automática después de 1.5 segundos

---

#### 4.3 VendorServiceDetail

Propósito: Toda la información de un servicio específico + registrar ventas + solicitar devoluciones.

Navegación: Push desde CompanyDetail. Back button con nombre de la empresa.

Estructura:

1. HEADER: Imagen miniatura del servicio (56pt, bordes 12pt) + nombre (20pt bold) + "Empresa · Categoría" (12pt #8E8E93) + badges: "Recurrente/Puntual" (outline) + "Activo" (verde) o "Sin activar" (outline gris con candado)

2. QUICK STATS: Grid 3 columnas:
   - "Comisión" → monto en COP, color primario (20pt bold) + "N% por venta" (10pt)
   - "Mis ventas" → conteo (20pt bold)
   - "Ganado" → monto total acumulado (20pt bold)

3. ALERTA SI NO ACTIVADO: Botón "Capacitarme primero" (outline ámbar) que navega al TrainingDetail

4. TABS INTERNOS:
   - Información (icono Info)
   - Ventas (icono ShoppingCart)
   - Devoluciones (icono RotateCcw)

TAB INFORMACIÓN:
- Imagen hero del servicio (aspect ratio 2.4:1)
- Si ya completó capacitación: botón "Revisar capacitación" con icono Play que navega al TrainingDetail
- Descripción y pitch en 3 líneas (15pt + 13pt)
- Enlace "Conocer más sobre este servicio" con URL y icono ExternalLink
- Grid 2x2 de info:
  - Comisión: monto + porcentaje
  - Precio: monto + "mensual" o "pago único"
  - Capacitación: tipo (Video/PDF) + estado (Completada/Pendiente) + duración estimada
  - Devoluciones: N días + tipo (Automática/Con aprobación). Si 0 días: "Sin devoluciones"
- Sección "Qué incluye": lista de features con checks verdes (máximo 6)
- Sección "Audiencia ideal" / "Problema que resuelve" / "Resultado": 3 tarjetas stacked
- Sección "Cómo venderlo": tarjeta con fondo primario 5%, borde primario 20%, pitch en itálica
- Sección "Objeciones comunes": lista de tarjetas con objeción (bold) + respuesta
- Sección "Materiales": lista de materiales descargables (PDF) con botón "Descargar"
- Sección "Ofertas activas": cupones activos con código copiable
- Sección "Contacto del servicio": nombre y email

TAB VENTAS:
- Botón "Registrar nueva venta" (full width, primario) — solo si capacitación completada
- Contador de ventas activas
- Lista de TransactionCards con acciones de devolución
- Al tocar "Registrar nueva venta": abre bottom sheet modal con:
  - Título: "Registrar venta"
  - Subtítulo: nombre del servicio + precio
  - Campo "Nombre del cliente" (con icono User)
  - Campo "Email del cliente" (con icono Mail)
  - Resumen: Precio + Tu comisión (N%) = monto en primario
  - Botones: "Cancelar" (outline) + "Registrar venta" (primario, con loading state)
  - Al registrar: toast de éxito "Venta registrada!" con descripción de comisión y días de retención
  - Feedback háptico de éxito

TAB DEVOLUCIONES:
- Lista de refund requests con TransactionCard statusType="refund"
- Estado vacío: "Sin devoluciones"

Solicitar devolución (bottom sheet modal):
- Título: "Solicitar devolución" con icono Shield
- Descripción: "Procesamiento automático" o "La empresa revisará tu solicitud" según refundPolicy.autoRefund
- Resumen: servicio, cliente, monto, días restantes de ventana de devolución
- Comisión que pierde (en rojo negativo)
- Select de motivo: "Cliente se arrepintió", "No le gustó el servicio", "Error en compra", "Otro"
- Textarea de notas (opcional)
- Botones: "Cancelar" (outline) + "Confirmar devolución" (destructivo rojo)
- Solo disponible si: status === 'HELD' y dentro de la ventana de refundWindowDays y no existe ya un refund request para esa venta

---

#### 4.4 VendorTrainingDetail

Propósito: Capacitación estilo NotebookLM. El vendedor consume el material de entrenamiento de un servicio y declara que completó la capacitación para activar el servicio.

Navegación: Push. Back button con nombre de la empresa.

Estructura:

1. HEADER: Badge de tipo (Video/PDF) + duración total + badge "Completada" si ya fue completada. Título "Cómo vender [nombre del servicio]" (18pt bold). Subtexto "Empresa · Categoría".

2. BARRA DE PROGRESO: "N de M secciones" + "N%" a la derecha. Barra de 1pt con relleno primario animado.

3. LAYOUT SPLIT (en iPad/landscape) o STACK (en iPhone):
   
   PANEL IZQUIERDO — Navegación de capítulos:
   - Lista de capítulos (each ~56pt height):
     - Círculo de 20pt: verde con check si completado, primario con número si activo, muted con número si pendiente
     - Título del capítulo (12pt peso 500)
     - Duración + icono Play si es video
     - Borde izquierdo de 2pt: primario si activo, transparente si no
   - Tarjeta "Tu ganancia": monto de comisión en primario + porcentaje
   - Botón "Mis notas" (colapsable en móvil)

   PANEL DERECHO — Contenido:
   - Header del capítulo: "Sección N de M" + título (17pt bold) + badge duración
   - Si es video: placeholder con botón Play grande centrado en fondo muted
   - Contenido de texto: párrafos en 13pt, leading 1.6
   - "Puntos clave": tarjeta con fondo primario 5%, lista con bullets primario
   - Navegación: "Anterior" (ghost) + "Siguiente" (primario) o "Marcar como leída" si es último capítulo
   - Al avanzar: marca automáticamente el capítulo anterior como completado

   DEBAJO del contenido:
   - Textarea "Mis notas" por capítulo (persistencia local)
   - Grid 2 columnas: "Tips de venta" (checks verdes) + "Errores comunes" (badges rojos !)

4. BOTÓN COMPLETAR: Tarjeta con fondo primario 5%, borde primario 20%:
   - "¿Listo para vender?" (15pt bold) + "Declara la capacitación completada para activar el servicio" (11pt)
   - Botón "Completar y activar" (primario)
   - Al completar: toast "Capacitación completada. Servicio activado." + navegación automática al ServiceDetail después de 1.5s
   - Si ya completada: tarjeta verde con "Servicio activo" y botón "Vender ahora" que navega al ServiceDetail

---

#### 4.5 VendorPayments (Tab Pagos)

Propósito: Vista consolidada de TODAS las transacciones del vendedor, con filtros por estado y búsqueda.

Estructura:

1. HEADER: "Pagos" (22pt bold) + "Tus ventas, retenciones y comisiones" (13pt #8E8E93)

2. KPIs: Grid de 3 tarjetas (1 fila en horizontal, scroll si necesario):
   - "Liberado este mes": monto + icono DollarSign en cuadrado primario + "N transacciones" en primario
   - "En retención": monto + icono Clock en cuadrado ámbar + "N ventas pendientes"
   - "Total cobrado": monto + icono CheckCircle en cuadrado verde + "N ventas cobradas"

3. CÓMO FUNCIONA: Tarjeta informativa con icono CreditCard:
   "Cada venta pasa por un periodo de retención definido por la empresa (7, 14 o 30 días según el servicio). Al liberarse, tu comisión se transfiere automáticamente."

4. FILTROS POR ESTADO: Fila de pills horizontales (rounded full):
   - "Todas (N)" / "Retenidas (N)" / "Liberadas (N)" / "Devueltas (N)"
   - Pill activa: fondo #1C1C1E, texto blanco
   - Pill inactiva: fondo #F5F5F7, texto #8E8E93
   - Sin scroll, distribuidas equitativamente

5. BÚSQUEDA: Input con icono Search, placeholder "Buscar por cliente o servicio..."

6. LISTA DE TRANSACCIONES: TransactionCards ordenadas por fecha descendente. Infinite scroll.

7. Estado vacío: icono DollarSign + "Sin resultados" + "No se encontraron ventas con esos filtros"

---

#### 4.6 VendorProfile (Tab Perfil)

Propósito: Gestión de datos personales, datos bancarios, preferencias y seguridad.

Estructura:

1. HEADER DE PERFIL: Avatar (cuadrado redondeado 20pt, 64pt, fondo primario 10% con inicial en primario 28pt bold) + nombre (20pt bold) + email (13pt #8E8E93) + badge "Activo" (verde outline) + ID del vendedor en monospace (10pt #8E8E93)

2. STATS GRID: 4 tarjetas en grid 2x2:
   - Capacitaciones completadas (icono BookOpen)
   - Servicios activos (icono Briefcase)
   - Ventas del mes (icono TrendingUp)
   - Comisiones del mes en COP (icono DollarSign)

3. SECCIÓN "Información personal" (icono User):
   - Tarjeta con borde, header con fondo separado
   - Campos editables: Nombre completo, Email, WhatsApp, Ciudad (2 columnas con País que es read-only)
   - Botón "Guardar" al final

4. SECCIÓN "Datos de pago" (icono CreditCard):
   - Info box: "Los pagos se hacen por transferencia automática cada semana. No necesitas solicitar retiros."
   - Campos: Banco (select: Bancolombia, Davivienda, BBVA, Banco de Bogotá, Nequi, Daviplata), Tipo de cuenta (select: Ahorros, Corriente), Número de cuenta, Titular, Tipo documento (select: C.C., C.E., NIT), Número de documento
   - Botón "Guardar"

5. SECCIÓN "Preferencias" (icono Bell):
   - Toggle: "Notificaciones WhatsApp" + descripción "Alertas de ventas y pagos"
   - Fila: "Zona horaria" + badge "Colombia"

6. SECCIÓN "Seguridad" (icono Shield):
   - Fila: "Cambiar contraseña" + botón "Cambiar"
   - Fila: "Cerrar sesión" + botón rojo "Salir" con icono LogOut

Cada sección es una tarjeta con header separado por borde. Los formularios usan labels de 12pt peso 500 en #8E8E93.

---

### 5. COMPONENTE TransactionCard (reutilizable en todas las pantallas)

Diseño tipo "pedido de delivery app", no como transferencia bancaria.

Estado cerrado (56pt altura):
- Imagen miniatura del servicio (48pt, bordes 10pt)
- Nombre del cliente (15pt bold) + badge "REC" si es suscripción recurrente
- Nombre del servicio + nombre empresa (11pt #8E8E93)
- Fecha en formato "21 ene 2025" (10pt #AEAEB2)
- A la derecha: monto en COP (15pt bold) + badge de estado con color

Estados y colores de los badges:
- HELD / "En retención": fondo ámbar 10%, texto ámbar, icono reloj
- RELEASED / "Liberada": fondo verde 10%, texto verde, icono check
- REFUNDED / "Devuelta": fondo rojo 10%, texto rojo, icono rotate
- pendiente: fondo ámbar 10%, texto ámbar
- aprobado: fondo verde 10%, texto verde
- rechazado: fondo rojo 10%, texto rojo
- automático: fondo azul 10%, texto azul

Estado expandido (al tocar, con animación de expansión):
- Desglose financiero en tarjeta muted:
  - Venta bruta: monto
  - Tu comisión: +monto en primario (o -monto en rojo si vista empresa)
  - Fee plataforma: -monto en rojo
  - Línea separadora
  - Neto empresa: monto
- Si HELD: tarjeta ámbar con "Dinero en retención" + fecha de liberación
- Detalles: email del cliente, ID de pago (monospace), fecha de liberación si RELEASED
- Código de activación: tarjeta con fondo primario 5%, código en monospace
- Motivo de devolución: si es refund, mostrar razón y quién decidió
- Acciones:
  - "Copiar ID" (ghost)
  - "Soporte" (verde, abre WhatsApp con mensaje pre-llenado)
  - "Devolver (Nd)" (rojo, si elegible para devolución: status HELD + dentro de ventana + no existe refund)
  - Badge "Devolución: [status]" si ya existe un refund request

---

### 6. GIGS Y SERVICIOS — DISEÑO Y LOGICA

Los servicios NO son creados por el vendedor. Son publicados por las empresas. El vendedor solo puede:
1. Ver los servicios de las empresas a las que está vinculado
2. Completar la capacitación requerida (si aplica)
3. Vender el servicio registrando la venta con nombre y email del cliente
4. Solicitar devoluciones dentro de la ventana permitida

Tipos de servicio:
- "suscripción" (recurrente mensual): badge azul "Recurrente" con icono RefreshCw
- "puntual" (pago único): badge púrpura "Puntual" con icono Zap

Estados de un servicio para el vendedor:
- Activo (capacitación completada o no requerida): puede vender
- Sin activar (requiere capacitación): tarjeta en grayscale, overlay con candado, al tocar va a capacitación

Campos visibles de un servicio:
- name, description, category, priceCOP, type, vendorCommissionPct, refundPolicy (autoRefund + refundWindowDays), requiresTraining, trainingType, materials, activationCodes count, activeSubscriptions (si es suscripción)

Tarjeta de servicio en grid:
- Imagen cover de la categoría (140pt)
- Badges: Top (si top 3 por ventas), tipo (Recurrente/Puntual), Agotado (si 0 códigos)
- Comisión por venta (abajo derecha de la imagen, blanco bold)
- Nombre (15pt bold, 1 línea), conteo de ventas, descripción (11pt, 2 líneas)
- Footer: días de devolución + tipo (Auto/Aprob.) + precio

Métricas por servicio:
- Mis ventas (conteo)
- Comisión ganada total
- Códigos disponibles
- Suscripciones activas (si recurrente)

---

### 7. METRICAS Y DASHBOARD

KPIs principales del vendedor (todos calculados en tiempo real desde los datos):

1. Comisiones del mes: suma de comisiones donde mes === mes actual y status !== REFUNDED
2. Comisiones retenidas: suma donde status === HELD
3. Comisiones liberadas: suma donde status === RELEASED
4. Ventas totales (monto): suma de grossAmount donde status !== REFUNDED
5. Transacciones: conteo de ventas donde status !== REFUNDED
6. Tasa de retención: (ventas no reembolsadas / total ventas) * 100
7. Devoluciones: conteo de ventas REFUNDED

Chart: Gráfico de área de comisiones semanales (últimas 6 semanas). Cada punto es la suma de comisiones de esa semana.

---

### 8. MENSAJES Y COMUNICACION

La sección de chat vive dentro del contexto de cada empresa (tab "Chat" en CompanyDetail). No hay un tab global de mensajes.

Lista de conversaciones: No aplica (es una conversación por empresa).

Pantalla de conversación:
- Scroll vertical de burbujas
- Burbujas del vendedor: fondo #007AFF, texto blanco, alineadas a la derecha, esquina inferior derecha recta, padding 12pt horizontal 8pt vertical
- Burbujas de la empresa: fondo #F5F5F7, texto #1C1C1E, alineadas a la izquierda, esquina inferior izquierda recta
- Hora debajo de cada burbuja: 9pt, opacidad 60%
- Solo texto (no soporta imágenes ni archivos en este prototipo)
- Input inferior: campo rounded full con fondo #F5F5F7, sin borde, placeholder "Escribe un mensaje..."
- Botón enviar: círculo 36pt, fondo primario, icono Send blanco. Deshabilitado si vacío.
- Simulación de respuesta automática 1.5s después de enviar

---

### 9. PERFIL Y CONFIGURACION

Descrito en la sección 4.6. Resumen:

Información editable:
- Nombre completo, Email, WhatsApp, Ciudad (País es read-only "Colombia")

Datos bancarios:
- Banco (6 opciones colombianas), Tipo de cuenta (2 opciones), Número de cuenta, Titular, Tipo documento (CC/CE/NIT), Número de documento

Preferencias:
- Toggle de notificaciones WhatsApp
- Zona horaria (fija: Colombia)

Seguridad:
- Cambiar contraseña (mock: muestra toast "Funcionalidad de demo")
- Cerrar sesión (navega a pantalla raíz con toast "Cerrando sesión...")

No hay modo vacaciones en este prototipo.

---

### 10. INTERACCIONES, GESTOS Y MICROINTERACCIONES

Transiciones:
- Push navigation: slide from right (nativo de iOS)
- Bottom sheets: slide from bottom con spring animation, handle visible, dismissable por swipe down
- Tabs: fade crossfade de 250ms
- Expandir TransactionCard: height animation de 250ms con ease-in-out

Gestos:
- Swipe from left edge: back navigation (nativo)
- Pull to refresh: en todas las listas (Dashboard, Payments, cada tab de CompanyDetail)
- Tap en tarjeta: feedback háptico light + scale 0.98 por 100ms
- Tap en botón principal: feedback háptico medium
- Long press en código de cupón: copiar al clipboard + feedback háptico success + toast
- Swipe horizontal en tabs: cambiar de tab

Feedback háptico (expo-haptics):
- Al registrar una venta exitosa: notificationAsync(Success)
- Al solicitar devolución: notificationAsync(Warning)
- Al tocar tarjeta de empresa: impactAsync(Light)
- Al tocar tarjeta de balance: impactAsync(Medium)
- Al copiar un código: notificationAsync(Success)

Animaciones de carga:
- Skeleton screens en TODAS las pantallas: rectángulos redondeados con animación shimmer (gradiente de #F5F5F7 a #E5E5EA oscilando)
- Nunca usar spinners
- Botones con loading state: texto cambia a "Registrando..." con opacidad reducida y disabled

Estados de botones:
- Normal: fondo primario, texto blanco, bordes 12pt
- Pressed: fondo primario con opacidad 85%, scale 0.98
- Loading: texto "Cargando...", opacidad 60%, disabled
- Disabled: fondo #E5E5EA, texto #AEAEB2

Teclado:
- En formularios: scroll automático para que el campo activo quede visible
- Botón "Done" en el teclado numérico
- Botón "Next" entre campos de formulario
- Al tocar fuera del campo: dismiss keyboard

---

### 11. ESTADOS VACIOS Y DE ERROR

Para cada pantalla/sección:

Dashboard sin empresas:
- Icono Building2 (40pt, opacidad 30%)
- "Aún no tienes empresas activas" (15pt bold)
- "Explora las empresas disponibles y empieza a vender." (13pt #8E8E93)

Lista de servicios sin resultados:
- Icono Search (40pt, opacidad 30%)
- "Sin resultados" (15pt bold)
- "Prueba con otra búsqueda" (13pt)

Lista de ventas vacía:
- Icono ShoppingCart (32pt, opacidad 30%)
- "Sin ventas aún" (15pt bold)
- "Registra tu primera venta de este servicio" (13pt)

Devoluciones vacías:
- Icono RotateCcw (32pt, opacidad 30%)
- "Sin devoluciones" (15pt bold)
- "No hay solicitudes de devolución para este servicio" (13pt)

Pagos sin resultados (con filtros):
- Icono DollarSign (40pt, opacidad 20%)
- "Sin resultados" (15pt bold)
- "No se encontraron ventas con esos filtros" (13pt)

Capacitación no encontrada:
- Icono BookOpen (40pt, opacidad 30%)
- "Capacitación no encontrada" (15pt bold)
- Botón "Volver" (outline)

Error de red: No aplica (todo es mock data local).

---

### 12. DATOS, LOGICA Y MOCK DATA

ENTIDADES:

#### Company
```
{
  id: string,
  name: string,
  industry: string,
  country: string,
  plan: 'freemium' | 'premium' | 'enterprise',
  contactEmail: string,
  contactPhone: string,
  websiteUrl: string,
  primaryColor: string (hex),
  secondaryColor: string (hex)
}
```

#### VendorCompanyLink
```
{
  vendorId: string,
  companyId: string,
  joinedAt: string (YYYY-MM-DD),
  status: 'active' | 'invited' | 'paused'
}
```

#### Service
```
{
  id: string,
  companyId: string,
  name: string,
  description: string,
  category: string,
  priceCOP: number,
  type: 'suscripción' | 'puntual',
  vendorCommissionPct: number,
  mensualistaPct: number,
  status: 'activo' | 'pausado',
  refundPolicy: {
    autoRefund: boolean,
    refundWindowDays: 0 | 7 | 14 | 30
  },
  requiresTraining: boolean,
  trainingType: 'pdf' | 'video',
  materials: Material[],
  activationCodes: ActivationCode[],
  activeSubscriptions: number
}
```

#### Sale (Transacción)
```
{
  id: string,
  serviceId: string,
  companyId: string,
  vendorId: string,
  clientName: string,
  clientEmail: string,
  grossAmount: number,
  sellerCommissionAmount: number,
  mensualistaFeeAmount: number,
  providerNetAmount: number,
  holdStartAt: string,
  holdEndAt: string,
  releasedAt?: string,
  refundedAt?: string,
  status: 'HELD' | 'RELEASED' | 'REFUNDED',
  paymentProvider: 'MercadoPago',
  mpPaymentId: string,
  isSubscription: boolean,
  subscriptionActive?: boolean,
  activationCode?: string,
  createdAt: string
}
```

#### Commission
```
{
  id: string,
  saleId: string,
  vendorId: string,
  amountCOP: number,
  status: 'HELD' | 'RELEASED' | 'REFUNDED',
  createdAt: string
}
```

#### TrainingProgress
```
{
  id: string,
  vendorId: string,
  serviceId: string,
  status: 'not_started' | 'in_progress' | 'declared_completed',
  lastAccessedAt: string,
  completedAt?: string
}
```

#### RefundRequest
```
{
  id: string,
  saleId: string,
  vendorId: string,
  companyId: string,
  serviceId: string,
  reason: string,
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'automático',
  decisionBy?: 'empresa' | 'sistema',
  createdAt: string
}
```

#### TrainingContent (por servicio)
```
{
  serviceId: string,
  title: string,
  overview: string,
  totalDuration: string,
  chapters: [{
    id: string,
    title: string,
    duration: string,
    type: 'video' | 'text',
    content: string (párrafos separados por \n\n),
    keyPoints: string[]
  }],
  salesTips: string[],
  commonMistakes: string[]
}
```

#### ExtendedServiceDetails
```
{
  shortDescription: string,
  targetAudience: string,
  problemSolved: string,
  promisedResult: string,
  features: string[],
  pitchOneLine: string,
  pitchThreeLines: string,
  objections: [{ objection: string, response: string }],
  websiteUrl: string,
  contactName: string,
  contactEmail: string
}
```

MOCK DATA COMPLETA:

Vendedor actual: { id: 'vendor-001', name: 'Juan Pérez', email: 'juan.perez@email.com', country: 'Colombia' }

12 Empresas (generar todas con datos realistas):
1. Poliza.ai — IA para Seguros — enterprise — #5B6FE0
2. LexIA — IA Legal — premium — #00B87A
3. Kreativo — IA para Marketing — premium — #E5294A
4. Cierro — IA para Ventas — freemium — #F59E0B
5. Asista — IA para Atención — enterprise — #5007FA
6. NumeroIA — IA para Contabilidad — freemium — #6366F1
7. Recruta — IA para RRHH — premium — #EC4899
8. Blindaje — IA para Ciberseguridad — enterprise — #10B981
9. IronHaus — Gimnasio — premium — #1A1A2E
10. Prana Studio — Yoga & Bienestar — enterprise — #B45309
11. Vitalik Wellness — Spa & Wellness — premium — #7C3AED
12. Salón Élite — Peluquería & Estética — enterprise — #D4A574

El vendedor está vinculado a 8 de las 12 empresas (company-001, 002, 004, 005, 006, 009, 010, 012). Las otras 4 aparecen como "Descubre más empresas" con grayscale.

35 Servicios distribuidos en las 12 empresas (2-3 por empresa). Cada servicio con: nombre descriptivo, precio entre $129.000 y $4.500.000 COP, comisión 12-25%, tipo suscripción o puntual, política de devolución variada (0, 7, 14 o 30 días, autoRefund true o false), requiresTraining true o false, 25 activation codes.

Generar 100+ ventas para vendor-001 distribuidas entre sus empresas vinculadas:
- 60% status RELEASED
- 30% status HELD
- 10% status REFUNDED
- Fechas variadas entre los últimos 60 días
- Clientes con nombres de empresas colombianas

Generar commissions correspondientes a cada venta.

Generar training progress:
- 5 servicios con status 'declared_completed'
- 2 servicios con status 'in_progress'
- Los demás sin training (not_started)

Generar 3 refund requests variados (pendiente, aprobado, automático).

Generar training content para cada servicio con 4 capítulos, 5 sales tips, 5 common mistakes.

Para las imágenes de cover de servicios y empresas: usar placeholders de Unsplash con URLs como:
- Gimnasio: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800
- Yoga: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800
- Spa: https://images.unsplash.com/photo-1540555700478-4be289fbec6e?w=800
- Peluquería: https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800
- IA/Tech genérica: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800
- Seguros: https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800
- Legal: https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800
- Marketing: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800
- Ventas: https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800
- Atención al cliente: https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800
- Contabilidad: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800
- RRHH: https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800
- Ciberseguridad: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800

Formato de moneda: SIEMPRE "$ X.XXX.XXX COP" con separador de miles de punto (formato colombiano). Usar función formatCOP que recibe number y retorna string.

---

### 13. ADAPTACIONES WEB A MOBILE

- Sidebar de navegación → Tab Bar inferior con blur (3 tabs: Inicio, Pagos, Perfil)
- Tabs horizontales dentro de pantallas → Scrollable horizontal tab bar con borde inferior
- Grids de 2-3 columnas → 1 columna en móvil (FlatList vertical)
- Tablas de datos → Listas de TransactionCards expandibles
- Modales de formulario → Bottom sheets con handle y dismiss por swipe
- Dropdowns/Select → Action sheets estilo iOS (o Picker nativo)
- Hover effects → Press effects con scale 0.98 + feedback háptico
- Tooltips → No aplica (remover)
- Gráficos anchos → Gráficos que ocupan ancho completo del teléfono
- Scrollbar custom → FlatList nativa de iOS con bounce
- Paginación → Infinite scroll con ActivityIndicator al final
- Formularios largos → ScrollView con KeyboardAvoidingView
- Toast notifications → Alert nativo o librería tipo react-native-toast-message (posición top)

---

### 14. INSTRUCCIONES TECNICAS PARA RORK

Stack técnico exacto:
- React Native con Expo SDK más reciente
- React Navigation v6 con @react-navigation/bottom-tabs (tab bar inferior nativo) y @react-navigation/native-stack (stack navegación nativa)
- @expo/vector-icons con Ionicons para todos los iconos
- expo-image para todas las imágenes (con placeholder y transition)
- StyleSheet.create para todos los estilos — NO usar styled-components, NativeWind, ni Tailwind
- react-native-reanimated para animaciones (expandir TransactionCard, progreso de barras, scale on press)
- react-native-gesture-handler para gestos (swipe en bottom sheets)
- expo-haptics para feedback háptico en todas las interacciones importantes
- @react-native-async-storage/async-storage para persistir notas de capacitación
- react-native-svg + react-native-svg-charts o victory-native para el mini chart de área

NO usar ninguna librería de UI externa como NativeBase, React Native Paper, React Native Elements, o Tamagui. Todo debe ser componentes custom construidos con StyleSheet para respetar el estilo Apple nativo al 100%.

Estructura de archivos:
```
/src
  /screens
    VendorDashboard.tsx
    VendorCompanyDetail.tsx
    VendorServiceDetail.tsx
    VendorTrainingDetail.tsx
    VendorPayments.tsx
    VendorProfile.tsx
  /components
    TransactionCard.tsx
    ServiceCard.tsx
    CompanyCard.tsx
    KPICard.tsx
    StatusBadge.tsx
    BalanceCard.tsx
    ChapterList.tsx
    ChatBubble.tsx
    SkeletonLoader.tsx
  /data
    companies.ts
    services.ts
    sales.ts
    commissions.ts
    trainingContent.ts
    extendedServiceData.ts
    vendors.ts
    vendorCompanyLinks.ts
    refundRequests.ts
    trainingProgress.ts
  /utils
    formatCOP.ts
    dateUtils.ts
  /hooks
    useVendorData.ts
  /navigation
    TabNavigator.tsx
    HomeStack.tsx
    PaymentsStack.tsx
    ProfileStack.tsx
  /theme
    colors.ts
    typography.ts
    spacing.ts
```

Todos los datos son mock data en archivos separados por entidad. No hay llamadas a API. Todo es local y funcional desde el primer momento.

Usar exactamente el mismo sistema de diseño definido en el punto 2 en CADA componente sin excepción. Crear un archivo theme/colors.ts con todas las constantes de color, theme/typography.ts con todos los estilos de texto, y theme/spacing.ts con todas las constantes de espaciado. Importar estos archivos en TODOS los componentes.

Toda la app debe estar en español (Colombia). Todos los textos, labels, placeholders, toasts, botones y mensajes en español.

La moneda es COP (pesos colombianos). Siempre mostrar con formato "$ 1.234.567 COP" usando Intl.NumberFormat('es-CO').

---

FIN DEL PROMPT.

