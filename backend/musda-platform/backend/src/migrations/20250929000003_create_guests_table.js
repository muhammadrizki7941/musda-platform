/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('guests', function (table) {
    table.increments('id').primary();
    table.string('nama', 100).notNullable();
    table.string('email', 100).notNullable();
    table.string('no_hp', 20);
    table.string('instansi', 100);
    table.string('jabatan', 100);
    table.text('alamat');
    table.enu('jenis_kelamin', ['L', 'P']);
    table.date('tanggal_lahir');
    table.string('qr_code', 255);
    table.enu('status_kehadiran', ['hadir', 'tidak_hadir', 'pending']).defaultTo('pending');
    table.timestamp('waktu_checkin');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('status_kehadiran');
    table.index('qr_code');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('guests');
};