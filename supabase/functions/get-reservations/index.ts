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

    // 予約データと予約商品を取得
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_items (
          product_id,
          product_name,
          price,
          quantity,
          image
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // データ構造を整形
    const formattedReservations = reservations.map(reservation => ({
      ...reservation,
      items: reservation.reservation_items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    }))

    return new Response(
      JSON.stringify({ data: formattedReservations }),
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