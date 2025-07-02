# База данных Postgresql

поднимаем БД

`docker-compose --project-name="tsg-db-16" up -d`

2 реплики

первая реплика рабоатет на порту **6432**, вторая на **6433**

просмотр мастер базы

`select case when pg_is_in_recovery() then 'secondary' else 'primary' end as host_status;`

SQL базы находится в папке SQL

Метрики можно просматривать по **[:::9187]** и **[:::9188]** соответственно