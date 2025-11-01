import os
import tempfile
import pytest
from datetime import date
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient
from app.main import app
from app.core.deps import get_db, get_engine
from app.services.agency_offer_service import AgencyOfferService
from app.services.customer_offer_service import CustomerOfferService
from app.services.customer_accepted_service import CustomerAcceptedService
from app.services.customer_order_service import CustomerOrderService
from app.repositories.session_repo import SessionRepository
from app.models import agency_offer as _m1  # noqa
from app.models import customer_response as _m2  # noqa
from app.models import customer_order as _m3  # noqa
from app.models import customer_note as _m4  # noqa
from app.models import session as _m5  # noqa


@pytest.fixture
def test_db():
	"""Create a temporary in-memory SQLite database for testing."""
	fd, path = tempfile.mkstemp()
	os.close(fd)
	engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
	SQLModel.metadata.create_all(engine)
	return engine


@pytest.fixture
def test_client(test_db):
	"""Create a TestClient with database override."""
	def override_get_db():
		session = Session(test_db)
		try:
			yield session
		finally:
			session.close()
	
	app.dependency_overrides[get_db] = override_get_db
	client = TestClient(app)
	yield client
	app.dependency_overrides.clear()


@pytest.fixture
def agent_session_id():
	return "agent"  # Use "agent" as the single agent session ID


@pytest.fixture
def customer_session_id():
	return "test-customer-456"


@pytest.fixture
def sample_offer_data():
	return {
		"destination_name": "Valencia",
		"country": "Spain",
		"origin": "Prague",
		"destination_where_to": "Valencia",
		"capacity_available": 10,
		"capacity_total": 10,
		"date_from": "2025-06-01",
		"date_to": "2025-06-08",
		"season": "summer",
		"type_of_stay": ["beach"],
		"price_housing": 500,
		"price_food": 200,
		"price_transport_mode": "plane",
		"price_transport_amount": 300,
		"short_description": "Test offer",
	}


def create_test_offer(client, agent_session_id, offer_data):
	"""Helper to create an offer and return its ID."""
	response = client.post("/api/v1/agent/offers", json=offer_data, cookies={"sessionId": agent_session_id})
	assert response.status_code == 200
	return response.json()["data"]["id"]


# Unit Tests
def test_agency_offer_create(test_db):
	session_id = "test-agent"
	repo = SessionRepository()
	with Session(test_db) as db:
		repo.ensure(db, session_id)
		ss = AgencyOfferService()
		offer_data = {
			"destination_name": "Valencia",
			"country": "Spain",
			"origin": "Prague",
			"destination_where_to": "Valencia",
			"capacity_available": 10,
			"capacity_total": 10,
			"date_from": date(2025, 6, 1),
			"date_to": date(2025, 6, 8),
			"season": "summer",
			"type_of_stay": ["beach"],
			"price_housing": 500,
			"price_food": 200,
			"price_transport_mode": "plane",
			"price_transport_amount": 300,
			"short_description": "Test offer",
		}
		offer = ss.create(db, session_id, offer_data)
		assert offer.id is not None
		assert offer.destination_name == "Valencia"


def test_validation_date_to_before_date_from(test_db):
	session_id = "test-agent"
	repo = SessionRepository()
	with Session(test_db) as db:
		repo.ensure(db, session_id)
		ss = AgencyOfferService()
		offer_data = {
			"destination_name": "Test",
			"country": "Test",
			"origin": "Prague",
			"destination_where_to": "Test",
			"capacity_available": 10,
			"capacity_total": 10,
			"date_from": date(2025, 6, 8),
			"date_to": date(2025, 6, 1),
			"season": "summer",
			"type_of_stay": ["beach"],
			"price_housing": 500,
			"price_food": 200,
			"price_transport_mode": "plane",
			"price_transport_amount": 300,
			"short_description": "Test",
		}
		from app.core.validation import ValidationError
		try:
			ss.create(db, session_id, offer_data)
			assert False, "Should have raised ValidationError"
		except ValidationError as e:
			assert "date_to must be after date_from" in str(e)


# Flow Tests
def test_flow_agent_creates_customer_accepts(test_client, agent_session_id, customer_session_id, sample_offer_data):
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	response = test_client.get("/api/v1/customer/offers", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	offers = response.json()["data"]
	assert any(o["id"] == offer_id for o in offers)
	
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.get("/api/v1/customer/accepted", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	accepted = response.json()["data"]
	assert any(o["id"] == offer_id for o in accepted)


def test_flow_customer_rejects_hidden(test_client, agent_session_id, customer_session_id, sample_offer_data):
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/reject", json={}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.get("/api/v1/customer/offers", cookies={"sessionId": customer_session_id})
	offers = response.json()["data"]
	assert not any(o["id"] == offer_id for o in offers)
	
	response = test_client.get("/api/v1/customer/accepted", cookies={"sessionId": customer_session_id})
	accepted = response.json()["data"]
	assert not any(o["id"] == offer_id for o in accepted)


def test_flow_full_order(test_client, agent_session_id, customer_session_id, sample_offer_data):
	sample_offer_data["capacity_available"] = 5
	sample_offer_data["capacity_total"] = 5
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/note", json={"note_text": "Excited!"}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/confirm", json={"number_of_people": 2, "selected_transport_mode": "plane"}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	order_id = response.json()["data"]["id"]
	
	response = test_client.get(f"/api/v1/customer/orders/{order_id}", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	details = response.json()["data"]
	assert details["remaining_capacity"] == 3
	
	response = test_client.post(f"/api/v1/customer/orders/{order_id}/confirm", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	assert response.json()["data"]["order_status"] == "CONFIRMED"
	
	response = test_client.get("/api/v1/customer/orders", cookies={"sessionId": customer_session_id})
	orders = response.json()["data"]
	assert any(o["id"] == order_id for o in orders)


def test_flow_capacity_validation(test_client, agent_session_id, customer_session_id, sample_offer_data):
	sample_offer_data["capacity_available"] = 2
	sample_offer_data["capacity_total"] = 2
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	# Customer 1 accepts and confirms
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/confirm", json={"number_of_people": 2, "selected_transport_mode": "plane"}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	order_id = response.json()["data"]["id"]
	
	response = test_client.post(f"/api/v1/customer/orders/{order_id}/confirm", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	# Customer 2 tries to book
	customer2_session = "customer-789"
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer2_session})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/confirm", json={"number_of_people": 1, "selected_transport_mode": "plane"}, cookies={"sessionId": customer2_session})
	# Should fail due to insufficient capacity
	assert response.status_code != 200
	assert response.json()["error"] is not None
	assert "capacity" in response.json()["error"]["message"].lower()


def test_flow_filtering(test_client, agent_session_id, sample_offer_data):
	offer_a = sample_offer_data.copy()
	offer_a["origin"] = "Prague"
	offer_a["destination_where_to"] = "Barcelona"
	offer_a["capacity_total"] = 10
	offer_a["capacity_available"] = 10
	offer_a["price_housing"] = 500
	offer_a_id = create_test_offer(test_client, agent_session_id, offer_a)
	
	offer_b = sample_offer_data.copy()
	offer_b["origin"] = "Berlin"
	offer_b["destination_where_to"] = "Rome"
	offer_b["capacity_total"] = 5
	offer_b["capacity_available"] = 5
	offer_b["price_housing"] = 300
	offer_b_id = create_test_offer(test_client, agent_session_id, offer_b)
	
	offer_c = sample_offer_data.copy()
	offer_c["origin"] = "Prague"
	offer_c["destination_where_to"] = "Paris"
	offer_c["capacity_total"] = 8
	offer_c["capacity_available"] = 8
	offer_c["price_housing"] = 400
	offer_c_id = create_test_offer(test_client, agent_session_id, offer_c)
	
	response = test_client.get("/api/v1/agent/offers?origin=Prague", cookies={"sessionId": agent_session_id})
	assert response.status_code == 200
	offers = response.json()["data"]
	offer_ids = [o["id"] for o in offers]
	assert offer_a_id in offer_ids
	assert offer_c_id in offer_ids
	assert offer_b_id not in offer_ids
	
	response = test_client.get("/api/v1/agent/offers?capacity_min=6", cookies={"sessionId": agent_session_id})
	assert response.status_code == 200
	offers = response.json()["data"]
	offer_ids = [o["id"] for o in offers]
	assert offer_a_id in offer_ids
	assert offer_c_id in offer_ids
	assert offer_b_id not in offer_ids
	
	response = test_client.get("/api/v1/agent/offers?price_min=400&price_max=500", cookies={"sessionId": agent_session_id})
	assert response.status_code == 200
	offers = response.json()["data"]
	offer_ids = [o["id"] for o in offers]
	assert offer_a_id in offer_ids
	assert offer_c_id in offer_ids
	assert offer_b_id not in offer_ids


def test_flow_update_order_before_confirm(test_client, agent_session_id, customer_session_id, sample_offer_data):
	sample_offer_data["capacity_total"] = 10
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/confirm", json={"number_of_people": 3, "selected_transport_mode": "plane"}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	order_id = response.json()["data"]["id"]
	
	response = test_client.put(f"/api/v1/customer/orders/{order_id}", json={"number_of_people": 5, "selected_transport_mode": "train_bus"}, cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.post(f"/api/v1/customer/orders/{order_id}/confirm", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.get(f"/api/v1/customer/orders/{order_id}", cookies={"sessionId": customer_session_id})
	details = response.json()["data"]
	assert details["order"]["number_of_people"] == 5
	assert details["order"]["selected_transport_mode"] == "train_bus"


def test_flow_cancel_order_restores_capacity(test_client, agent_session_id, customer_session_id, sample_offer_data):
	sample_offer_data["capacity_total"] = 10
	sample_offer_data["capacity_available"] = 10
	offer_id = create_test_offer(test_client, agent_session_id, sample_offer_data)
	
	response = test_client.post(f"/api/v1/customer/offers/{offer_id}/accept", json={}, cookies={"sessionId": customer_session_id})
	response = test_client.post(f"/api/v1/customer/accepted/{offer_id}/confirm", json={"number_of_people": 3, "selected_transport_mode": "plane"}, cookies={"sessionId": customer_session_id})
	order_id = response.json()["data"]["id"]
	
	response = test_client.post(f"/api/v1/customer/orders/{order_id}/confirm", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.get(f"/api/v1/agent/offers/{offer_id}", cookies={"sessionId": agent_session_id})
	offer = response.json()["data"]
	assert offer["capacity_available"] == 7
	
	response = test_client.post(f"/api/v1/customer/orders/{order_id}/cancel", cookies={"sessionId": customer_session_id})
	assert response.status_code == 200
	
	response = test_client.get(f"/api/v1/agent/offers/{offer_id}", cookies={"sessionId": agent_session_id})
	offer = response.json()["data"]
	assert offer["capacity_available"] == 10
