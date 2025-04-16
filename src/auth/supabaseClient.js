import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkkmrbytgckoldrlbhwg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra21yYnl0Z2Nrb2xkcmxiaHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTkxMjAsImV4cCI6MjA2MDM5NTEyMH0.Yaj9333NzPS9vgZKC1bSIuM4YnW_yRrlVH98j635eM8'

export const supabase = createClient(supabaseUrl, supabaseKey)
