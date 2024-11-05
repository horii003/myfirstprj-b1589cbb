import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

type AttendanceStatus = '出席' | '欠席' | '遅刻' | '早退';

interface UpdateAttendanceRequest {
  participantId: string;
  status: AttendanceStatus;
  note?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    const { participantId, status, note } = req.body as UpdateAttendanceRequest;

    if (!participantId) {
      return res.status(400).json({ error: '参加者IDは必須です' });
    }

    if (!status) {
      return res.status(400).json({ error: '出欠状態は必須です' });
    }

    // 参加者の存在確認
    const { data: participant, error: participantError } = await supabase
      .from('registrations')
      .select('id')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (participantError || !participant) {
      return res.status(404).json({ error: '参加者が見つかりません' });
    }

    // 出欠状態の更新
    const { data: updatedAttendance, error: updateError } = await supabase
      .from('registrations')
      .update({
        attendance: status,
        attendance_note: note
      })
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (updateError) {
      throw new Error('出欠状態の更新に失敗しました');
    }

    // 出欠履歴の記録
    const { error: historyError } = await supabase
      .from('attendance_history')
      .insert({
        participant_id: participantId,
        event_id: eventId,
        status: status,
        note: note
      });

    if (historyError) {
      console.error('出欠履歴の記録に失敗しました:', historyError);
    }

    return res.status(200).json({
      success: true,
      data: updatedAttendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : '出欠状態の更新に失敗しました'
    });
  }
}