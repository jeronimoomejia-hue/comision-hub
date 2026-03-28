

## Plan: Sistema de Jerarquía de Comisiones por Servicio

### Concepto

Las empresas podrán crear hasta 3 niveles de comisión por servicio (ej: Básico 10%, Premium 15%, Elite 20%). Un nivel es el "público" (visible para todos los vendedores) y los otros son privados (asignados por link o invitación directa). Cada vendedor ve su nivel asignado con una etiqueta visual que indica su jerarquía.

### Cambios en Base de Datos

Nueva tabla `commission_tiers`:
- `id`, `service_id`, `name` (ej: "Básico", "Premium", "Elite"), `commission_pct`, `is_public` (boolean), `tier_order` (1-3), `created_at`
- RLS: empresa dueña puede CRUD, todos pueden SELECT

Modificar `vendor_company_links` o crear `vendor_commission_assignments`:
- `id`, `vendor_id`, `service_id`, `tier_id`, `assigned_at`
- Permite asignar un vendedor a un tier específico por servicio

Actualizar `sales`: añadir `commission_tier_id` para saber qué tier se usó en cada venta.

### Panel de Empresa (CompanyServiceDetail)

Nueva pestaña **"Comisiones"** en el menú del servicio (entre Vendedores y Cupones):
- Muestra hasta 3 tarjetas de nivel, cada una con: nombre del tier, % de comisión, si es público o privado, cantidad de vendedores asignados
- Botón "Crear nivel" (máximo 3)
- Edición inline de cada tier (nombre, %, público/privado)
- Un solo tier puede ser marcado como público (radio button)
- Link copiable para tiers privados (para enviar a vendedores específicos)

En la pestaña **Vendedores**: mostrar junto a cada vendedor su tier asignado con badge de color. Permitir cambiar el tier desde un dropdown.

### Panel del Vendedor (VendorServiceDetail)

- En el header del servicio, mostrar la comisión del tier asignado al vendedor (no la genérica)
- Badge visual según el tier: 
  - Tier 1 (básico): badge gris
  - Tier 2 (premium): badge dorado  
  - Tier 3 (elite): badge morado con brillo
- En la card del servicio en el home/listado, mostrar también el badge del tier
- El cálculo de comisión en "Registrar venta" usa el % del tier asignado

### Archivos a Modificar

1. **Migración SQL** — Crear tabla `commission_tiers` y `vendor_commission_assignments`, añadir `commission_tier_id` a `sales`
2. **`src/data/mockData.ts`** — Añadir interfaces y datos mock para tiers
3. **`src/contexts/DemoContext.tsx`** — Lógica de CRUD de tiers y asignaciones
4. **`src/pages/company/service-tabs/ComisionesTab.tsx`** (nuevo) — Panel de gestión de tiers
5. **`src/pages/company/CompanyServiceDetail.tsx`** — Añadir pestaña "Comisiones"
6. **`src/pages/company/service-tabs/VendedoresTab.tsx`** — Mostrar tier por vendedor con opción de cambiar
7. **`src/pages/vendor/VendorServiceDetail.tsx`** — Usar tier asignado para comisión y mostrar badge
8. **`src/pages/vendor/VendorHome.tsx`** — Mostrar badge de tier en las cards de servicios
9. **`src/pages/vendor/VendorCompanyDetail.tsx`** — Badge de tier en listado de servicios

### Diseño Visual

- Cards de tiers con borde de color diferenciado (gris/dorado/morado)
- Iconos de estrella/corona para tiers superiores
- Transiciones suaves al editar
- Todo sin scroll, compacto y minimalista

