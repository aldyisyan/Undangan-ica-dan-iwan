import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  showAkad: boolean("show_akad").notNull().default(true),
  showResepsi: boolean("show_resepsi").notNull().default(true),
  hasOverride: boolean("has_override").notNull().default(false),
});

export const wishes = pgTable("wishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  attend: text("attend").notNull(), // 'hadir', 'tidak', 'ragu'
  count: integer("count").notNull().default(0),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});
