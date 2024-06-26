"""more fine tuning

Revision ID: 5b6399797fdc
Revises: d49d722eb025
Create Date: 2024-02-22 17:52:11.385778

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b6399797fdc'
down_revision: Union[str, None] = 'd49d722eb025'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.add_column(sa.Column('seconds', sa.Integer(), nullable=False))

    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('details', sa.String(), nullable=False))
        batch_op.drop_column('detail')

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('detail', sa.VARCHAR(), nullable=False))
        batch_op.drop_column('details')

    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.drop_column('seconds')

    # ### end Alembic commands ###
