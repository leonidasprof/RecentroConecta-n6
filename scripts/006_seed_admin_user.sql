-- Create default admin user with admin/admin credentials
INSERT INTO employees (name, email, role, password_hash)
VALUES ('Administrador', 'admin', 'admin', 'admin')
ON CONFLICT (email) DO NOTHING;
