SELECT 'CREATE DATABASE ai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai')