"""Initial

Revision ID: c53c6d258a19
Revises: 
Create Date: 2024-02-20 22:14:41.960275

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c53c6d258a19'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Client',
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('Project',
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('client_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['client_id'], ['Client.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('Project', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_Project_client_id'), ['client_id'], unique=False)

    op.create_table('Task',
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.Enum('ACTIVE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED', name='taskstatus'), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['Project.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('Task', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_Task_project_id'), ['project_id'], unique=False)

    op.create_table('Event',
    sa.Column('task_id', sa.Integer(), nullable=False),
    sa.Column('detail', sa.String(), nullable=False),
    sa.Column('notes', sa.String(), nullable=False),
    sa.Column('duration', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['task_id'], ['Task.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_Event_task_id'), ['task_id'], unique=False)

    op.create_table('Entry',
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('started_on', sa.DateTime(), nullable=False),
    sa.Column('stopped_on', sa.DateTime(), nullable=False),
    sa.Column('stop_reason', sa.Enum('PAUSED', 'INTERRUPTED', 'FINISHED', name='stopreasons'), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_on', sa.DateTime(), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['Event.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_Entry_event_id'), ['event_id'], unique=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Entry', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_Entry_event_id'))

    op.drop_table('Entry')
    with op.batch_alter_table('Event', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_Event_task_id'))

    op.drop_table('Event')
    with op.batch_alter_table('Task', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_Task_project_id'))

    op.drop_table('Task')
    with op.batch_alter_table('Project', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_Project_client_id'))

    op.drop_table('Project')
    op.drop_table('Client')
    # ### end Alembic commands ###
