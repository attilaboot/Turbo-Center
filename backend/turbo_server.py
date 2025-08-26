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
from datetime import datetime, date
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client['turbo_service_db']

# Create the main app
app = FastAPI(title="Turbó Szerviz Kezelő API")
api_router = APIRouter(prefix="/api")


# Enums
class WorkStatus(str, Enum):
    RECEIVED = "RECEIVED"           # Beérkezett
    IN_PROGRESS = "IN_PROGRESS"     # Vizsgálat alatt
    QUOTED = "QUOTED"               # Árajánlat készült
    ACCEPTED = "ACCEPTED"           # Elfogadva
    REJECTED = "REJECTED"           # Elutasítva
    WORKING = "WORKING"             # Javítás alatt
    READY = "READY"                 # Kész
    DELIVERED = "DELIVERED"         # Átvett

class DocumentType(str, Enum):
    IPOS = "IPOS"
    FACT_CHIT = "FACT_CHIT"
    FACT = "FACT"
    BON_F = "BON_F"

class NoteType(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


# Car Database Models
class CarMake(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str                       # BMW, Audi, Mercedes
    logo_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CarMakeCreate(BaseModel):
    name: str
    logo_url: Optional[str] = ""

class CarModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    make_id: str                    # Hivatkozás CarMake-re
    name: str                       # X5, A4, C-Class
    engine_codes: List[str] = []    # Lehetséges motorkódok
    common_turbos: List[str] = []   # Gyakori turbó kódok ehhez a modellhez
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CarModelCreate(BaseModel):
    make_id: str
    name: str
    engine_codes: List[str] = []
    common_turbos: List[str] = []


# Notes Models
class TurboNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    turbo_code: str                 # Turbó kód amire vonatkozik
    note_type: NoteType = NoteType.INFO
    title: str                      # Megjegyzés címe
    description: str                # Részletes leírás
    created_by: str = "System"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

class TurboNoteCreate(BaseModel):
    turbo_code: str
    note_type: NoteType = NoteType.INFO
    title: str
    description: str

class CarNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    car_make: str                   # BMW, Audi
    car_model: str                  # X5, A4
    engine_code: Optional[str] = ""
    note_type: NoteType = NoteType.INFO
    title: str
    description: str
    created_by: str = "System"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

class CarNoteCreate(BaseModel):
    car_make: str
    car_model: str
    engine_code: Optional[str] = ""
    note_type: NoteType = NoteType.INFO
    title: str
    description: str


# Client Models
class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""
    company_name: Optional[str] = ""
    tax_number: Optional[str] = ""
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""
    company_name: Optional[str] = ""
    tax_number: Optional[str] = ""
    notes: Optional[str] = ""

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    company_name: Optional[str] = None
    tax_number: Optional[str] = None
    notes: Optional[str] = None


# Work Process Models
class WorkProcess(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str                       # pl. "Szétszerelés", "Tisztítás"
    category: str                   # pl. "Diagnosis", "Cleaning"
    estimated_time: int = 0         # perc
    base_price: float = 0.0         # LEI
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WorkProcessCreate(BaseModel):
    name: str
    category: str
    estimated_time: int = 0
    base_price: float = 0.0

class WorkOrderProcess(BaseModel):
    process_id: str
    process_name: str
    category: str
    estimated_time: int
    price: float
    selected: bool = False
    notes: str = ""


# Turbo Parts Models
class TurboPart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str                   # C.H.R.A, GEO, ACT, SET.GAR
    part_code: str
    supplier: str
    price: float = 0.0
    in_stock: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TurboPartCreate(BaseModel):
    category: str
    part_code: str
    supplier: str
    price: float = 0.0
    in_stock: bool = True

class WorkOrderPart(BaseModel):
    part_id: str
    part_code: str
    category: str
    supplier: str
    price: float
    selected: bool = False


# Vehicle Models
class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    make: Optional[str] = ""
    model: Optional[str] = ""
    year: Optional[int] = None
    license_plate: Optional[str] = ""
    vin: Optional[str] = ""
    engine_code: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VehicleCreate(BaseModel):
    client_id: str
    make: Optional[str] = ""
    model: Optional[str] = ""
    year: Optional[int] = None
    license_plate: Optional[str] = ""
    vin: Optional[str] = ""
    engine_code: Optional[str] = ""


# Work Order Models
class WorkOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    work_number: str                # NR (43005)
    client_id: str
    vehicle_id: Optional[str] = None
    turbo_code: str                 # 5490-970-0071
    
    # Car details (stored directly in work order)
    car_make: str = ""
    car_model: str = ""
    car_year: Optional[int] = None
    engine_code: Optional[str] = ""
    general_notes: str = ""
    
    # Received date
    received_date: date = Field(default_factory=date.today)
    
    # Parts and processes selection
    parts: List[WorkOrderPart] = []
    processes: List[WorkOrderProcess] = []
    
    # Status checkboxes
    status_passed: bool = False     # OK (PASSED)
    status_refused: bool = False    # REFUZAT
    
    # Prices
    cleaning_price: float = 170.0   # Curatat
    reconditioning_price: float = 170.0 # Recond
    turbo_price: float = 240.0      # Turbo
    
    # Workflow
    status: WorkStatus = WorkStatus.RECEIVED
    quote_sent: bool = False        # OFERTAT
    quote_accepted: bool = False    # ACCEPT
    estimated_completion: Optional[date] = None # TERMEN ESTIMATIV
    
    # Documents
    documents_generated: List[DocumentType] = []
    finalized: bool = False
    client_notified: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkOrderCreate(BaseModel):
    client_id: str
    turbo_code: str
    car_make: str = ""
    car_model: str = ""
    car_year: Optional[int] = None
    engine_code: Optional[str] = ""
    general_notes: str = ""

class WorkOrderUpdate(BaseModel):
    turbo_code: Optional[str] = None
    car_make: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[int] = None
    engine_code: Optional[str] = None
    general_notes: Optional[str] = None
    parts: Optional[List[WorkOrderPart]] = None
    processes: Optional[List[WorkOrderProcess]] = None
    status_passed: Optional[bool] = None
    status_refused: Optional[bool] = None
    cleaning_price: Optional[float] = None
    reconditioning_price: Optional[float] = None
    turbo_price: Optional[float] = None
    status: Optional[WorkStatus] = None
    quote_sent: Optional[bool] = None
    quote_accepted: Optional[bool] = None
    estimated_completion: Optional[date] = None
    finalized: Optional[bool] = None
    client_notified: Optional[bool] = None


class WorkOrderWithDetails(BaseModel):
    id: str
    work_number: str
    client_name: str
    client_phone: str
    car_info: str
    turbo_code: str
    received_date: date
    status: WorkStatus
    total_amount: float
    estimated_completion: Optional[date]
    has_turbo_warning: bool = False
    has_car_warning: bool = False
    created_at: datetime


# Helper function to generate work number
async def generate_work_number() -> str:
    """Generate next work number based on existing entries"""
    pipeline = [
        {"$match": {"work_number": {"$regex": "^[0-9]+$"}}},
        {"$addFields": {"num": {"$toInt": "$work_number"}}},
        {"$sort": {"num": -1}},
        {"$limit": 1}
    ]
    
    result = await db.work_orders.aggregate(pipeline).to_list(1)
    
    if result:
        next_num = result[0]["num"] + 1
    else:
        next_num = 40000  # Starting number
    
    return str(next_num)


# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Turbó Szerviz Kezelő API működik"}


# Car Makes endpoints
@api_router.post("/car-makes", response_model=CarMake)
async def create_car_make(car_make: CarMakeCreate):
    existing = await db.car_makes.find_one({"name": car_make.name})
    if existing:
        raise HTTPException(status_code=400, detail="Ez az autó márka már létezik")
    
    car_make_obj = CarMake(**car_make.dict())
    await db.car_makes.insert_one(car_make_obj.dict())
    return car_make_obj

@api_router.get("/car-makes", response_model=List[CarMake])
async def get_car_makes():
    makes = await db.car_makes.find().sort("name", 1).to_list(1000)
    return [CarMake(**make) for make in makes]

@api_router.get("/car-models/{make_id}", response_model=List[CarModel])
async def get_car_models(make_id: str):
    models = await db.car_models.find({"make_id": make_id}).sort("name", 1).to_list(1000)
    return [CarModel(**model) for model in models]

@api_router.post("/car-models", response_model=CarModel)
async def create_car_model(car_model: CarModelCreate):
    existing = await db.car_models.find_one({"make_id": car_model.make_id, "name": car_model.name})
    if existing:
        raise HTTPException(status_code=400, detail="Ez a modell már létezik ehhez a márkához")
    
    car_model_obj = CarModel(**car_model.dict())
    await db.car_models.insert_one(car_model_obj.dict())
    return car_model_obj


# Notes endpoints
@api_router.post("/turbo-notes", response_model=TurboNote)
async def create_turbo_note(note: TurboNoteCreate):
    note_obj = TurboNote(**note.dict())
    await db.turbo_notes.insert_one(note_obj.dict())
    return note_obj

@api_router.get("/turbo-notes/{turbo_code}", response_model=List[TurboNote])
async def get_turbo_notes(turbo_code: str):
    notes = await db.turbo_notes.find({"turbo_code": turbo_code, "active": True}).to_list(1000)
    return [TurboNote(**note) for note in notes]

@api_router.post("/car-notes", response_model=CarNote)
async def create_car_note(note: CarNoteCreate):
    note_obj = CarNote(**note.dict())
    await db.car_notes.insert_one(note_obj.dict())
    return note_obj

@api_router.get("/car-notes/{car_make}/{car_model}", response_model=List[CarNote])
async def get_car_notes(car_make: str, car_model: str):
    notes = await db.car_notes.find({
        "car_make": car_make, 
        "car_model": car_model, 
        "active": True
    }).to_list(1000)
    return [CarNote(**note) for note in notes]


# Work Process endpoints
@api_router.post("/work-processes", response_model=WorkProcess)
async def create_work_process(process: WorkProcessCreate):
    process_obj = WorkProcess(**process.dict())
    await db.work_processes.insert_one(process_obj.dict())
    return process_obj

@api_router.get("/work-processes", response_model=List[WorkProcess])
async def get_work_processes():
    processes = await db.work_processes.find({"active": True}).sort("category", 1).to_list(1000)
    return [WorkProcess(**process) for process in processes]

@api_router.put("/work-processes/{process_id}", response_model=WorkProcess)
async def update_work_process(process_id: str, process_update: WorkProcessCreate):
    await db.work_processes.update_one(
        {"id": process_id}, 
        {"$set": process_update.dict()}
    )
    updated = await db.work_processes.find_one({"id": process_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Munkafolyamat nem található")
    return WorkProcess(**updated)

@api_router.delete("/work-processes/{process_id}")
async def delete_work_process(process_id: str):
    result = await db.work_processes.update_one(
        {"id": process_id}, 
        {"$set": {"active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Munkafolyamat nem található")
    return {"message": "Munkafolyamat törölve"}


# Turbo Parts endpoints
@api_router.post("/turbo-parts", response_model=TurboPart)
async def create_turbo_part(part: TurboPartCreate):
    existing = await db.turbo_parts.find_one({"part_code": part.part_code})
    if existing:
        raise HTTPException(status_code=400, detail="Ez az alkatrész kód már létezik")
    
    part_obj = TurboPart(**part.dict())
    await db.turbo_parts.insert_one(part_obj.dict())
    return part_obj

@api_router.get("/turbo-parts", response_model=List[TurboPart])
async def get_turbo_parts(category: Optional[str] = None):
    query = {"category": category} if category else {}
    parts = await db.turbo_parts.find(query).sort("category", 1).to_list(1000)
    return [TurboPart(**part) for part in parts]

@api_router.put("/turbo-parts/{part_id}", response_model=TurboPart)
async def update_turbo_part(part_id: str, part_update: TurboPartCreate):
    await db.turbo_parts.update_one(
        {"id": part_id}, 
        {"$set": part_update.dict()}
    )
    updated = await db.turbo_parts.find_one({"id": part_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Alkatrész nem található")
    return TurboPart(**updated)

@api_router.delete("/turbo-parts/{part_id}")
async def delete_turbo_part(part_id: str):
    result = await db.turbo_parts.delete_one({"id": part_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alkatrész nem található")
    return {"message": "Alkatrész törölve"}


# Clients endpoints
@api_router.post("/clients", response_model=Client)
async def create_client(client: ClientCreate):
    # Check if client already exists (by phone)
    existing = await db.clients.find_one({"phone": client.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Ügyfél ezzel a telefonszámmal már létezik")
    
    client_obj = Client(**client.dict())
    await db.clients.insert_one(client_obj.dict())
    return client_obj

@api_router.get("/clients", response_model=List[Client])
async def get_clients(search: Optional[str] = None):
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
                {"company_name": {"$regex": search, "$options": "i"}}
            ]
        }
    else:
        query = {}
    
    clients = await db.clients.find(query).sort("name", 1).to_list(1000)
    return [Client(**client) for client in clients]

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Ügyfél nem található")
    return Client(**client)

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_update: ClientUpdate):
    existing = await db.clients.find_one({"id": client_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Ügyfél nem található")
    
    update_data = {k: v for k, v in client_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.clients.update_one({"id": client_id}, {"$set": update_data})
    
    updated = await db.clients.find_one({"id": client_id})
    return Client(**updated)


# Vehicles endpoints
@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate):
    client = await db.clients.find_one({"id": vehicle.client_id})
    if not client:
        raise HTTPException(status_code=400, detail="Ügyfél nem található")
    
    vehicle_obj = Vehicle(**vehicle.dict())
    await db.vehicles.insert_one(vehicle_obj.dict())
    return vehicle_obj

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(client_id: Optional[str] = None):
    query = {"client_id": client_id} if client_id else {}
    vehicles = await db.vehicles.find(query).to_list(1000)
    return [Vehicle(**vehicle) for vehicle in vehicles]


# Work Orders endpoints
@api_router.post("/work-orders", response_model=WorkOrder)
async def create_work_order(work_order: WorkOrderCreate):
    client = await db.clients.find_one({"id": work_order.client_id})
    if not client:
        raise HTTPException(status_code=400, detail="Ügyfél nem található")
    
    work_number = await generate_work_number()
    
    work_order_obj = WorkOrder(
        work_number=work_number,
        **work_order.dict()
    )
    await db.work_orders.insert_one(work_order_obj.dict())
    return work_order_obj

@api_router.get("/work-orders", response_model=List[WorkOrderWithDetails])
async def get_work_orders(
    status: Optional[WorkStatus] = None,
    client_id: Optional[str] = None,
    search: Optional[str] = None
):
    pipeline = [
        {
            "$lookup": {
                "from": "clients",
                "localField": "client_id",
                "foreignField": "id",
                "as": "client"
            }
        },
        {"$unwind": "$client"},
        {
            "$addFields": {
                "car_info": {
                    "$concat": [
                        "$car_make",
                        " ",
                        "$car_model",
                        {
                            "$cond": {
                                "if": {"$ne": ["$car_year", None]},
                                "then": {
                                    "$concat": [" (", {"$toString": "$car_year"}, ")"]
                                },
                                "else": ""
                            }
                        }
                    ]
                },
                "total_amount": {
                    "$add": ["$cleaning_price", "$reconditioning_price", "$turbo_price"]
                }
            }
        }
    ]
    
    # Check for warnings
    pipeline.append({
        "$lookup": {
            "from": "turbo_notes",
            "localField": "turbo_code",
            "foreignField": "turbo_code",
            "as": "turbo_warnings"
        }
    })
    
    pipeline.append({
        "$lookup": {
            "from": "car_notes",
            "let": {"make": "$car_make", "model": "$car_model"},
            "pipeline": [
                {
                    "$match": {
                        "$expr": {
                            "$and": [
                                {"$eq": ["$car_make", "$$make"]},
                                {"$eq": ["$car_model", "$$model"]}
                            ]
                        }
                    }
                }
            ],
            "as": "car_warnings"
        }
    })
    
    pipeline.append({
        "$addFields": {
            "has_turbo_warning": {"$gt": [{"$size": "$turbo_warnings"}, 0]},
            "has_car_warning": {"$gt": [{"$size": "$car_warnings"}, 0]}
        }
    })
    
    # Add filters
    match_conditions = {}
    if status:
        match_conditions["status"] = status
    if client_id:
        match_conditions["client_id"] = client_id
    if search:
        match_conditions["$or"] = [
            {"work_number": {"$regex": search, "$options": "i"}},
            {"turbo_code": {"$regex": search, "$options": "i"}},
            {"client.name": {"$regex": search, "$options": "i"}},
            {"car_make": {"$regex": search, "$options": "i"}},
            {"car_model": {"$regex": search, "$options": "i"}}
        ]
    
    if match_conditions:
        pipeline.append({"$match": match_conditions})
    
    pipeline.append({"$sort": {"created_at": -1}})
    
    work_orders = await db.work_orders.aggregate(pipeline).to_list(1000)
    
    result = []
    for wo in work_orders:
        result.append(WorkOrderWithDetails(
            id=wo["id"],
            work_number=wo["work_number"],
            client_name=wo["client"]["name"],
            client_phone=wo["client"]["phone"],
            car_info=wo.get("car_info", "").strip(),
            turbo_code=wo["turbo_code"],
            received_date=wo["received_date"],
            status=wo["status"],
            total_amount=wo["total_amount"],
            estimated_completion=wo.get("estimated_completion"),
            has_turbo_warning=wo.get("has_turbo_warning", False),
            has_car_warning=wo.get("has_car_warning", False),
            created_at=wo["created_at"]
        ))
    
    return result

@api_router.get("/work-orders/{work_order_id}", response_model=WorkOrder)
async def get_work_order(work_order_id: str):
    work_order = await db.work_orders.find_one({"id": work_order_id})
    if not work_order:
        raise HTTPException(status_code=404, detail="Munkalap nem található")
    return WorkOrder(**work_order)

@api_router.put("/work-orders/{work_order_id}", response_model=WorkOrder)
async def update_work_order(work_order_id: str, work_order_update: WorkOrderUpdate):
    existing = await db.work_orders.find_one({"id": work_order_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Munkalap nem található")
    
    update_data = {k: v for k, v in work_order_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.work_orders.update_one({"id": work_order_id}, {"$set": update_data})
    
    updated = await db.work_orders.find_one({"id": work_order_id})
    return WorkOrder(**updated)


# Initialize default data
@api_router.post("/initialize-data")
async def initialize_data():
    # Initialize car makes
    car_makes = [
        "BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Ford", 
        "Peugeot", "Renault", "Opel", "Citroen", "Skoda"
    ]
    
    for make_name in car_makes:
        existing = await db.car_makes.find_one({"name": make_name})
        if not existing:
            make_obj = CarMake(name=make_name)
            await db.car_makes.insert_one(make_obj.dict())
    
    # Initialize work processes
    default_processes = [
        {"name": "Szétszerelés", "category": "Disassembly", "estimated_time": 60, "base_price": 80.0},
        {"name": "Tisztítás", "category": "Cleaning", "estimated_time": 90, "base_price": 120.0},
        {"name": "Diagnosztika", "category": "Diagnosis", "estimated_time": 45, "base_price": 60.0},
        {"name": "Alkatrész csere", "category": "Repair", "estimated_time": 120, "base_price": 150.0},
        {"name": "Összeszerelés", "category": "Assembly", "estimated_time": 90, "base_price": 100.0},
        {"name": "Tesztelés", "category": "Testing", "estimated_time": 30, "base_price": 40.0},
    ]
    
    for process_data in default_processes:
        existing = await db.work_processes.find_one({"name": process_data["name"]})
        if not existing:
            process_obj = WorkProcess(**process_data)
            await db.work_processes.insert_one(process_obj.dict())
    
    # Initialize turbo parts
    default_parts = [
        {"category": "C.H.R.A", "part_code": "1303-090-400", "supplier": "Melett", "price": 450.0},
        {"category": "C.H.R.A", "part_code": "1303-090-401", "supplier": "Vallion", "price": 420.0},
        {"category": "GEO", "part_code": "5306-016-071-0001", "supplier": "Melett", "price": 85.0},
        {"category": "GEO", "part_code": "5306-016-072-0001", "supplier": "Vallion", "price": 80.0},
        {"category": "ACT", "part_code": "2061-016-006", "supplier": "Melett", "price": 120.0},
        {"category": "ACT", "part_code": "2061-016-007", "supplier": "Vallion", "price": 115.0},
        {"category": "SET.GAR", "part_code": "K7-110690", "supplier": "Melett", "price": 25.0},
        {"category": "SET.GAR", "part_code": "K7-110691", "supplier": "Vallion", "price": 22.0},
    ]
    
    for part_data in default_parts:
        existing = await db.turbo_parts.find_one({"part_code": part_data["part_code"]})
        if not existing:
            part_obj = TurboPart(**part_data)
            await db.turbo_parts.insert_one(part_obj.dict())
    
    return {"message": "Alapadatok inicializálva"}


# Include router
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