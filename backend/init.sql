-- backend/init.sql

-- Tạo bảng 'users'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng 'user_data' với khóa ngoại trỏ đến 'users'
CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY,
    saved_profiles JSONB DEFAULT '{}'::jsonb,
    saved_profiles_parent JSONB DEFAULT '{}'::jsonb,
    last_visited_profile VARCHAR(255) DEFAULT '',
    virtual_profiles JSONB DEFAULT '{}'::jsonb,
    virtual_profiles_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- (Tùy chọn) Tạo một trigger để tự động cập nhật 'updated_at'
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON user_data;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON user_data
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Thông báo hoàn tất
\echo 'Tables created successfully.'
