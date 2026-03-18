

# Rediseno del Dashboard del Vendedor (estilo app financiera)

Basado en la imagen de referencia, el dashboard del vendedor se va a reestructurar para seguir un layout vertical tipo app financiera con estas secciones en orden:

---

## Estructura visual propuesta

1. **Header con saludo y balance principal** - Nombre del vendedor arriba, y debajo un numero grande y prominente con las comisiones del mes (el "saldo" principal). Un boton circular "+" para ir a vender un servicio nuevo.

2. **Pills de navegacion horizontal** - Chips scrolleables: "Ventas", "Comisiones", "Capacitaciones", "Servicios" que filtran o navegan a las secciones correspondientes.

3. **Grafica principal** - Un BarChart de comisiones semanales justo debajo de los pills, ocupando todo el ancho. Estilo limpio con colores purpura degradado en las barras.

4. **Actividad reciente (card blanca redondeada)** - Seccion tipo "Recent Activity" con las ultimas 3-4 transacciones mostrando: avatar/icono, nombre del cliente, monto, servicio y estado. Cada item en una fila compacta.

5. **KPIs secundarios** - Grid de 2x2 compacto debajo con: Ventas del mes, Tasa de exito, Suscripciones activas, Comision promedio. Mucho mas pequenos que antes.

6. **Servicios recomendados** - Se mantiene la seccion actual pero mas compacta.

7. **Capacitaciones** - Se mantiene el bloque compacto actual.

---

## Cambios tecnicos

### Archivo: `src/pages/vendor/VendorDashboard.tsx`

- **Eliminar** las 2 filas de 4 KPIs grandes del inicio (8 StatCards).
- **Nuevo hero section**: Fondo con gradiente sutil purpura, nombre del vendedor, monto grande de comisiones del mes con subtitle de estado (retenidas vs liberadas).
- **Pills horizontales**: Botones scroll horizontal que sirven como acceso rapido a `/vendor/sales`, `/vendor/services`, `/vendor/trainings`, etc.
- **Grafica**: Mover el BarChart de comisiones semanales justo despues de los pills, reducir altura en mobile a 180px.
- **Recent Activity**: Reemplazar el bloque de "Ultima transaccion" por una lista de las ultimas 4 ventas con icono, cliente, monto y badge de estado.
- **KPIs grid**: Mover a un grid 2x2 compacto despues de la actividad reciente, con valores mas pequenos.
- **Eliminar** la seccion de notificaciones/novedades (Bell) para simplificar.
- **Eliminar** los graficos de pie chart y line chart (dejar solo el bar chart principal).

### Archivo: `src/components/dashboard/DashboardComponents.tsx`

- Sin cambios estructurales, se reutiliza el StatCard existente.

### Archivo: `src/index.css`

- Posible ajuste menor para el gradiente del hero del dashboard.

