const UserSeeder = require('./UserSeeder');
const setupDatabase = require('../utils/setupDatabase');

class DatabaseSeeder {
  static async run() {
    console.log('🚀 Starting database seeding...\n');
    
    try {
      // Setup database dan tabel terlebih dahulu
      const dbReady = await setupDatabase();
      if (!dbReady) {
        throw new Error('Database setup failed');
      }

      // Jalankan seeder untuk users
      await UserSeeder.run();
      
      // Tambahkan seeder lain di sini jika diperlukan
      // await AgendaSeeder.run();
      // await SponsorSeeder.run();
      
      console.log('\n🎉 All seeders completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Seeding failed:', error.message);
      process.exit(1);
    }
  }

  static async fresh() {
    console.log('🔄 Fresh seeding (clearing all data first)...\n');
    
    try {
      // Clear semua data
      await UserSeeder.clear();
      await UserSeeder.resetAutoIncrement();
      
      // Jalankan seeder
      await this.run();
    } catch (error) {
      console.error('\n❌ Fresh seeding failed:', error.message);
      process.exit(1);
    }
  }
}

// Cek argument command line
const args = process.argv.slice(2);

if (args.includes('--fresh')) {
  DatabaseSeeder.fresh();
} else {
  DatabaseSeeder.run();
}

module.exports = DatabaseSeeder;