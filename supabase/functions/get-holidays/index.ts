import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 定休日を取得
    const { data: regularHolidays, error: regularError } = await supabase
      .from('regular_holidays')
      .select('day_of_week')
      .order('day_of_week')

    if (regularError) {
      throw regularError
    }

    // 個別休業日を取得
    const { data: holidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('*')
      .order('date')

    if (holidaysError) {
      throw holidaysError
    }

    return new Response(
      JSON.stringify({ 
        regularHolidays: regularHolidays.map(h => h.day_of_week),
        holidays: holidays
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})