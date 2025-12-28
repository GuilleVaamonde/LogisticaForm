# PRD - Sistema de Envíos Uruguay

## Problema Original
Sistema de gestión de envíos con autenticación, roles de usuario, estados de órdenes y notificaciones WhatsApp.

## Campos del Formulario
- Ticket (rastreo), Calle, Número, Apto, Esquina
- Motivo (Entrega, Retiro y Entrega, Retiro)
- Departamento (19 de Uruguay)
- Comentarios, Teléfono, Contacto

## User Personas
- **Admin**: Gestiona usuarios y ve logs de mensajes
- **Agente**: Crea y modifica envíos completos
- **Repartidor**: Ve envíos y cambia estados

## Estados de Envío
1. **Ingresada** - Orden creada (no envía mensaje)
2. **Asignado a courier** - Repartidor retira (envía WhatsApp)
3. **Entregado** - Completado con datos receptor (envía WhatsApp)

## Implementado (28/12/2025)
### Fase 1 - MVP
- ✅ Formulario completo con todos los campos
- ✅ Exportación Excel individual y masiva
- ✅ Diseño Swiss Logistics (rojo/blanco/gris)

### Fase 2 - Autenticación y Roles
- ✅ Sistema JWT con roles (admin/agente/repartidor)
- ✅ Login/logout con persistencia
- ✅ Admin puede crear/eliminar usuarios
- ✅ Usuario admin por defecto: admin / admin123

### Fase 3 - Estados y WhatsApp
- ✅ Estados: Ingresada → Asignado a courier → Entregado
- ✅ Historial de cambios de estado con timestamp
- ✅ Panel exclusivo para repartidores
- ✅ Registro de receptor (nombre + cédula) al entregar
- ✅ Mensajes WhatsApp SIMULADOS (guardados en DB)
- ✅ Log de mensajes visible para admin

### Fase 4 - Filtros
- ✅ Filtros por departamento, motivo, estado
- ✅ Filtros por rango de fechas

## Stack Técnico
- Frontend: React + Shadcn UI + Tailwind CSS
- Backend: FastAPI + Motor (MongoDB async)
- Auth: JWT + bcrypt
- Excel: openpyxl

## SIMULADO (Pendiente integración real)
- WhatsApp Business API - mensajes guardados pero no enviados

## Backlog (P1/P2)
- P1: Integrar WhatsApp Business API real
- P1: Búsqueda por ticket/contacto
- P2: Edición de envíos existentes
- P2: Dashboard con estadísticas

## Próximas Acciones
1. Conectar WhatsApp Business API real
2. Agregar búsqueda global
3. Dashboard con métricas de entregas
