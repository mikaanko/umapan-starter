import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { reservation, reason } = await req.json()
    
    // RESEND_API_KEYの存在確認
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email sending')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cancel processed, email sending skipped (API key not configured)'
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        }
      )
    }
    
    // キャンセル通知メール内容
    const cancelEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-family: 'Pacifico', serif;">うまじのパン屋</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">予約キャンセルのお知らせ</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">
            ${reservation.customerName} 様
          </h2>
          
          <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #dc2626; font-size: 18px; margin: 0 0 10px 0;">⚠️ 予約キャンセルのお知らせ</h3>
            <p style="color: #7f1d1d; line-height: 1.6; margin: 0;">
              誠に申し訳ございませんが、下記のご予約をキャンセルさせていただくことになりました。
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">
              📋 キャンセル対象予約
            </h3>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="padding: 5px 0; color: #6b7280; width: 120px;">予約番号：</td><td style="color: #374151; font-weight: 600;">#${reservation.id}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">予約タイプ：</td><td style="color: #374151; font-weight: 600;">${reservation.type}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">受取予定日：</td><td style="color: #374151; font-weight: 600;">${reservation.date}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">受取予定時間：</td><td style="color: #374151; font-weight: 600;">${reservation.time}</td></tr>
            </table>
          </div>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 15px 0;">🍞 キャンセル商品</h3>
            ${reservation.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fcd34d;">
                <span style="color: #92400e;">${item.name} × ${item.quantity}</span>
                <span style="color: #92400e; font-weight: 600;">¥${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 15px 0 5px 0; font-size: 16px; font-weight: bold; color: #92400e;">
              <span>合計金額</span>
              <span>¥${reservation.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          
          ${reason ? `
          <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">📝 キャンセル理由</h3>
            <p style="color: #92400e; line-height: 1.6; margin: 0;">
              ${reason}
            </p>
          </div>
          ` : ''}
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">💙 お詫びとお願い</h3>
            <p style="color: #1e40af; line-height: 1.6; margin: 0; font-size: 14px;">
              この度は、ご迷惑をおかけして誠に申し訳ございません。<br>
              またの機会にぜひお越しいただけますよう、心よりお待ちしております。<br><br>
              ご不明な点がございましたら、お気軽にお電話でお問い合わせください。
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <div style="background: #374151; color: white; padding: 20px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px;">📍 店舗情報</h4>
              <p style="margin: 0; line-height: 1.6;">
                うまじのパン屋<br>
                高知県安芸郡馬路村馬路3888-1<br>
                TEL: (0887)44-2555<br>
                営業時間: 9:00〜18:00
              </p>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px; line-height: 1.6;">
            改めて、この度はご迷惑をおかけして誠に申し訳ございませんでした。<br>
            今後ともどうぞよろしくお願いいたします。
          </p>
        </div>
      </div>
    `

    try {
      // キャンセル通知メール送信
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'うまじのパン屋 <noreply@readdy.ai>',
          to: [reservation.email],
          subject: `【うまじのパン屋】予約キャンセルのお知らせ - 予約#${reservation.id}`,
          html: cancelEmailHtml,
        }),
      })

      const result = await emailResponse.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailResult: result
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        }
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cancel processed, but email sending failed',
          error: emailError.message
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        }
      )
    }
  } catch (error) {
    console.error('Function error:', error)
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