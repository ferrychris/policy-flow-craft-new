import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  // Add other user fields as needed
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizationPolicies = pgTable('organization_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  organization_id: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  policy_id: uuid('policy_id').references(() => policies.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  type: text('type'),
  status: text('status').notNull().default('draft'),
  assigned_at: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
  created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  updated_at: timestamp('updated_at', { withTimezone: true }),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripe_customer_id: text('stripe_customer_id'),
  stripe_subscription_id: text('stripe_subscription_id'),
  status: text('status'),
  price_id: text('price_id'),
  quantity: integer('quantity'),
  cancel_at_period_end: boolean('cancel_at_period_end'),
  cancel_at: timestamp('cancel_at', { withTimezone: true }),
  canceled_at: timestamp('canceled_at', { withTimezone: true }),
  current_period_start: timestamp('current_period_start', { withTimezone: true }),
  current_period_end: timestamp('current_period_end', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  ended_at: timestamp('ended_at', { withTimezone: true }),
  trial_start: timestamp('trial_start', { withTimezone: true }),
  trial_end: timestamp('trial_end', { withTimezone: true }),
  interval: text('interval'),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  policies: many(policies),
  organizationPolicies: many(organizationPolicies),
  subscriptions: many(subscriptions),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  organizationPolicies: many(organizationPolicies),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  user: one(users, {
    fields: [policies.user_id],
    references: [users.id],
  }),
  organizationPolicies: many(organizationPolicies),
}));

export const organizationPoliciesRelations = relations(organizationPolicies, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationPolicies.organization_id],
    references: [organizations.id],
  }),
  policy: one(policies, {
    fields: [organizationPolicies.policy_id],
    references: [policies.id],
  }),
  createdBy: one(users, {
    fields: [organizationPolicies.created_by],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}));

// Schema for inserting - can be used to validate API requests
export const insertOrganizationPolicySchema = createInsertSchema(organizationPolicies);
export const insertPolicySchema = createInsertSchema(policies);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);

// Define types
export type OrganizationPolicy = typeof organizationPolicies.$inferSelect;
export type NewOrganizationPolicy = typeof organizationPolicies.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
