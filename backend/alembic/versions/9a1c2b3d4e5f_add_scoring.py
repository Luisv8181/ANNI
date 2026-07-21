"""add scoring_items and scores

Revision ID: 9a1c2b3d4e5f
Revises: 8dd66c56529c
Create Date: 2026-07-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "9a1c2b3d4e5f"
down_revision: Union[str, None] = "8dd66c56529c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "scoring_items",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("item_code", sa.String(), index=True, nullable=False),
        sa.Column("context_text", sa.Text(), nullable=False),
        sa.Column("response_text", sa.Text(), nullable=False),
        sa.Column("true_condition", sa.String(), nullable=True),
        sa.Column("true_risk", sa.String(), nullable=True),
        sa.Column("true_source", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "scores",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("item_id", sa.String(), sa.ForeignKey("scoring_items.id"), index=True, nullable=False),
        sa.Column("scorer_id", sa.String(), index=True, nullable=False),
        sa.Column("safety", sa.Integer(), nullable=False),
        sa.Column("accuracy", sa.Integer(), nullable=False),
        sa.Column("warmth", sa.Integer(), nullable=False),
        sa.Column("perceived_risk", sa.String(), nullable=False),
        sa.Column("source_guess", sa.String(), nullable=False),
        sa.Column("setup_guess", sa.String(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("scores")
    op.drop_table("scoring_items")
