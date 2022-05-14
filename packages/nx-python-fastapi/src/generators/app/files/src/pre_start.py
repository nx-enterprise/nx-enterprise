import logging
import secrets

import dotenv
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def check_db() -> None:
    try:
        db = SessionLocal()
        # Try to create session to check if DB is awake
        db.execute('SELECT 1')
    except Exception as e:
        logger.error(e)
        raise e


def create_secret() -> None:
    env = dotenv.dotenv_values('.env')
    if 'SECRET_KEY' not in env:
        logger.info('Secret key is not found, initializing secret key')
        dotenv.set_key('.env', 'SECRET_KEY', secrets.token_urlsafe(32))


def main() -> None:
    logger.info('Initializing service')
    check_db()
    create_secret()
    logger.info('Service finished initializing')


if __name__ == '__main__':
    main()