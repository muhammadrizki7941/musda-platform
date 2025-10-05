/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('countdown', function (table) {
    table.increments('id').primary();
    table.string('event_name', 100).notNullable();
    table.datetime('target_date').notNullable();
    table.text('description');
    table.enu('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    // Index
    table.index('status');
    table.index('target_date');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('countdown');
};