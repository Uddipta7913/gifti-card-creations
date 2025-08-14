-- Add is_used and used_at fields to gift_cards table
ALTER TABLE gift_cards 
ADD COLUMN is_used BOOLEAN DEFAULT FALSE,
ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on used cards queries
CREATE INDEX IF NOT EXISTS idx_gift_cards_is_used ON gift_cards(is_used);
CREATE INDEX IF NOT EXISTS idx_gift_cards_used_at ON gift_cards(used_at);



