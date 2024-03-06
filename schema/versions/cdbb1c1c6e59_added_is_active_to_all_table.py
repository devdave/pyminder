"""Added is_active to all Table

Revision ID: cdbb1c1c6e59
Revises: 3606fe990453
Create Date: 2024-03-06 08:50:49.994988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdbb1c1c6e59'
down_revision: Union[str, None] = '3606fe990453'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
