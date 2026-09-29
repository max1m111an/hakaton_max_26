import os
from typing import Any, Annotated
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, mapped_column


id_pk_ = Annotated[int, mapped_column(primary_key=True)]
word_ = Annotated[str, mapped_column(String(25))]
sentence_ = Annotated[str, mapped_column(String(100))]

class Base(DeclarativeBase):
    __table_args__: dict[str, Any] | tuple[Any] = {
        "mysql_default_charset": os.getenv("DB_CHARSET", "utf8mb4"),
        "mysql_collate": os.getenv("DB_COLLATE", "utf8mb4_unicode_ci"),
    }

    def dict(self):
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}