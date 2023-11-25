# backend

## Requirements

* Node.js 20+
* Yarn 1

## Setup

```bash
yarn install
```

## Development

### Setup Database

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml down  # stop, add `-v` to remove volumes
```

### Start Server

```bash
yarn dev
```

## Run Tests

```bash
yarn test
```

### Generate Kysely schema

```bash
DATABASE_URL=postgres://dev:dev@localhost/devdb yarn kysely-codegen
```

## Modify Database Schema

1. Modify `./db/init.sql`
2. Run `docker compose -f docker-compose.dev.yml down -v` to remove containers and volumes
3. Run `docker compose -f docker-compose.dev.yml up -d` to recreate containers and volumes
4. Use `DATABASE_URL=postgres://dev:dev@localhost/devdb yarn kysely-codegen` to regenerate Kysely schema
5. Use `cp ./node_modules/kysely-codegen/dist/db.d.ts src/db/types.ts` to copy the generated types to the project
6. Done!
