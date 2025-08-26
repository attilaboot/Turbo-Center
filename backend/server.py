from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Turbófeltöltő Adatbázis API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums
class MovementType(str, Enum):
    IN = "IN"
    OUT = "OUT"


# Models
class PartType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PartTypeCreate(BaseModel):
    name: str


class Supplier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SupplierCreate(BaseModel):
    name: str


class Part(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    part_type_id: str
    supplier_id: str
    notes: str = ""  # Új jegyzet mező
    stock_quantity: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PartCreate(BaseModel):
    code: str
    part_type_id: str
    supplier_id: str
    notes: str = ""  # Új jegyzet mező

class PartUpdate(BaseModel):
    code: Optional[str] = None
    part_type_id: Optional[str] = None
    supplier_id: Optional[str] = None
    notes: Optional[str] = None  # Új jegyzet mező


class StockMovement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    part_id: str
    movement_type: MovementType
    quantity: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StockMovementCreate(BaseModel):
    part_id: str
    movement_type: MovementType
    quantity: int


class PartWithDetails(BaseModel):
    id: str
    code: str
    part_type_name: str
    supplier_name: str
    notes: str  # Új jegyzet mező
    stock_quantity: int
    created_at: datetime
    updated_at: datetime


# Alkatrésztípusok endpoints
@api_router.post("/part-types", response_model=PartType)
async def create_part_type(part_type: PartTypeCreate):
    existing = await db.part_types.find_one({"name": part_type.name})
    if existing:
        raise HTTPException(status_code=400, detail="Az alkatrésztípus már létezik")
    
    part_type_obj = PartType(**part_type.dict())
    await db.part_types.insert_one(part_type_obj.dict())
    return part_type_obj

@api_router.get("/part-types", response_model=List[PartType])
async def get_part_types():
    part_types = await db.part_types.find().to_list(1000)
    return [PartType(**pt) for pt in part_types]

@api_router.put("/part-types/{part_type_id}", response_model=PartType)
async def update_part_type(part_type_id: str, part_type: PartTypeCreate):
    existing = await db.part_types.find_one({"id": part_type_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Alkatrésztípus nem található")
    
    await db.part_types.update_one(
        {"id": part_type_id}, 
        {"$set": {"name": part_type.name}}
    )
    
    updated = await db.part_types.find_one({"id": part_type_id})
    return PartType(**updated)

@api_router.delete("/part-types/{part_type_id}")
async def delete_part_type(part_type_id: str):
    # Ellenőrizzük, hogy van-e alkatrész ezzel a típussal
    parts_with_type = await db.parts.find_one({"part_type_id": part_type_id})
    if parts_with_type:
        raise HTTPException(status_code=400, detail="Nem törölhető, mert vannak hozzá tartozó alkatrészek")
    
    result = await db.part_types.delete_one({"id": part_type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alkatrésztípus nem található")
    
    return {"message": "Alkatrésztípus törölve"}


# Beszállítók endpoints
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate):
    existing = await db.suppliers.find_one({"name": supplier.name})
    if existing:
        raise HTTPException(status_code=400, detail="A beszállító már létezik")
    
    supplier_obj = Supplier(**supplier.dict())
    await db.suppliers.insert_one(supplier_obj.dict())
    return supplier_obj

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers():
    suppliers = await db.suppliers.find().to_list(1000)
    return [Supplier(**s) for s in suppliers]

@api_router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier: SupplierCreate):
    existing = await db.suppliers.find_one({"id": supplier_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Beszállító nem található")
    
    await db.suppliers.update_one(
        {"id": supplier_id}, 
        {"$set": {"name": supplier.name}}
    )
    
    updated = await db.suppliers.find_one({"id": supplier_id})
    return Supplier(**updated)

@api_router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str):
    # Ellenőrizzük, hogy van-e alkatrész ezzel a beszállítóval
    parts_with_supplier = await db.parts.find_one({"supplier_id": supplier_id})
    if parts_with_supplier:
        raise HTTPException(status_code=400, detail="Nem törölhető, mert vannak hozzá tartozó alkatrészek")
    
    result = await db.suppliers.delete_one({"id": supplier_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Beszállító nem található")
    
    return {"message": "Beszállító törölve"}


# Alkatrészek endpoints
@api_router.post("/parts", response_model=Part)
async def create_part(part: PartCreate):
    # Ellenőrizzük, hogy létezik-e a part_type és supplier
    part_type = await db.part_types.find_one({"id": part.part_type_id})
    if not part_type:
        raise HTTPException(status_code=400, detail="Alkatrésztípus nem található")
    
    supplier = await db.suppliers.find_one({"id": part.supplier_id})
    if not supplier:
        raise HTTPException(status_code=400, detail="Beszállító nem található")
    
    # Ellenőrizzük, hogy a kód egyedi legyen
    existing_code = await db.parts.find_one({"code": part.code})
    if existing_code:
        raise HTTPException(status_code=400, detail="Ez a kód már használatban van")
    
    part_obj = Part(**part.dict())
    await db.parts.insert_one(part_obj.dict())
    return part_obj

@api_router.get("/parts", response_model=List[PartWithDetails])
async def get_parts(search: Optional[str] = None):
    pipeline = [
        {
            "$lookup": {
                "from": "part_types",
                "localField": "part_type_id",
                "foreignField": "id",
                "as": "part_type"
            }
        },
        {
            "$lookup": {
                "from": "suppliers",
                "localField": "supplier_id",
                "foreignField": "id",
                "as": "supplier"
            }
        },
        {
            "$unwind": "$part_type"
        },
        {
            "$unwind": "$supplier"
        }
    ]
    
    if search:
        pipeline.append({
            "$match": {
                "$or": [
                    {"code": {"$regex": search, "$options": "i"}},
                    {"notes": {"$regex": search, "$options": "i"}},
                    {"part_type.name": {"$regex": search, "$options": "i"}},
                    {"supplier.name": {"$regex": search, "$options": "i"}}
                ]
            }
        })
    
    parts = await db.parts.aggregate(pipeline).to_list(1000)
    
    result = []
    for part in parts:
        result.append(PartWithDetails(
            id=part["id"],
            code=part["code"],
            part_type_name=part["part_type"]["name"],
            supplier_name=part["supplier"]["name"],
            notes=part.get("notes", ""),  # Új jegyzet mező
            stock_quantity=part["stock_quantity"],
            created_at=part["created_at"],
            updated_at=part["updated_at"]
        ))
    
    return result

@api_router.put("/parts/{part_id}", response_model=Part)
async def update_part(part_id: str, part: PartUpdate):
    existing = await db.parts.find_one({"id": part_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Alkatrész nem található")
    
    update_data = {}
    if part.code is not None:
        # Ellenőrizzük, hogy a kód egyedi legyen
        existing_code = await db.parts.find_one({"code": part.code, "id": {"$ne": part_id}})
        if existing_code:
            raise HTTPException(status_code=400, detail="Ez a kód már használatban van")
        update_data["code"] = part.code
    if part.part_type_id is not None:
        part_type = await db.part_types.find_one({"id": part.part_type_id})
        if not part_type:
            raise HTTPException(status_code=400, detail="Alkatrésztípus nem található")
        update_data["part_type_id"] = part.part_type_id
    if part.supplier_id is not None:
        supplier = await db.suppliers.find_one({"id": part.supplier_id})
        if not supplier:
            raise HTTPException(status_code=400, detail="Beszállító nem található")
        update_data["supplier_id"] = part.supplier_id
    if part.notes is not None:
        update_data["notes"] = part.notes
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.parts.update_one({"id": part_id}, {"$set": update_data})
    
    updated = await db.parts.find_one({"id": part_id})
    return Part(**updated)

@api_router.delete("/parts/{part_id}")
async def delete_part(part_id: str):
    result = await db.parts.delete_one({"id": part_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alkatrész nem található")
    
    # Töröljük a kapcsolódó készletmozgásokat is
    await db.stock_movements.delete_many({"part_id": part_id})
    
    return {"message": "Alkatrész törölve"}


# Készletmozgások endpoints
@api_router.post("/stock-movements", response_model=StockMovement)
async def create_stock_movement(movement: StockMovementCreate):
    # Ellenőrizzük, hogy létezik-e az alkatrész
    part = await db.parts.find_one({"id": movement.part_id})
    if not part:
        raise HTTPException(status_code=404, detail="Alkatrész nem található")
    
    # Ellenőrizzük, hogy van-e elég készlet OUT művelethez
    if movement.movement_type == MovementType.OUT:
        if part["stock_quantity"] < movement.quantity:
            raise HTTPException(status_code=400, detail="Nincs elég készlet a kiadáshoz")
    
    # Készletmozgás rögzítése
    movement_obj = StockMovement(**movement.dict())
    await db.stock_movements.insert_one(movement_obj.dict())
    
    # Készlet frissítése
    new_quantity = part["stock_quantity"]
    if movement.movement_type == MovementType.IN:
        new_quantity += movement.quantity
    else:
        new_quantity -= movement.quantity
    
    await db.parts.update_one(
        {"id": movement.part_id},
        {"$set": {"stock_quantity": new_quantity, "updated_at": datetime.utcnow()}}
    )
    
    return movement_obj

@api_router.get("/stock-movements/{part_id}", response_model=List[StockMovement])
async def get_stock_movements(part_id: str):
    movements = await db.stock_movements.find({"part_id": part_id}).sort("created_at", -1).to_list(1000)
    return [StockMovement(**m) for m in movements]


# Inicializáló adatok betöltése
@api_router.post("/initialize-data")
async def initialize_data():
    # Alkatrésztípusok inicializálása
    part_types = [
        "Ansamblu central (CHRA)",
        "Geometria",
        "Set garnitura", 
        "Nozle Ring Cage"
    ]
    
    for pt_name in part_types:
        existing = await db.part_types.find_one({"name": pt_name})
        if not existing:
            pt_obj = PartType(name=pt_name)
            await db.part_types.insert_one(pt_obj.dict())
    
    # Beszállítók inicializálása
    suppliers = ["Melett", "Vallion", "Cer"]
    
    for s_name in suppliers:
        existing = await db.suppliers.find_one({"name": s_name})
        if not existing:
            s_obj = Supplier(name=s_name)
            await db.suppliers.insert_one(s_obj.dict())
    
    return {"message": "Alapadatok inicializálva"}


# Eredeti endpoints megtartása
@api_router.get("/")
async def root():
    return {"message": "Turbófeltöltő Adatbázis API működik"}


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