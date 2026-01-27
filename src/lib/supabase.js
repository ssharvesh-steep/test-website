import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkrqvlbsshhzavclphve.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcnF2bGJzc2hoemF2Y2xwaHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE3NjcsImV4cCI6MjA4MzUxNzc2N30.zNvnUm0Rrrm8xRmbIT-TIQuJZrSem3CPoVkOe-sieTQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
