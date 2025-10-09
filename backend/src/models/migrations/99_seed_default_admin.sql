-- 99_seed_default_admin.sql
-- Seed default super admin (idempotent)
INSERT INTO admins (username, name, email, role, status, password)
SELECT 'admin','Administrator','admin@himperra.org','super_admin','active','$2b$10$5n6CXnP2KnW5zAtfBWOmRO3tA8w0JuGgmGtrqL.d34FIa8MjJ34La'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username='admin' OR email='admin@himperra.org');