import os
import asyncio
import csv
from dotenv import load_dotenv
from pathlib import Path
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from models.base import Base
from models.orthoepy import OrthoepyModel
from models.vocabulary import VocabularyModel
from models.punctuation import PunctuationModel
load_dotenv()


def read_csv(path: Path):
    with open(path, "r", encoding="utf-8", newline="") as csv_file:
        reader = csv.reader(csv_file)
        headers = next(reader, [])
        rows = list(reader)
        return headers, rows


async def load_data(data: list[dict[str, str]]) -> int:
    async with database.session() as session:
        session.add_all(OrthoepyModel(**row) for row in data)
    return len(data)


def _build_db_url():
    required = ["DB_SCHEME", "DB_HOST"]
    if any(not os.getenv(var) for var in required):
        raise ValueError(f"Missing required env vars: {required}")

    scheme = os.getenv("DB_SCHEME")
    if scheme == "postgres":
        scheme = "postgresql+asyncpg"
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASS")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "")

    return f"{scheme}://{user}:{password}@{host}:{port}/{name}"


class Database:
    _engine: AsyncEngine = None
    _sessionmaker: async_sessionmaker | None = None

    async def init(self):
        db_url = _build_db_url()
        self._engine = create_async_engine(
            db_url,
            echo=True,
            pool_pre_ping=True,
        )
        self._sessionmaker = async_sessionmaker(
            self._engine,
            expire_on_commit=False,
            class_=AsyncSession,
        )

        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        if not self._sessionmaker:
            await self.init()

        if not self._sessionmaker:
            raise Exception("No sessionmaker")

        async with self._sessionmaker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    async def get_scalar(self, stmt):
        if not self._sessionmaker:
            await self.init()

        async with self._sessionmaker() as session:
            res = await session.execute(stmt)

        return res.scalar()

    async def get_all_scalars(self, stmt):
        if not self._sessionmaker:
            await self.init()

        async with self._sessionmaker() as session:
            res = (await session.execute(stmt)).scalars().all()

        return res

    async def close(self):
        if self._engine:
            await self._engine.dispose()


database = Database()


if __name__ == "__main__":

    async def main():
        await database.init()

        async with database.session() as session:
            headers, rows = read_csv("punctuation.csv")
            for sentence, answer, rules in rows:
                obj = PunctuationModel(sentence=sentence, answer=answer, rules=rules)
                session.add(obj)
            await session.commit()
            print("Punctuation added")

    asyncio.run(main())