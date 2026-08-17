import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand").notNull().default("B7 NUTRITION"),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  size: text("size").notNull().default(""),
  price: real("price").notNull(),
  oldPrice: real("old_price").notNull(),
  stock: integer("stock").notNull().default(0),
  badge: text("badge").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  goal: text("goal").notNull().default("Evolução física"),
  status: text("status").notNull().default("ATIVO"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientEmail: text("client_email").notNull(),
  total: real("total").notNull(),
  status: text("status").notNull().default("PAGAMENTO PENDENTE"),
  payment: text("payment").notNull().default("PIX"),
  itemsJson: text("items_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const assessments = sqliteTable("assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientEmail: text("client_email").notNull(),
  weight: real("weight").notNull(),
  height: real("height").notNull(),
  waist: real("waist").notNull(),
  neck: real("neck").notNull(),
  hip: real("hip").notNull(),
  bodyFat: real("body_fat").notNull(),
  age: integer("age").notNull().default(30),
  sex: text("sex").notNull().default("male"),
  activity: real("activity").notNull().default(1.55),
  measurementsJson: text("measurements_json").notNull().default("{}"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientEmail: text("client_email").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  contentJson: text("content_json").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

