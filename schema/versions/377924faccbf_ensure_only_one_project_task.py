"""ensure only one project/task

Revision ID: 377924faccbf
Revises: 5b6399797fdc
Create Date: 2024-02-23 08:06:39.580390

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '377924faccbf'
down_revision: Union[str, None] = '5b6399797fdc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.create_unique_constraint('unique_event', ['task_id', 'start_date'])

    with op.batch_alter_table('Project', schema=None) as batch_op:
        batch_op.create_unique_constraint('unique_client', ['client_id', 'name'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Project', schema=None) as batch_op:
        batch_op.drop_constraint('unique_client', type_='unique')

    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.drop_constraint('unique_event', type_='unique')

    # ### end Alembic commands ###
