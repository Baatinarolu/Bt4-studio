import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const productId = formData.get('productId') as string

  if (!file || !productId) {
    return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 })
  }

  // === Send to Telegram Storage Channel ===
  const botToken = process.env.TELEGRAM_BOT_TOKEN!
  const channelId = process.env.TELEGRAM_STORAGE_CHANNEL_ID!

  const tgForm = new FormData()
  tgForm.append('chat_id', channelId)
  tgForm.append('document', file, file.name)
  tgForm.append('caption', `Product: ${productId} | Seller: ${user.id}`)

  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: 'POST',
    body: tgForm,
  })

  const tgData = await tgRes.json()

  if (!tgData.ok) {
    console.error('Telegram upload failed:', tgData)
    return NextResponse.json({ error: 'Telegram upload failed', details: tgData }, { status: 500 })
  }

  const fileId = tgData.result.document?.file_id || tgData.result.video?.file_id

  if (!fileId) {
    return NextResponse.json({ error: 'No file_id returned from Telegram' }, { status: 500 })
  }

  // Update product
  const { error: updateError } = await supabase
    .from('products')
    .update({ telegramFileId: fileId })
    .eq('id', productId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save file_id', details: updateError }, { status: 500 })
  }

  return NextResponse.json({ success: true, fileId })
}
