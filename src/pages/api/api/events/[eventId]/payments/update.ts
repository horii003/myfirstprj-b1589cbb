import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getLlmModelAndGenerateContent } from '@/utils/functions';
import { supabase } from '@/supabase';

const VALID_PAYMENT_STATUSES = ['未払い', '支払い済み', 'キャンセル', '返金済み'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, paymentId } = req.query;
  const { status } = req.body;

  if (!eventId || !paymentId || !status) {
    return res.status(400).json({ error: '必須パラメータが不足しています' });
  }

  if (!VALID_PAYMENT_STATUSES.includes(status)) {
    return res.status(400).json({ error: '無効な支払いステータスです' });
  }

  try {
    // 支払い情報の取得
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('event_id', eventId)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ error: '支払い情報が見つかりません' });
    }

    // 支払い状態の更新
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .single();

    if (updateError) {
      throw updateError;
    }

    // 更新履歴の記録
    const { error: historyError } = await supabase
      .from('payment_histories')
      .insert({
        payment_id: paymentId,
        old_status: payment.status,
        new_status: status,
        updated_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('履歴記録エラー:', historyError);
    }

    // 支払い完了時のメール送信
    if (status === '支払い済み') {
      try {
        const emailContent = await getLlmModelAndGenerateContent(
          'Gemini',
          'イベント支払い完了メールを作成してください',
          `イベント: ${payment.event_title}
参加者: ${payment.participant_name}
金額: ${payment.amount}円`
        );

        await supabase
          .from('mail_queue')
          .insert({
            to_email: payment.participant_email,
            subject: '【支払い完了】イベント参加費用の入金確認完了のお知らせ',
            body: emailContent,
            status: 'pending'
          });
      } catch (emailError) {
        console.error('メール送信エラー:', emailError);
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedPayment
    });

  } catch (error) {
    console.error('エラー:', error);
    return res.status(500).json({
      error: error.message || 'データベースエラー'
    });
  }
}