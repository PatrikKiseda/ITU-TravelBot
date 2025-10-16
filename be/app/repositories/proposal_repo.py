from typing import List, Optional
from sqlmodel import Session, select
from app.models.proposal import Proposal, ProposalStatus


class ProposalRepository:
	def create_many(self, db: Session, proposals: List[Proposal]) -> List[Proposal]:
		for p in proposals:
			db.add(p)
		db.commit()
		for p in proposals:
			db.refresh(p)
		return proposals

	def list_current(self, db: Session, session_id: str) -> List[Proposal]:
		stmt = select(Proposal).where(Proposal.session_id == session_id, Proposal.status == ProposalStatus.PROPOSAL)
		return list(db.exec(stmt))

	def get_by_id(self, db: Session, session_id: str, proposal_id: str) -> Optional[Proposal]:
		stmt = select(Proposal).where(Proposal.session_id == session_id, Proposal.id == proposal_id)
		return db.exec(stmt).first()

	def mark_rejected(self, db: Session, session_id: str, proposal_id: str) -> None:
		p = self.get_by_id(db, session_id, proposal_id)
		if not p:
			return
		p.status = ProposalStatus.REJECTED
		db.add(p)
		db.commit()
