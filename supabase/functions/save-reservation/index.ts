import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { reservationData } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 予約データを保存
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        id: reservationData.id,
        type: reservationData.type,
        date: reservationData.date,
        time: reservationData.time,
        name: reservationData.name,
        phone: reservationData.phone,
        email: reservationData.email,
        comments: reservationData.comments || '',
        total_price: reservationData.totalPrice,
        status: reservationData.status || 'pending'
      })
      .select()
      .single()

    if (reservationError) {
      throw reservationError
    }

    // 予約商品を保存
    const itemsData = reservationData.items.map(item => ({
      reservation_id: reservationData.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }))

    const { error: itemsError } = await supabase
      .from('reservation_items')
      .insert(itemsData)

    if (itemsError) {
      throw itemsError
    }

    // 在庫を減らす
    for (const item of reservationData.items) {
      const stockColumn = reservationData.type === '当日お取り置き' ? 'today_stock' : 'advance_stock'
      
      const { error: stockError } = await supabase.rpc('decrease_stock', {
        product_id: item.id,
        quantity: item.quantity,
        stock_type: stockColumn
      })
      
      if (stockError) {
        console.error('Stock update error:', stockError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: reservation
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