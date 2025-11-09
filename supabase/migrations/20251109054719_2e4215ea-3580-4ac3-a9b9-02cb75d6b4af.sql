-- Create boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('leads', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for boards
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- Index for boards
CREATE INDEX idx_boards_user_id ON boards(user_id);

-- Create board_columns table
CREATE TABLE board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for board_columns
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view columns of their boards"
  ON board_columns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_columns.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can create columns in their boards"
  ON board_columns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_columns.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update columns in their boards"
  ON board_columns FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_columns.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete columns from their boards"
  ON board_columns FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_columns.board_id 
    AND boards.user_id = auth.uid()
  ));

-- Index for board_columns
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);

-- Create board_cards table
CREATE TABLE board_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES board_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for board_cards
ALTER TABLE board_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards in their boards"
  ON board_cards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_cards.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can create cards in their boards"
  ON board_cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_cards.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in their boards"
  ON board_cards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_cards.board_id 
    AND boards.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cards from their boards"
  ON board_cards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = board_cards.board_id 
    AND boards.user_id = auth.uid()
  ));

-- Indexes for board_cards
CREATE INDEX idx_board_cards_board_id ON board_cards(board_id);
CREATE INDEX idx_board_cards_column_id ON board_cards(column_id);

-- Trigger to update updated_at on boards
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_cards_updated_at
  BEFORE UPDATE ON board_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();