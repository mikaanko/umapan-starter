import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { reservationData } = await req.json()
    
    const storeEmail = 'umapan.umauma@gmail.com'
    
    // RESEND_API_KEYの存在確認
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email sending')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reservation saved, email sending skipped (API key not configured)'
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
    
    // お客様への確認メール内容
    const customerEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #92400e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-family: 'Pacifico', serif;">うまじのパン屋</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">ご予約ありがとうございます</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">
            ${reservationData.name} 様
          </h2>
          
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
            この度は「うまじのパン屋」をご利用いただき、誠にありがとうございます。<br>
            ご予約を承りましたので、下記内容をご確認ください。
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #d97706; padding-bottom: 8px;">
              📋 ご予約内容
            </h3>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="padding: 5px 0; color: #6b7280; width: 120px;">予約タイプ：</td><td style="color: #374151; font-weight: 600;">${reservationData.type}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">受取日：</td><td style="color: #374151; font-weight: 600;">${reservationData.date}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">受取時間：</td><td style="color: #374151; font-weight: 600;">${reservationData.time}</td></tr>
              <tr><td style="padding: 5px 0; color: #6b7280;">お電話番号：</td><td style="color: #374151;">${reservationData.phone}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 15px 0;">🍞 ご注文商品</h3>
            ${reservationData.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fcd34d;">
                <span style="color: #92400e;">${item.name} × ${item.quantity}</span>
                <span style="color: #92400e; font-weight: 600;">¥${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 15px 0 5px 0; font-size: 16px; font-weight: bold; color: #92400e;">
              <span>合計金額</span>
              <span>¥${reservationData.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">⚠️ 重要なお知らせ</h3>
            <ul style="color: #1e40af; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>営業時間は9:00〜18:00です（売り切れ次第終了）</li>
              <li>お受け取り時間にお越しいただけない場合は、お電話でご連絡ください</li>
              <li>当日の状況により、一部商品が変更になる場合があります</li>
              ${reservationData.type === '事前予約' ? '<li>事前予約商品は前日に製造準備を行います</li>' : ''}
            </ul>
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
            ご不明な点がございましたら、お気軽にお電話でお問い合わせください。<br>
            皆様にお会いできることを楽しみにしております。
          </p>
        </div>
      </div>
    `

    // 店舗への通知メール内容
    const storeEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; font-size: 24px; margin: 0;">🔔 新しいご予約が入りました</h1>
        </div>
        
        <div style="padding: 20px; background: white; border: 1px solid #e5e7eb;">
          <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; font-size: 18px; margin: 0;">予約詳細 #${Date.now()}</h2>
            <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">受付日時: ${new Date().toLocaleString('ja-JP')}</p>
          </div>
          
          <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold; width: 120px;">予約タイプ</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservationData.type}</td></tr>
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">受取日</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${reservationData.date}</td></tr>
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">受取時間</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${reservationData.time}</td></tr>
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">お客様名</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservationData.name}</td></tr>
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">電話番号</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservationData.phone}</td></tr>
            <tr><td style="padding: 8px; background: #f9fafb; font-weight: bold;">メール</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservationData.email}</td></tr>
          </table>
          
          <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">🍞 注文商品</h3>
            ${reservationData.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #fcd34d;">
                <span>${item.name} × ${item.quantity}</span>
                <span style="font-weight: bold;">¥${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; padding: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #92400e; border-top: 2px solid #f59e0b;">
              <span>合計金額</span>
              <span>¥${reservationData.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 6px;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              ✅ お客様には自動で確認メールを送信済みです<br>
              📋 管理画面で予約の承認・管理を行ってください
            </p>
          </div>
        </div>
      </div>
    `

    try {
      // お客様への確認メール送信
      const customerEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'うまじのパン屋 <noreply@readdy.ai>',
          to: [reservationData.email],
          subject: `【うまじのパン屋】ご予約確認 - ${reservationData.date} ${reservationData.time}`,
          html: customerEmailHtml,
        }),
      })

      // 店舗への通知メール送信
      const storeEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '予約システム <noreply@readdy.ai>',
          to: [storeEmail],
          subject: `🔔 新しいご予約 - ${reservationData.name}様 (${reservationData.date} ${reservationData.time})`,
          html: storeEmailHtml,
        }),
      })

      const customerResult = await customerEmailResponse.json()
      const storeResult = await storeEmailResponse.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          customerEmail: customerResult,
          storeEmail: storeResult
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
          message: 'Reservation saved, but email sending failed',
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