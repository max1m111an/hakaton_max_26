from .base import *
from sqlalchemy.orm import Mapped


class PunctuationModel(Base):
    __tablename__ = "punctuation"
    id: Mapped[id_pk_]
    sentence: Mapped[sentence_]
    answer: Mapped[word_]
    rules: Mapped[sentence_]
