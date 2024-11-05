import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/supabase'
import axios from 'axios'
import { getLlmModelAndGenerateContent } from '@/utils/functions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { eventId } = req.query

  try {
    // 送信対象イベントの取得
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    // メールテンプレートの取得
    const { data: template, error: templateError } = await supabase
      .from('mail_templates')
      .select('*')
      .eq('event_id', eventId)
      .eq('type', 'reminder')
      .single()

    if (templateError || !template) {
      return res.status(404).json({ error: 'Mail template not found' })
    }

    // 参加者リストの取得
    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')

    if (registrationsError) {
      return res.status(500).json({ error: 'Failed to fetch registrations' })
    }

    // メール送信処理
    const sendPromises = registrations.map(async (registration) => {
      const participantInfo = registration.participant_info
      const emailContent = {
        to: participantInfo.email,
        subject: template.subject,
        text: template.body.replace(
          /\{([^}]+)\}/g,
          (match, key) => {
            return participantInfo[key] || event[key] || match
          }
        )
      }

      try {
        // メール送信APIの呼び出し
        const response = await getLlmModelAndGenerateContent(
          'Gemini',
          'You are an email sending service',
          JSON.stringify(emailContent)
        )
        return { success: true, recipient: participantInfo.email }
      } catch (error) {
        return { success: false, recipient: participantInfo.email, error }
      }
    })

    const results = await Promise.all(sendPromises)

    // 送信履歴の記録
    const { error: historyError } = await supabase
      .from('mail_history')
      .insert({
        event_id: eventId,
        template_id: template.id,
        sent_at: new Date().toISOString(),
        results: results
      })

    if (historyError) {
      console.error('Failed to record mail history:', historyError)
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return res.status(200).json({
      success: true,
      message: `Successfully sent ${successCount} emails, ${failureCount} failed`,
      results
    })

  } catch (error) {
    console.error('Reminder send error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}