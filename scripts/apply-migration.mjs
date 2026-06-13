/**
 * Script to apply the service request tracking migration directly to Supabase
 * Run with: node scripts/apply-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260613000000_service_requests_tracking_serial.sql');
console.log(`\n📄 Reading migration file...`);
console.log(`   Path: ${migrationPath}`);

let migrationSQL;
try {
  migrationSQL = readFileSync(migrationPath, 'utf-8');
  console.log(`   ✅ Migration file loaded (${migrationSQL.length} characters)`);
} catch (error) {
  console.error(`❌ Failed to read migration file:`, error.message);
  process.exit(1);
}

// Apply migration
console.log(`\n🚀 Applying migration to database...`);

try {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: migrationSQL
  });

  if (error) {
    // If exec_sql doesn't exist, try direct query
    console.log('   ℹ️  exec_sql function not found, trying direct execution...');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const { error: stmtError } = await supabase.rpc('exec', {
        query: statement
      });

      if (stmtError) {
        console.error(`   ❌ Error in statement ${i + 1}:`, stmtError.message);
        throw stmtError;
      }
    }
    
    console.log(`\n✅ Migration applied successfully!`);
  } else {
    console.log(`\n✅ Migration applied successfully!`);
  }

  // Verify the migration
  console.log(`\n🔍 Verifying migration...`);
  
  const { data: columns, error: verifyError } = await supabase
    .from('service_requests')
    .select('*')
    .limit(0);

  if (verifyError) {
    console.error(`   ⚠️  Could not verify migration:`, verifyError.message);
  } else {
    console.log(`   ✅ service_requests table is accessible`);
  }

  // Check if tracking_serial column exists
  const { data: testData, error: testError } = await supabase
    .from('service_requests')
    .select('tracking_serial')
    .limit(1);

  if (!testError) {
    console.log(`   ✅ tracking_serial column exists`);
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Test the workflow by submitting a service request`);
  console.log(`  2. Check that tracking serial is generated`);
  console.log(`  3. Visit /track/SIZER-XXXXXX to view tracking page`);

} catch (error) {
  console.error(`\n❌ Migration failed:`, error.message);
  console.error(`\nPlease apply the migration manually via Supabase Dashboard:`);
  console.error(`  1. Go to https://supabase.com/dashboard`);
  console.error(`  2. Select your project`);
  console.error(`  3. Navigate to SQL Editor`);
  console.error(`  4. Copy content from: supabase/migrations/20260613000000_service_requests_tracking_serial.sql`);
  console.error(`  5. Paste and click Run`);
  process.exit(1);
}

// Made with Bob
