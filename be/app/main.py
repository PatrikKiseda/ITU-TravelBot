from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, text
from app.api.v1.routes import router as api_v1_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import SessionCookieMiddleware, SimpleRateLimiter
from app.core.request_id import RequestIdMiddleware
from app.core.errors import add_exception_handlers
from app.core.deps import get_engine, get_db

# Ensure models are imported so metadata is registered
from app.models import session as _m_session  # noqa: F401
from app.models import agency_offer as _m_agency_offer  # noqa: F401
from app.models import customer_response as _m_customer_response  # noqa: F401
from app.models import customer_order as _m_customer_order  # noqa: F401
from app.models import customer_note as _m_customer_note  # noqa: F401
from app.models import tag as _m_tag  # noqa: F401


setup_logging()
app = FastAPI(title="ITU Travel Backend")

# CORS
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.allowed_origins_list(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Request ID
app.add_middleware(RequestIdMiddleware)

# Session cookie + rate limit for LLM endpoints
app.add_middleware(SessionCookieMiddleware)
app.add_middleware(SimpleRateLimiter, limit_per_minute=settings.RATE_LIMIT_PER_MINUTE)

# Error handlers
add_exception_handlers(app)

# Routes
app.include_router(api_v1_router)


@app.on_event("startup")
async def on_startup():
	engine = get_engine()
	SQLModel.metadata.create_all(engine)
	
	# #region agent log
	import json
	import os
	log_path = r"c:\Users\Pato\Desktop\skola\7sem\ITU\.cursor\debug.log"
	try:
		with open(log_path, "a", encoding="utf-8") as f:
			f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:50","message":"Database startup - checking customer_order table schema","data":{"action":"create_all_called"},"timestamp":int(__import__("time").time()*1000)}) + "\n")
	except: pass
	# #endregion
	
	# Migrate customer_order table to add new columns if they don't exist
	from sqlmodel import text
	with Session(engine) as session:
		try:
			# Check if table exists first
			table_check = session.exec(text("SELECT name FROM sqlite_master WHERE type='table' AND name='customer_order'")).first()
			if not table_check:
				# #region agent log
				try:
					with open(log_path, "a", encoding="utf-8") as f:
						f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:65","message":"customer_order table does not exist, will be created by create_all","data":{},"timestamp":int(__import__("time").time()*1000)}) + "\n")
				except: pass
				# #endregion
			else:
				# Get existing columns from PRAGMA table_info
				result = session.exec(text("PRAGMA table_info(customer_order)"))
				columns = set()
				for row in result:
					# PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
					# Access by index since SQLModel returns Row objects
					if hasattr(row, '__getitem__'):
						col_name = row[1] if len(row) > 1 else str(row)
					else:
						col_name = getattr(row, 'name', str(row))
					columns.add(col_name)
				
				# #region agent log
				try:
					with open(log_path, "a", encoding="utf-8") as f:
						f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:78","message":"Existing customer_order columns","data":{"columns":list(columns)},"timestamp":int(__import__("time").time()*1000)}) + "\n")
				except: pass
				# #endregion
				
				# Add missing columns
				required_columns = {
					"special_requirements": "TEXT",
					"is_gift": "INTEGER DEFAULT 0",
					"gift_recipient_email": "TEXT",
					"gift_recipient_name": "TEXT",
					"gift_sender_name": "TEXT",
					"gift_note": "TEXT",
					"gift_subject": "TEXT"
				}
				
				for col_name, col_type in required_columns.items():
					if col_name not in columns:
						try:
							session.exec(text(f"ALTER TABLE customer_order ADD COLUMN {col_name} {col_type}"))
							session.commit()
							# #region agent log
							try:
								with open(log_path, "a", encoding="utf-8") as f:
									f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:95","message":"Added missing column","data":{"column":col_name,"type":col_type},"timestamp":int(__import__("time").time()*1000)}) + "\n")
							except: pass
							# #endregion
						except Exception as e:
							# #region agent log
							try:
								with open(log_path, "a", encoding="utf-8") as f:
									f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:102","message":"Failed to add column","data":{"column":col_name,"error":str(e),"error_type":type(e).__name__},"timestamp":int(__import__("time").time()*1000)}) + "\n")
							except: pass
							# #endregion
		except Exception as e:
			# #region agent log
			try:
				with open(log_path, "a", encoding="utf-8") as f:
					f.write(json.dumps({"sessionId":"debug-session","runId":"startup","hypothesisId":"A","location":"main.py:110","message":"Migration error","data":{"error":str(e),"error_type":type(e).__name__},"timestamp":int(__import__("time").time()*1000)}) + "\n")
			except: pass
			# #endregion


@app.get("/health")
async def health(db: Session = Depends(get_db)):
	from sqlmodel import text
	try:
		db.exec(text("SELECT 1"))
		db_status = "ok"
	except Exception:
		db_status = "error"
	
	return {
		"data": {
			"status": "ok",
			"database": db_status,
		},
		"error": None
	}
