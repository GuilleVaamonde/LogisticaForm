# PRD - Sistema de Envíos Uruguay

## Problema Original
Crear un formulario web para carga de datos de clientes destinados a envíos, con diseño simple y profesional. Almacenamiento en Excel (.xlsx) con fecha/hora automática.

## Campos del Formulario
- Ticket (rastreo)
- Calle, Número, Apto, Esquina
- Motivo (Entrega, Retiro y Entrega, Retiro)
- Departamento (19 de Uruguay)
- Comentarios
- Teléfono, Contacto

## User Personas
- **Operador de logística**: Carga datos de clientes para envíos diarios
- **Supervisor**: Descarga reportes Excel para control

## Requisitos Core
- Validación de campos obligatorios
- Interfaz responsive (móvil y desktop)
- Exportación Excel individual y masiva
- Fecha/hora automática de carga

## Implementado (28/12/2025)
- ✅ Formulario completo con todos los campos
- ✅ Validación de campos obligatorios
- ✅ Select con 19 departamentos de Uruguay
- ✅ Select con 3 motivos de envío
- ✅ API REST completa (CRUD + Export Excel)
- ✅ Tabla de registros recientes
- ✅ Exportación Excel individual y masiva
- ✅ Diseño Swiss Logistics (rojo #C91A25, blanco, gris)
- ✅ Tipografía: Chivo, Manrope, JetBrains Mono
- ✅ 100% responsive

## Stack Técnico
- Frontend: React + Shadcn UI + Tailwind CSS
- Backend: FastAPI + Motor (MongoDB async)
- Excel: openpyxl

## Backlog (P1/P2)
- P1: Búsqueda y filtros en tabla
- P1: Paginación para grandes volúmenes
- P2: Edición de registros existentes
- P2: Historial de cambios

## Próximas Acciones
1. Agregar búsqueda por ticket o contacto
2. Filtros por departamento/motivo
3. Paginación en tabla de registros
