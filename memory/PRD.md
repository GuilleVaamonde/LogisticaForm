# PRD - Sistema de Envíos Uruguay (Getnet)

## Problema Original
Sistema de gestión de envíos con autenticación, roles de usuario, estados de órdenes y notificaciones WhatsApp.

## Campos del Formulario
- Ticket (rastreo), Calle, Número, Apto, Esquina
- Motivo (Entrega, Retiro y Entrega, Retiro)
- Departamento (19 de Uruguay)
- Comentarios, Teléfono, Contacto

## User Personas
- **Admin**: Gestiona usuarios, ve logs de mensajes, ve todos los envíos
- **Agente**: Crea y modifica envíos completos
- **Repartidor**: Ve envíos y cambia estados (asignar, entregar, no entregar)

## Estados de Envío
1. **Ingresada** - Orden creada (no envía mensaje)
2. **Asignado a courier** - Repartidor retira (envía WhatsApp)
3. **Entregado** - Completado con datos receptor + foto opcional (envía WhatsApp)
4. **No entregado** - No se pudo entregar con comentario + foto opcional (envía WhatsApp)

## Implementado

### Fase 1 - MVP (28/12/2025)
- ✅ Formulario completo con todos los campos
- ✅ Exportación Excel individual y masiva
- ✅ Diseño Swiss Logistics (rojo/blanco/gris)

### Fase 2 - Autenticación y Roles
- ✅ Sistema JWT con roles (admin/agente/repartidor)
- ✅ Login/logout con persistencia
- ✅ Admin puede crear/eliminar usuarios
- ✅ Usuario admin por defecto: admin / admin123

### Fase 3 - Estados y WhatsApp
- ✅ Estados: Ingresada → Asignado a courier → Entregado/No entregado
- ✅ Historial de cambios de estado con timestamp
- ✅ Panel exclusivo para repartidores
- ✅ Registro de receptor (nombre + cédula) al entregar
- ✅ Mensajes WhatsApp SIMULADOS (guardados en DB)
- ✅ Log de mensajes visible para admin

### Fase 4 - Filtros y Mejoras
- ✅ Filtros por departamento, motivo, estado
- ✅ Filtros por rango de fechas con calendario
- ✅ Campo "Creado por" en envíos
- ✅ Link de rastreo público para clientes
- ✅ Copiar link de rastreo al portapapeles
- ✅ Branding Getnet (logo, colores, favicon, título)

### Fase 5 - No Entregado y UI (15/01/2026)
- ✅ Estado "No entregado" con comentario y foto opcional
- ✅ Modal de detalles muestra info de "No entregado" (motivo, quien reportó, foto)
- ✅ Scroll horizontal en tabla para pantallas pequeñas
- ✅ Vista responsive con tarjetas en móvil

## Stack Técnico
- Frontend: React + Shadcn UI + Tailwind CSS
- Backend: FastAPI + Motor (MongoDB async)
- Auth: JWT + bcrypt
- Excel: openpyxl
- Imágenes: Base64 en MongoDB

## SIMULADO (Pendiente integración real)
- WhatsApp Business API - mensajes guardados pero no enviados

## Backlog

### P1 - Alta Prioridad
- Integrar WhatsApp Business API real
- Búsqueda por ticket/contacto

### P2 - Media Prioridad
- Dashboard con estadísticas de entregas
- Edición de envíos existentes
- Paginación en tablas

### Futuro
- Integración Google Maps para verificación de direcciones
- Notificaciones push
- Reportes PDF

## Credenciales de Prueba
- **Admin**: admin / admin123
- **Repartidor**: repartidor1 / rep123

## Última Actualización: 15/01/2026
- Corregido scroll horizontal en tabla de envíos
- Agregado soporte para foto y comentario en estado "No entregado"
- Modal de detalles muestra información completa de estados finales
