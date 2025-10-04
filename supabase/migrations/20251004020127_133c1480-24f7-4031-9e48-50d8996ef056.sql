-- Add flow_data column to funnels table to store edges/connections
ALTER TABLE funnels ADD COLUMN flow_data JSONB DEFAULT '{"edges": []}'::jsonb;