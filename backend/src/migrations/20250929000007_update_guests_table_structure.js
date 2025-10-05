/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('guests', function (table) {
    // Remove old columns
    table.dropColumn('no_hp');
    table.dropColumn('jabatan'); 
    table.dropColumn('alamat');
    table.dropColumn('jenis_kelamin');
    table.dropColumn('tanggal_lahir');
    table.dropColumn('qr_code');
    table.dropColumn('status_kehadiran');
    table.dropColumn('waktu_checkin');
    
    // Add new columns that match the model
    table.string('whatsapp', 20).notNullable();
    table.string('position', 100).notNullable();
    table.string('city', 100).notNullable();
    table.string('category', 50).notNullable();
    table.text('experience').notNullable();
    table.text('expectations').notNullable();
    table.timestamp('booking_date').defaultTo(knex.fn.now());
    table.boolean('status_hadir').defaultTo(0);
    
    // Add indexes for performance
    table.index('whatsapp');
    table.index('status_hadir');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('guests', function (table) {
    // Remove new columns
    table.dropColumn('whatsapp');
    table.dropColumn('position');
    table.dropColumn('city');
    table.dropColumn('category');
    table.dropColumn('experience');
    table.dropColumn('expectations');
    table.dropColumn('booking_date');
    table.dropColumn('status_hadir');
    
    // Add back old columns
    table.string('no_hp', 20);
    table.string('jabatan', 100);
    table.text('alamat');
    table.enu('jenis_kelamin', ['L', 'P']);
    table.date('tanggal_lahir');
    table.string('qr_code', 255);
    table.enu('status_kehadiran', ['hadir', 'tidak_hadir', 'pending']).defaultTo('pending');
    table.timestamp('waktu_checkin');
  });
};