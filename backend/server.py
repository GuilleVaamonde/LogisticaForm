from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Uruguay departments
DEPARTAMENTOS_URUGUAY = [
    "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno",
    "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo",
    "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto",
    "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
]

# Motivos de envío
MOTIVOS_ENVIO = ["Entrega", "Retiro y Entrega", "Retiro"]


# Define Models
class EnvioBase(BaseModel):
    ticket: str = Field(..., min_length=1, description="Número de ticket para rastreo")
    calle: str = Field(..., min_length=1, description="Nombre de la calle")
    numero: str = Field(..., min_length=1, description="Número de casa")
    apto: Optional[str] = Field(default="", description="Número de apartamento")
    esquina: Optional[str] = Field(default="", description="Esquina de referencia")
    motivo: str = Field(..., description="Motivo del envío")
    departamento: str = Field(..., description="Departamento de Uruguay")
    comentarios: Optional[str] = Field(default="", description="Comentarios adicionales")
    telefono: str = Field(..., min_length=1, description="Número de teléfono")
    contacto: str = Field(..., min_length=1, description="Nombre de contacto")


class EnvioCreate(EnvioBase):
    pass


class Envio(EnvioBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fecha_carga: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class EnvioResponse(BaseModel):
    id: str
    ticket: str
    calle: str
    numero: str
    apto: str
    esquina: str
    motivo: str
    departamento: str
    comentarios: str
    telefono: str
    contacto: str
    fecha_carga: str


def create_excel_workbook(envios: List[dict]) -> BytesIO:
    """Create an Excel workbook with envio data"""
    wb = Workbook()
    ws = wb.active
    ws.title = "Envíos"
    
    # Define styles
    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(start_color="C91A25", end_color="C91A25", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center")
    
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )
    
    # Headers
    headers = [
        "Ticket", "Fecha/Hora", "Contacto", "Teléfono", "Calle", 
        "Número", "Apto", "Esquina", "Departamento", "Motivo", "Comentarios"
    ]
    
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thin_border
    
    # Data rows
    for row, envio in enumerate(envios, 2):
        data = [
            envio.get('ticket', ''),
            envio.get('fecha_carga', ''),
            envio.get('contacto', ''),
            envio.get('telefono', ''),
            envio.get('calle', ''),
            envio.get('numero', ''),
            envio.get('apto', ''),
            envio.get('esquina', ''),
            envio.get('departamento', ''),
            envio.get('motivo', ''),
            envio.get('comentarios', '')
        ]
        for col, value in enumerate(data, 1):
            cell = ws.cell(row=row, column=col, value=value)
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center")
    
    # Adjust column widths
    column_widths = [15, 22, 20, 15, 25, 10, 10, 20, 15, 18, 30]
    for i, width in enumerate(column_widths, 1):
        ws.column_dimensions[chr(64 + i)].width = width
    
    # Save to BytesIO
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output


# Routes
@api_router.get("/")
async def root():
    return {"message": "API de Gestión de Envíos - Uruguay"}


@api_router.get("/departamentos")
async def get_departamentos():
    """Get list of Uruguay departments"""
    return {"departamentos": DEPARTAMENTOS_URUGUAY}


@api_router.get("/motivos")
async def get_motivos():
    """Get list of shipping motives"""
    return {"motivos": MOTIVOS_ENVIO}


@api_router.post("/envios", response_model=EnvioResponse)
async def create_envio(envio_data: EnvioCreate):
    """Create a new envio"""
    # Validate departamento
    if envio_data.departamento not in DEPARTAMENTOS_URUGUAY:
        raise HTTPException(status_code=400, detail="Departamento inválido")
    
    # Validate motivo
    if envio_data.motivo not in MOTIVOS_ENVIO:
        raise HTTPException(status_code=400, detail="Motivo inválido")
    
    # Create envio object
    envio = Envio(**envio_data.model_dump())
    doc = envio.model_dump()
    
    # Insert into MongoDB
    await db.envios.insert_one(doc)
    
    return EnvioResponse(**doc)


@api_router.get("/envios", response_model=List[EnvioResponse])
async def get_envios(limit: int = 100, skip: int = 0):
    """Get all envios ordered by date"""
    envios = await db.envios.find(
        {}, 
        {"_id": 0}
    ).sort("fecha_carga", -1).skip(skip).limit(limit).to_list(limit)
    
    return [EnvioResponse(**e) for e in envios]


@api_router.get("/envios/count")
async def get_envios_count():
    """Get total count of envios"""
    count = await db.envios.count_documents({})
    return {"count": count}


@api_router.get("/envios/{envio_id}", response_model=EnvioResponse)
async def get_envio(envio_id: str):
    """Get a single envio by ID"""
    envio = await db.envios.find_one({"id": envio_id}, {"_id": 0})
    if not envio:
        raise HTTPException(status_code=404, detail="Envío no encontrado")
    return EnvioResponse(**envio)


@api_router.delete("/envios/{envio_id}")
async def delete_envio(envio_id: str):
    """Delete an envio"""
    result = await db.envios.delete_one({"id": envio_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Envío no encontrado")
    return {"message": "Envío eliminado exitosamente"}


@api_router.get("/envios/export/excel")
async def export_all_envios_excel():
    """Export all envios to Excel"""
    envios = await db.envios.find({}, {"_id": 0}).sort("fecha_carga", -1).to_list(10000)
    
    if not envios:
        raise HTTPException(status_code=404, detail="No hay envíos para exportar")
    
    excel_file = create_excel_workbook(envios)
    
    filename = f"envios_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@api_router.get("/envios/{envio_id}/excel")
async def export_single_envio_excel(envio_id: str):
    """Export a single envio to Excel"""
    envio = await db.envios.find_one({"id": envio_id}, {"_id": 0})
    
    if not envio:
        raise HTTPException(status_code=404, detail="Envío no encontrado")
    
    excel_file = create_excel_workbook([envio])
    
    filename = f"envio_{envio.get('ticket', envio_id)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
