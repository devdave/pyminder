"""add new reason to stop

Revision ID: 45f2a027037b
Revises: 377924faccbf
Create Date: 2024-02-23 13:49:41.382543

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '45f2a027037b'
down_revision: Union[str, None] = '377924faccbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.alter_column('stop_reason',
               existing_type=sa.VARCHAR(length=8),
               type_=sa.Enum('PLACEHOLDER', 'PAUSED', 'FINISHED', name='stopreasons'),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.alter_column('stop_reason',
               existing_type=sa.Enum('PLACEHOLDER', 'PAUSED', 'FINISHED', name='stopreasons'),
               type_=sa.VARCHAR(length=8),
               existing_nullable=False)

    # ### end Alembic commands ###
