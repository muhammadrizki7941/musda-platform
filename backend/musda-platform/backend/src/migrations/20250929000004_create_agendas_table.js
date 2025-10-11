/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('agendas', function (table) {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.text('description');
    table.datetime('start_time').notNullable();
    table.datetime('end_time').notNullable();
    table.string('location', 100);
    table.string('speaker', 100);
    table.enu('type', ['presentation', 'workshop', 'networking', 'break', 'other']).defaultTo('presentation');
    table.enu('status', ['scheduled', 'ongoing', 'completed', 'cancelled']).defaultTo('scheduled');
    table.integer('max_participants');
    table.timestamps(true, true);
    
    // Indexes
    table.index('start_time');
    table.index('status');
    table.index('type');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('agendas');
};