import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type EventData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tickets: {
    name: string;
    price: number;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const eventData = req.body as EventData;

    // バリデーション
    if (!eventData.title) {
      return res.status(400).json({ error: 'イベント名は必須です' });
    }

    if (!eventData.startDate || !eventData.endDate) {
      return res.status(400).json({ error: '開催日時は必須です' });
    }

    const startDateTime = new Date(eventData.startDate);
    const endDateTime = new Date(eventData.endDate);

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ error: '開始日時は終了日時より前に設定してください' });
    }

    // イベント基本情報の保存
    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        start_datetime: eventData.startDate,
        end_datetime: eventData.endDate,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (eventError) {
      throw new Error('イベント作成エラー');
    }

    // チケット情報の保存
    if (eventData.tickets && eventData.tickets.length > 0) {
      const tickets = eventData.tickets.map(ticket => ({
        event_id: eventResult.id,
        name: ticket.name,
        price: ticket.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: ticketError } = await supabase
        .from('tickets')
        .insert(tickets);

      if (ticketError) {
        throw new Error('チケット情報保存エラー');
      }
    }

    return res.status(200).json({ id: eventResult.id });

  } catch (error) {
    console.error('イベント作成エラー:', error);
    return res.status(500).json({ error: 'イベントの作成に失敗しました' });
  }
}