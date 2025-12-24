-- Add is_completed column to board_cards table
ALTER TABLE public.board_cards ADD COLUMN is_completed boolean NOT NULL DEFAULT false;