
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qtatpfchqhimlyensrgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YXRwZmNocWhpbWx5ZW5zcmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEwNDgzMDUsImV4cCI6MTk5NjYyNDMwNX0.Hwec3O2rpeCxQ8piicHPJIGf5-xbaKTeUUsIQFro5UU';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;