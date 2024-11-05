import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

type RegistrationRequest = {
  ticketId: string;
  participantInfo: {
    name: string;
    email: string;
    [key: string]: any;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;
  const { ticketId, participantInfo }: RegistrationRequest = req.body;

  if (!eventId || !ticketId || !participantInfo) {
    return res.status(400).json({ error: '必須項目が入力されていません' });
  }

  if (!participantInfo.name || !participantInfo.email) {
    return res.status(400).json({ error: '必須項目が入力されていません' });
  }

  try {
    // チケット在庫確認
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('remainingCount')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticketData) {
      return res.status(404).json({ error: 'チケットが見つかりません' });
    }

    if (ticketData.remainingCount <= 0) {
      return res.status(400).json({ error: 'チケットが売り切れです' });
    }

    // 参加登録処理
    const { data: registrationData, error: registrationError } = await supabase
      .from('registrations')
      .insert([
        {
          event_id: eventId,
          ticket_id: ticketId,
          participant_info: participantInfo,
          status: 'confirmed'
        }
      ])
      .select()
      .single();

    if (registrationError) {
      return res.status(500).json({ error: '参加登録に失敗しました' });
    }

    // チケット在庫数更新
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ remainingCount: ticketData.remainingCount - 1 })
      .eq('id', ticketId);

    if (updateError) {
      console.error('チケット在庫数の更新に失敗しました:', updateError);
    }

    // 確認メール送信
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: participantInfo.email,
          eventId: eventId,
          registrationId: registrationData.id
        }),
      });
    } catch (error) {
      console.error('確認メールの送信に失敗しました:', error);
    }

    return res.status(200).json({
      success: true,
      registrationId: registrationData.id
    });

  } catch (error) {
    console.error('参加登録処理でエラーが発生しました:', error);
    return res.status(500).json({ error: '参加登録に失敗しました' });
  }
}