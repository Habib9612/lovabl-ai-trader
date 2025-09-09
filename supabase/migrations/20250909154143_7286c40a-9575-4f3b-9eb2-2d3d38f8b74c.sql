-- Add missing foreign key constraints for better relationship support
ALTER TABLE community_messages 
ADD CONSTRAINT fk_community_messages_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE community_messages 
ADD CONSTRAINT fk_community_messages_asset_id 
FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;

ALTER TABLE signals 
ADD CONSTRAINT fk_signals_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE signals 
ADD CONSTRAINT fk_signals_asset_id 
FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

ALTER TABLE signal_followers 
ADD CONSTRAINT fk_signal_followers_signal_id 
FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE;

ALTER TABLE signal_followers 
ADD CONSTRAINT fk_signal_followers_follower_id 
FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;