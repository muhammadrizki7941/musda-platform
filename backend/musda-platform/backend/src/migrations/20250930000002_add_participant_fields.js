/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('participants', function (table) {
    // Add new columns
    table.enu('kategori', ['umum', 'mahasiswa']).notNullable().defaultTo('umum');
    table.string('asal_instansi', 200).notNullable();
    table.text('alasan_ikut').notNullable();
    
    // Add index for kategori for filtering
    table.index('kategori');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('participants', function (table) {
    table.dropColumn('kategori');
    table.dropColumn('asal_instansi');
    table.dropColumn('alasan_ikut');
  });
};