#!/bin/bash

docker stop pg_exporter_2 pg_exporter_1 postgres_1 postgres_2
docker rm pg_exporter_2 pg_exporter_1 postgres_1 postgres_2

sudo chown -R 1001:1001 pg_1_data
sudo chown -R 1001:1001 pg_2_data

docker compose --project-name="tsg-auth-17" up -d --build
docker exec postgres_1 psql -c "select case when pg_is_in_recovery() then 'postgres_2 primary' else 'postgres_1 primary' end as host_status;" "dbname=tfg_db user=four password=08121983"