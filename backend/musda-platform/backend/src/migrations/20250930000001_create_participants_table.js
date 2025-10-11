/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('participants', function (table) {
    table.increments('id').primary();
    table.string('nama', 100).notNullable();
    table.string('email', 100).notNullable();
    table.string('whatsapp', 20).notNullable();
    table.enu('paymentMethod', ['qris', 'manual']).notNullable();
    table.enu('paymentStatus', ['pending', 'paid', 'failed']).defaultTo('pending');
    table.string('ticketUrl', 255).nullable();
    table.string('paymentCode', 50).nullable(); // untuk tracking pembayaran
    table.decimal('amount', 10, 2).defaultTo(150000.00); // biaya pendaftaran
    table.text('notes').nullable(); // catatan admin
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('whatsapp');
    table.index('paymentStatus');
    table.index('paymentMethod');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('participants');
};