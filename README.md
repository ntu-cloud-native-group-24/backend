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

### Generate Kysely schema

```bash
DATABASE_URL=postgres://dev:dev@localhost/devdb yarn kysely-codegen
```
