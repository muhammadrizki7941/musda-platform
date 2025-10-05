/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sponsors', function (table) {
    table.increments('id').primary();
    table.string('nama', 100).notNullable();
    table.text('description');
    table.string('logo_url', 255);
    table.string('website_url', 255);
    table.string('contact_email', 100);
    table.string('contact_phone', 20);
    table.enu('category', ['platinum', 'gold', 'silver', 'bronze', 'media_partner']).notNullable();
    table.integer('display_order').defaultTo(0);
    table.enu('status', ['active', 'inactive']).defaultTo('active');
    table.timestamps(true, true);
    
    // Indexes
    table.index('category');
    table.index('status');
    table.index('display_order');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sponsors');
};