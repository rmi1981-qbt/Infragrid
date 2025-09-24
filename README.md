# Infragrid - Protótipo do Sistema de Gestão de Postes

Este é um protótipo de front-end funcional para o Infragrid, uma plataforma de gestão de inventário e exploração comercial para distribuidoras de energia, com foco em funcionalidades de Sistema de Informação Geográfica (GIS) baseadas no padrão da Base de Dados Geográfica da Distribuidora (BDGD) da ANEEL.

## Visão Geral

O objetivo deste protótipo é construir uma interface de usuário completa, navegável e interativa que sirva como base para o desenvolvimento completo do sistema. A aplicação foi desenvolvida utilizando React.js, se conecta a um backend Supabase e utiliza **OpenStreetMap com Leaflet.js** para visualização geoespacial, oferecendo uma solução robusta e sem custos de API de mapa.

### Funcionalidades Implementadas
- **Navegação Completa:** Um menu superior permite navegar por todos os módulos e submenus definidos.
- **Conexão com Backend:** A aplicação se conecta a um banco de dados Supabase para buscar, criar, atualizar e apagar dados do padrão BDGD.
- **Módulo GIS Multicamada:** Utiliza a biblioteca Leaflet.js para renderizar um mapa interativo com dados do OpenStreetMap. Permite a visualização de múltiplos tipos de ativos (transformadores, seccionadores, segmentos de rede, postes) em camadas distintas, que podem ser ativadas ou desativadas através de um painel de controle customizado.
- **Inventário de Ativos com CRUD:** Apresenta um inventário detalhado dos ativos da distribuidora, organizado em abas por categoria. Cada categoria possui uma tabela com busca e paginação, além de funcionalidades completas para Adicionar, Editar e Apagar ativos.
- **Dashboard Operacional:** Exibe KPIs e métricas relevantes extraídas em tempo real dos dados da BDGD no Supabase.

## Configuração (Passos Essenciais)

Para que a aplicação funcione, você precisa configurar as credenciais do Supabase e as políticas de acesso aos dados.

### Conectando ao Supabase

#### a. Configurar Credenciais

Edite o arquivo `index.tsx` e insira sua URL e Chave Anônima (anon key) do Supabase nas seguintes constantes:

```javascript
const supabaseUrl = 'SUA_SUPABASE_URL';
const supabaseAnonKey = 'SUA_SUPABASE_ANON_KEY';
```
Você pode encontrar esses valores no painel do seu projeto Supabase em **Project Settings > API**.

#### b. Configurar Políticas de Acesso (RLS)

Por padrão, o Supabase restringe o acesso aos dados. Você **precisa** habilitar o acesso de leitura e escrita para que a aplicação possa funcionar corretamente.

Vá para o **SQL Editor** no seu painel Supabase e execute o seguinte script. Ele configura todas as tabelas necessárias de uma só vez de forma segura, informando o status de cada одна.

```sql
-- SCRIPT ROBUSTO PARA CONFIGURAÇÃO DE RLS NO SUPABASE
-- Este script verifica a existência de cada tabela antes de aplicar as permissões.
-- Se uma tabela não existir, ele emite um aviso em vez de causar um erro.

CREATE OR REPLACE FUNCTION setup_bdgd_rls() 
RETURNS TABLE(table_name TEXT, policy_type TEXT, status TEXT, details TEXT) AS $$
DECLARE
    tbl_name TEXT;
    all_tables TEXT[] := ARRAY[
        'dados_cosern',
        'a00000020_SSDAT',
        'a0000002a_UNCRAT',
        'a0000002c_UNCRMT',
        'a0000002d_UNREAT',
        'a0000002e_UNREMT',
        'a0000002f_UNSEAT',
        'a00000030_UNSEBT',
        'a00000031_UNSEMT',
        'a00000033_UNTRMT',
        'a00000034_UNTRAT',
        'AcessosMun',
        'municipios_geom'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY all_tables
    LOOP
        -- Verifica se a tabela existe no schema 'public'
        IF to_regclass('public."' || tbl_name || '"') IS NOT NULL THEN
            BEGIN
                -- PASSO 1: Habilitar Row-Level Security (RLS)
                EXECUTE 'ALTER TABLE public."' || tbl_name || '" ENABLE ROW LEVEL SECURITY;';

                -- PASSO 2: Limpar políticas antigas para evitar conflitos
                EXECUTE 'DROP POLICY IF EXISTS "Allow public read access" ON public."' || tbl_name || '";';
                EXECUTE 'DROP POLICY IF EXISTS "Allow public write access" ON public."' || tbl_name || '";';
                EXECUTE 'DROP POLICY IF EXISTS "Allow anon full access" ON public."' || tbl_name || '";';


                -- PASSO 3: Criar políticas de ACESSO PÚBLICO
                -- Nota: Permitir INSERT/UPDATE/DELETE para o role 'anon' não é seguro para produção.
                -- Isso é feito apenas para fins de prototipagem e demonstração.
                EXECUTE 'CREATE POLICY "Allow anon full access" ON public."' || tbl_name || '" FOR ALL TO anon USING (true) WITH CHECK (true);';
                RETURN QUERY SELECT tbl_name, 'SELECT, INSERT, UPDATE, DELETE', 'SUCCESS', 'RLS policy for ALL operations created and enabled.';

            EXCEPTION WHEN others THEN
                -- Retorna uma falha caso ocorra outro erro
                RETURN QUERY SELECT tbl_name, 'ALL', 'FAIL', SQLERRM;
            END;
        ELSE
            -- Retorna um aviso se a tabela não foi encontrada
            RETURN QUERY SELECT tbl_name, 'ALL', 'SKIPPED', 'Table not found in public schema.';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute a função para aplicar as configurações e ver o resultado para cada tabela
SELECT * FROM setup_bdgd_rls();
```
Este script cria uma função no PostgreSQL que itera sobre uma lista de tabelas, aplicando as permissões necessárias e as políticas RLS para permitir que o front-end (usando a chave anônima) leia e modifique os dados em todas as tabelas da BDGD. Ao final, ele retorna um relatório detalhado indicando o sucesso ou falha para cada operação.

### c. Criar Funções do Banco de Dados (Obrigatório)

Para otimizar as consultas no módulo "Acessos/Município" e garantir a performance, precisamos criar duas funções no banco de dados. Elas irão pré-agregar os dados no servidor, reduzindo a carga no front-end.

Vá para o **SQL Editor** no seu painel Supabase e execute os seguintes scripts:

**1. Habilitar a extensão `unaccent` (para buscas com acentos)**
```sql
-- Habilita a extensão unaccent, necessária para buscas sem sensibilidade a acentos.
-- Execute isso uma vez no seu SQL Editor.
CREATE EXTENSION IF NOT EXISTS unaccent;
```

**2. Criar as funções de agregação**
```sql
-- Função 1: Obter o resumo de acessos e operadoras por município para uma UF.
-- Ordena os resultados pela quantidade de operadoras em ordem decrescente.
-- ATUALIZADO: Adicionado COALESCE para garantir que a soma de acessos funcione mesmo com valores nulos.
CREATE OR REPLACE FUNCTION get_municipio_summary(uf_param TEXT)
RETURNS TABLE (
    "Municipio" TEXT,
    "numOperadoras" BIGINT,
    "totalAcessos" BIGINT,
    "id" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        am."Municipio",
        COUNT(DISTINCT am."Empresa") AS "numOperadoras",
        -- O campo "2025-07" precisa de aspas duplas por conter um hífen.
        -- Usar COALESCE para tratar valores NULL e evitar erros na soma.
        SUM(COALESCE(am."2025-07", 0))::BIGINT AS "totalAcessos",
        am."Municipio" AS id
    FROM
        "AcessosMun" AS am
    WHERE
        am."UF" = uf_param
    GROUP BY
        am."Municipio"
    ORDER BY
        "numOperadoras" DESC,
        "totalAcessos" DESC;
END;
$$ LANGUAGE plpgsql;


-- Função 2: Obter o detalhe de acessos por operadora para um município específico.
-- Trata acentuação e caracteres especiais na busca pelo nome do município.
-- Ordena os resultados pela quantidade de acessos em ordem decrescente.
-- ATUALIZADO: Adicionado COALESCE para garantir que a soma de acessos funcione mesmo com valores nulos.
CREATE OR REPLACE FUNCTION get_operator_details_by_municipio(municipio_param TEXT, uf_param TEXT)
RETURNS TABLE (
    "Empresa" TEXT,
    "Acessos" BIGINT,
    "id" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        am."Empresa",
        -- O campo "2025-07" precisa de aspas duplas por conter um hífen.
        -- Usar COALESCE para tratar valores NULL e evitar erros na soma.
        SUM(COALESCE(am."2025-07", 0))::BIGINT AS "Acessos",
        am."Empresa" AS id
    FROM
        "AcessosMun" AS am
    WHERE
        unaccent(am."Municipio") ILIKE unaccent(municipio_param) AND am."UF" = uf_param
    GROUP BY
        am."Empresa"
    ORDER BY
        "Acessos" DESC;
END;
$$ LANGUAGE plpgsql;
```
Este script cria as funções necessárias para que o módulo de análise de acessos funcione corretamente.