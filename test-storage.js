require("dotenv").config({ path: "./backend/.env" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://mldzaytxemuiemcfyzgs.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error("No service role key found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking buckets...");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) console.error("Bucket Error:", bucketError);
  else console.log("Buckets:", buckets.map(b => b.name));

  console.log("Checking profiles table...");
  const { data: cols, error: colError } = await supabase.rpc('get_table_columns', {
    table_name: 'profiles'
  });
  
  // If no RPC, just select 1
  const { data: profile, error: profError } = await supabase.from('profiles').select('*').limit(1);
  if (profError) {
      console.error("Profile check error:", profError);
  } else {
      console.log("Profile schema (keys):", profile.length > 0 ? Object.keys(profile[0]) : "No rows");
  }
}
check();
