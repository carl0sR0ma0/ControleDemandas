# Controle de Demandas — Backend (.NET 8 + Minimal APIs + PostgreSQL)

## Rodando
1. **Suba o banco**:
   ```bash
   docker compose up -d
   ```
2. **Restaure e crie a migration**:
   ```bash
   cd src/Api
   dotnet restore
   dotnet tool install --global dotnet-ef
   dotnet ef migrations add InitialCreate --project Api --startup-project Api
   dotnet ef database update --project Api --startup-project Api
   ```
3. **Execute a API**:
   ```bash
   dotnet run --project Api
   ```
4. **Swagger**: http://localhost:5000/swagger (ou porta exibida no console).

## Auth padrão
Usuário seedado:
- **Email**: admin@empresa.com
- **Senha**: Admin@123

## Principais endpoints
- `POST /auth/login`
- `GET /dashboard/*`
- `GET /demands` / `POST /demands` / `POST /demands/{id}/status` / `POST /demands/{id}/attachments`
- `GET /public/protocol/{protocol}`
- `GET /users` etc.

## Configurações
- Ajuste `appsettings.json` (`ConnectionStrings`, `Jwt.SigningKey`, `Cors.Origin`, `Smtp`).

## Anexos
Arquivos são salvos em `storage/{protocolo}/` e servidos via `/storage`.


## Rodar em Docker (API + DB)
```bash
# Build da API e subir com Postgres
docker compose -f docker-compose.api.yml up --build -d
# Logs
docker compose -f docker-compose.api.yml logs -f api
```

## Publicação em container (manual)
```bash
# build imagem
docker build -t controle-demandas-api -f src/Api/Dockerfile .
# rodar
docker run -p 5000:5000 -v %cd%/storage:/app/storage --name demandas_api controle-demandas-api
```

## Abrir no Visual Studio 2022
1. Abra o **Visual Studio 2022** → **File > Open > Project/Solution**.
2. Selecione o arquivo **`controle-demandas.sln`** na raiz do projeto (ou use **File > Open > Folder** apontando para a pasta do repositório).
3. Na Solution Explorer, clique com o direito no projeto **Api** → **Set as Startup Project**.
4. Ajuste o `appsettings.json` se necessário.
5. **Build** (Ctrl+Shift+B) e **Run** (F5). O VS já configura o IIS Express ou Kestrel automaticamente.
6. Para criar as **migrations** pelo VS:
   - **Tools > NuGet Package Manager > Package Manager Console** e rode:
     ```powershell
     cd src/Api
     dotnet ef migrations add InitialCreate --project Api --startup-project Api
     dotnet ef database update --project Api --startup-project Api
     ```
7. Para debug com Docker, você pode selecionar o perfil **Docker** se preferir adicionar o suporte pelo VS (Add > Docker Support). Neste pacote já há `Dockerfile`; o VS detecta e cria o perfil automaticamente.
