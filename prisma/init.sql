-- Arquivo de inicialização do banco de dados para Docker
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões úteis se necessário
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurações de performance para desenvolvimento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 0;

-- Recarregar configurações
SELECT pg_reload_conf();

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Database nest-boilerplate initialized successfully for Docker environment';
END $$;