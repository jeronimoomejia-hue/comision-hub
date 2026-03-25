

## Plan: Simplificar PricingSection y agregar tabla comparativa

### Problema actual
La sección de pricing tiene demasiado texto, descripciones largas y listas repetitivas de features en cada card. Es difícil comparar planes de un vistazo.

### Cambios en `src/components/landing/PricingSection.tsx`

**1. Simplificar las cards de planes (parte superior)**
- Quitar las descripciones largas de cada plan
- Mostrar solo: nombre, precio, fee resumido, y el CTA
- Cards mas limpias y compactas, sin la lista de features individuales
- Mantener el currency switcher (COP/EUR) y el badge "Mas popular"

**2. Agregar tabla comparativa debajo de las cards**
- Una tabla horizontal con columnas: Feature | Freemium | Premium | Enterprise
- Filas agrupadas por categoria:
  - **Servicios**: Limite (5 vs Ilimitados), Codigos manuales, Codigos automaticos (API)
  - **Vendedores**: Panel basico/avanzado, Cupones, Chat
  - **Marca**: Personalizacion basica/completa, Dominio personalizado
  - **Comisiones**: Fee Mensualista (15% vs 0%), Costos pasarela
- Usar Check/X icons en las celdas, y texto corto donde aplique (ej: "5" vs "Ilimitados")
- Columna Premium resaltada con borde/fondo primary
- Responsive: en mobile la tabla hace scroll horizontal

**3. Estructura final de la seccion**
```text
[Titulo + subtitulo corto]
[Currency switcher]
[3 cards compactas: precio + CTA]
[Tabla comparativa completa]
```

### Archivos a modificar
- `src/components/landing/PricingSection.tsx` — reescribir con cards simples + tabla comparativa

