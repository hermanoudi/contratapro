-- Migration: Add profile_picture column to users table
-- Created: 2025-12-30
-- Purpose: Allow professionals to upload profile pictures for verification

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR;

COMMENT ON COLUMN users.profile_picture IS 'URL or path to user profile picture';
