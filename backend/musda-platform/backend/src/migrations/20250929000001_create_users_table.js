/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enu('role', ['super_admin', 'admin', 'moderator', 'viewer', 'user']).notNullable().defaultTo('user');
    table.string('nama', 100);
    table.string('email', 100).unique();
    table.enu('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.boolean('twoFactorEnabled').defaultTo(false);
    table.string('avatar', 255);
    table.timestamps(true, true);
    
    // Indexes
    table.index('username');
    table.index('email');
    table.index('role');
    table.index('status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};