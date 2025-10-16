import os
import tempfile
from sqlmodel import SQLModel, Session, create_engine
from app.services.suggestion_service import SuggestionService
from app.services.destination_service import DestinationService
from app.services.list_service import ListService
from app.repositories.session_repo import SessionRepository
from app.models import proposal as _m1  # noqa
from app.models import destination as _m2  # noqa
from app.models import list as _m3  # noqa
from app.models import session as _m4  # noqa


def get_db():
	fd, path = tempfile.mkstemp()
	os.close(fd)
	engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
	SQLModel.metadata.create_all(engine)
	return engine


def test_suggestion_flow():
	engine = get_db()
	session_id = "test-session"
	repo = SessionRepository()
	with Session(engine) as db:
		repo.ensure(db, session_id)
		ss = SuggestionService()
		props = ss.generate(db, session_id, {"regions": ["EU"]})
		assert len(props) == 5
		first = props[0]
		ds = ss.accept(db, session_id, first.id)
		assert ds is not None
		# proposals after accept should be 4 remaining with PROPOSAL status
		current = ss.list_current(db, session_id)
		assert len(current) == 4


def test_destination_expand_customize():
	engine = get_db()
	session_id = "sess2"
	repo = SessionRepository()
	with Session(engine) as db:
		repo.ensure(db, session_id)
		ss = SuggestionService()
		props = ss.generate(db, session_id, {})
		d = ss.accept(db, session_id, props[0].id)
		ds = DestinationService()
		upd = ds.expand(db, session_id, d.id, False)
		assert upd and upd.long_description
		upd2 = ds.customize(db, session_id, d.id, "quiet beaches")
		assert upd2 and upd2.long_description


def test_lists_and_stats():
	engine = get_db()
	session_id = "sess3"
	repo = SessionRepository()
	with Session(engine) as db:
		repo.ensure(db, session_id)
		ss = SuggestionService()
		props = ss.generate(db, session_id, {})
		d1 = ss.accept(db, session_id, props[0].id)
		d2 = ss.accept(db, session_id, props[1].id)
		ls = ListService()
		lst = ls.create(db, session_id, "Summer 2026")
		ls.add_items_bulk(db, lst["id"], [d1.id, d2.id])
		summary = ls.all_with_stats(db, session_id)
		assert summary[0]["stats"]["count"] >= 2
