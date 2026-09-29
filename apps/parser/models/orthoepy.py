from .base import *
from sqlalchemy.orm import Mapped


class OrthoepyModel(Base):
    __tablename__ = "orthoepy"
    id: Mapped[id_pk_]
    full_word: Mapped[str] = mapped_column(String(25))
    word_with_gaps: Mapped[str] = mapped_column(String(25))
    skipped_letters: Mapped[str] = mapped_column(String(25))
