/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('admins', function (table) {
    table.increments('id').primary();
    table.string('nama', 100).notNullable();
    table.string('username', 50).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enu('role', ['super_admin', 'admin', 'moderator']).notNullable().defaultTo('admin');
    table.enu('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.string('avatar', 255);
    table.timestamp('last_login');
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
  return knex.schema.dropTable('admins');
};