import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nzteebrfnvbtancyrphl.supabase.co'
const supabaseKey = 'sb_publishable_HC0Eu1xwiwea3Ls3m_rB3A_vn2kt6QB'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)