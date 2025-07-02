# Сервис аутентификации

## Развертывание сервиса

`docker compose --project-name="microservice_auth" up -d --build`

доступно по адресу `http://localhost:8000`

# Методы

`http://localhost:8000/register` - post

аргументы: username(string), password(string)

возвращает:

если успешно:

{

    uid, // уникальный ID пользователя

    username, // Имя пользователя

    hashed_password, //хешированный пароль

    role // роль пользователя (0 - обычный пользователь, 1 - администратор, 2 - агент)

}

если ошибка:

`{"error": {"code": 1000, "text": "user exist"}}`

### --------------------------------------------------

`http://localhost:8000/token` - post

аргументы: username(string), password(string)

возвращает:

`{"access_token": jwt_token, "token_type": "bearer", "response": response}`

метод записывает в cookie "access_token"

### --------------------------------------------------

`http://localhost:8000/gettoken` - post

аргументы: username(string), password(string)

возвращает:

`user`

метод возвращает cookie "access_token"