"""
Demo data seed script for BhumiSetu.
Seeds the database with realistic Indian land records for hackathon demo.

Usage:
    python -m backend.services.demo_data
"""

import asyncio
from datetime import datetime
from backend.config.database import engine, AsyncSessionLocal, Base
from backend.models.land_record import LandRecord, RecordType, AreaUnit, LandType, ValidationStatus
from backend.models.user import User

# Import all models so tables are registered
from backend.models import audit_log, dispute, validation_report  # noqa: F401


DEMO_USERS = [
    {
        "id": "USR-FARMER-01",
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "role": "FARMER",
        "state_code": "UP",
        "district": "Lucknow",
        "is_active": True,
    },
    {
        "id": "USR-FARMER-02",
        "name": "Sunita Devi",
        "phone": "9876543211",
        "role": "FARMER",
        "state_code": "MH",
        "district": "Pune",
        "is_active": True,
    },
    {
        "id": "USR-PATWARI-01",
        "name": "Ajay Singh",
        "phone": "9876543220",
        "role": "PATWARI",
        "state_code": "UP",
        "district": "Lucknow",
        "is_active": True,
    },
    {
        "id": "USR-TEHSILDAR-01",
        "name": "Priya Sharma",
        "phone": "9876543230",
        "role": "TEHSILDAR",
        "state_code": "UP",
        "district": "Lucknow",
        "is_active": True,
    },
    {
        "id": "USR-ADMIN-01",
        "name": "Vikram Patel",
        "phone": "9876543240",
        "role": "ADMIN",
        "state_code": "UP",
        "district": "Lucknow",
        "is_active": True,
    },
]

DEMO_RECORDS = [
    {
        "id": "LR-UP-001",
        "record_type": RecordType.KHASRA,
        "state_code": "UP",
        "district": "Lucknow",
        "tehsil": "Mohanlalganj",
        "village": "Rampur Kalan",
        "khasra_number": "45/12",
        "khata_number": "78",
        "owner_name": "Ramesh Kumar",
        "father_husband_name": "Late Shri Harish Kumar",
        "area_value": 2.5,
        "area_unit": AreaUnit.BIGHA,
        "area_normalized_sqm": 2107.5,
        "land_type": LandType.AGRICULTURAL,
        "boundaries_json": {"north": "Suresh Kumar plot", "south": "Village road", "east": "Mahesh plot", "west": "Nala"},
        "is_urban": False,
        "location_lat": 26.75,
        "location_lng": 80.95,
        "ocr_confidence_score": 0.92,
        "validation_status": ValidationStatus.VALIDATED,
        "digitized_by": "USR-PATWARI-01",
    },
    {
        "id": "LR-UP-002",
        "record_type": RecordType.KHATAUNI,
        "state_code": "UP",
        "district": "Kanpur",
        "tehsil": "Ghatampur",
        "village": "Sarsaul",
        "khasra_number": "78/3",
        "khata_number": "112",
        "owner_name": "Arvind Yadav",
        "father_husband_name": "Shri Om Prakash Yadav",
        "area_value": 4.0,
        "area_unit": AreaUnit.BIGHA,
        "area_normalized_sqm": 3372.0,
        "land_type": LandType.AGRICULTURAL,
        "boundaries_json": {"north": "Gram Sabha land", "south": "Rinku plot", "east": "Canal", "west": "Rajesh plot"},
        "is_urban": False,
        "location_lat": 26.45,
        "location_lng": 80.35,
        "ocr_confidence_score": 0.87,
        "validation_status": ValidationStatus.FLAGGED,
        "digitized_by": "USR-PATWARI-01",
    },
    {
        "id": "LR-MH-001",
        "record_type": RecordType.SEVEN_TWELVE,
        "state_code": "MH",
        "district": "Pune",
        "tehsil": "Haveli",
        "village": "Wagholi",
        "survey_number": "42/1A",
        "plot_number": "42",
        "owner_name": "Sunita Devi Patil",
        "father_husband_name": "Shri Rajendra Patil",
        "area_value": 1.5,
        "area_unit": AreaUnit.ACRE,
        "area_normalized_sqm": 6070.29,
        "land_type": LandType.AGRICULTURAL,
        "boundaries_json": {"north": "Survey 41", "south": "Village road", "east": "Survey 43", "west": "Nala"},
        "is_urban": False,
        "location_lat": 18.58,
        "location_lng": 73.98,
        "ocr_confidence_score": 0.95,
        "validation_status": ValidationStatus.VALIDATED,
        "digitized_by": "USR-PATWARI-01",
    },
    {
        "id": "LR-RJ-001",
        "record_type": RecordType.JAMABANDI,
        "state_code": "RJ",
        "district": "Jaipur",
        "tehsil": "Sanganer",
        "village": "Bagru",
        "khasra_number": "156",
        "khata_number": "89",
        "owner_name": "Govind Singh Shekhawat",
        "father_husband_name": "Shri Bhawani Singh",
        "area_value": 3.0,
        "area_unit": AreaUnit.BIGHA,
        "area_normalized_sqm": 2529.0,
        "land_type": LandType.AGRICULTURAL,
        "boundaries_json": {"north": "Highway NH-8", "south": "Mangi Lal plot", "east": "Government land", "west": "Canal"},
        "is_urban": False,
        "location_lat": 26.82,
        "location_lng": 75.75,
        "ocr_confidence_score": 0.78,
        "validation_status": ValidationStatus.PENDING,
        "digitized_by": "USR-PATWARI-01",
    },
    {
        "id": "LR-DL-001",
        "record_type": RecordType.SALE_DEED,
        "state_code": "DL",
        "district": "South Delhi",
        "tehsil": "Saket",
        "village": "Saket",
        "plot_number": "B-42",
        "survey_number": "DL-SD-B42",
        "owner_name": "Amit Gupta",
        "father_husband_name": "Shri Rajesh Gupta",
        "area_value": 1200.0,
        "area_unit": AreaUnit.SQFT,
        "area_normalized_sqm": 111.48,
        "land_type": LandType.RESIDENTIAL,
        "registration_number": "DL-2024-REG-45678",
        "stamp_duty": 450000.0,
        "transaction_type": "SALE",
        "transaction_date": datetime(2024, 3, 15),
        "boundaries_json": {"north": "Plot B-41", "south": "Plot B-43", "east": "Main Road", "west": "Park"},
        "is_urban": True,
        "location_lat": 28.52,
        "location_lng": 77.21,
        "ocr_confidence_score": 0.96,
        "validation_status": ValidationStatus.VALIDATED,
        "digitized_by": "USR-PATWARI-01",
    },
]


async def seed_database():
    """Seed the database with demo data."""
    print("Seeding BhumiSetu demo database...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("  [OK] Tables created")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, func
        result = await session.execute(select(func.count()).select_from(LandRecord))
        count = result.scalar()
        if count and count > 0:
            print(f"  [INFO] Database already has {count} records. Skipping seed.")
            return

        for user_data in DEMO_USERS:
            user = User(**user_data)
            session.add(user)
        print(f"  [OK] {len(DEMO_USERS)} users seeded")

        for record_data in DEMO_RECORDS:
            record = LandRecord(**record_data)
            session.add(record)
        print(f"  [OK] {len(DEMO_RECORDS)} land records seeded")

        await session.commit()

    print("Demo data seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
