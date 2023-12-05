CREATE TYPE "login_type" AS ENUM ('regular', 'sso');

CREATE TYPE "privilege_type" AS ENUM ('consumer', 'store_manager');

CREATE TYPE "payment_type" AS ENUM ('cash', 'credit_card', 'monthly');

CREATE TYPE "order_state" AS ENUM ('unpaid', 'paid', 'aborted');

CREATE TABLE
  "store_tags" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "name" text UNIQUE NOT NULL
  );

CREATE TABLE
  "stores" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "owner_id" integer NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "address" text NOT NULL,
    "picture_url" text NOT NULL,
    "status" boolean NOT NULL DEFAULT false,
    "phone" text NOT NULL,
    "email" text NOT NULL
  );

CREATE TABLE
  "stores_opening_hours" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "store_id" integer NOT NULL,
    "day" integer NOT NULL,
    "open_time" time NOT NULL,
    "close_time" time NOT NULL
  );

CREATE TABLE
  "store_tags_assoc" (
    "store_id" integer NOT NULL,
    "tag_id" integer NOT NULL,
    PRIMARY KEY ("store_id", "tag_id")
  );

CREATE TABLE
  "users" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "login_type" login_type NOT NULL
  );

CREATE TABLE
  "user_privileges" (
    "user_id" integer NOT NULL,
    "privilege" privilege_type NOT NULL,
    PRIMARY KEY ("user_id", "privilege")
  );

CREATE TABLE
  "user_login" (
    "user_id" integer PRIMARY KEY NOT NULL,
    "username" text UNIQUE NOT NULL,
    "password" text NOT NULL
  );

CREATE TABLE
  "meal_tags" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "name" text UNIQUE NOT NULL
  );

CREATE TABLE
  "meals" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "price" integer NOT NULL,
    "picture" text,
    "category" text NOT NULL,
    "is_available" boolean NOT NULL DEFAULT false,
    "store_id" integer NOT NULL,
    "customizations" json
  );

CREATE TABLE
  "meal_assoc" (
    "meal_id" integer NOT NULL,
    "tag_id" integer NOT NULL,
    PRIMARY KEY ("meal_id", "tag_id")
  );

CREATE TABLE
  "order_details" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    "order_id" integer NOT NULL,
    "meal_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    "notes" text,
    PRIMARY KEY ("id", "order_id")
  );

CREATE TABLE
  "orders" (
    "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "notes" text,
    "payment_type" payment_type NOT NULL,
    "state" order_state NOT NULL,
    "delivery_method" text NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now ())
  );

ALTER TABLE "stores" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "store_tags_assoc" ADD FOREIGN KEY ("store_id") REFERENCES "stores" ("id");

ALTER TABLE "store_tags_assoc" ADD FOREIGN KEY ("tag_id") REFERENCES "store_tags" ("id");

ALTER TABLE "user_privileges" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_login" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "meals" ADD FOREIGN KEY ("store_id") REFERENCES "stores" ("id");

ALTER TABLE "meal_assoc" ADD FOREIGN KEY ("meal_id") REFERENCES "meals" ("id");

ALTER TABLE "meal_assoc" ADD FOREIGN KEY ("tag_id") REFERENCES "meal_tags" ("id");

ALTER TABLE "order_details" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "order_details" ADD FOREIGN KEY ("meal_id") REFERENCES "meals" ("id");

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "stores_opening_hours" ADD FOREIGN KEY ("store_id") REFERENCES "stores" ("id");