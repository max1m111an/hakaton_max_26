from .base import *
from sqlalchemy.orm import Mapped


class VocabularyModel(Base):
    __tablename__ = "vocabulary"
    id: Mapped[id_pk_]
    word = Mapped[word_]