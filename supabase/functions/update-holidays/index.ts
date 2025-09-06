import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { type, data } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (type === 'regular') {
      // 定休日の更新
      const { regularHolidays } = data

      // 既存の定休日を削除
      await supabase.from('regular_holidays').delete().neq('id', 0)

      // 新しい定休日を挿入
      if (regularHolidays.length > 0) {
        const { error } = await supabase
          .from('regular_holidays')
          .insert(regularHolidays.map(day => ({ day_of_week: day })))

        if (error) throw error
      }

    } else if (type === 'add_holiday') {
      // 個別休業日の追加
      const { holiday } = data

      const { error } = await supabase
        .from('holidays')
        .insert({
          id: holiday.id,
          date: holiday.date,
          name: holiday.name,
          type: holiday.type
        })

      if (error) throw error

    } else if (type === 'delete_holiday') {
      // 個別休業日の削除
      const { holidayId } = data

      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', holidayId)

      if (error) throw error

    } else if (type === 'cleanup_past') {
      // 過去の休業日削除
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('holidays')
        .delete()
        .lt('date', today)

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
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