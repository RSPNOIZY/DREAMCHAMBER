from pathlib import Path

from app.db.base import Base
from app.db.session import engine
from app.models import calm, moderation, research, voices  # noqa: F401


def init_db() -> None:
    # Ensure local sqlite directory exists when using file-based sqlite.
    if str(engine.url).startswith("sqlite:///"):
        db_path = str(engine.url).replace("sqlite:///", "", 1)
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)

