import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import dayjs from 'dayjs';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, startDate, endDate, groupBy = 'daily' } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'イベントIDが必要です' });
  }

  if ((startDate && !isValidDate(startDate as string)) || (endDate && !isValidDate(endDate as string))) {
    return res.status(400).json({ error: '不正な日付形式です' });
  }

  if (groupBy && !['daily', 'weekly'].includes(groupBy as string)) {
    return res.status(400).json({ error: '不正なグループ化パラメータです' });
  }

  try {
    const defaultStartDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const defaultEndDate = dayjs().format('YYYY-MM-DD');

    const start = startDate ? startDate as string : defaultStartDate;
    const end = endDate ? endDate as string : defaultEndDate;

    // ページビューデータの取得
    const pageViewsQuery = supabase
      .from('page_views')
      .select('date, count')
      .eq('event_id', eventId)
      .gte('date', start)
      .lte('date', end);

    if (groupBy === 'weekly') {
      pageViewsQuery.select(`
        date_trunc('week', date) as date,
        sum(count) as count
      `);
    }

    const { data: pageViewsData, error: pageViewsError, count: pageViewsCount } = await pageViewsQuery.execute();

    if (pageViewsError) throw pageViewsError;

    // 登録数データの取得
    const registrationsQuery = supabase
      .from('registrations')
      .select('created_at, count')
      .eq('event_id', eventId)
      .gte('created_at', start)
      .lte('created_at', end);

    if (groupBy === 'weekly') {
      registrationsQuery.select(`
        date_trunc('week', created_at) as date,
        count(*) as count
      `);
    }

    const { data: registrationsData, error: registrationsError, count: registrationsCount } = await registrationsQuery.execute();

    if (registrationsError) throw registrationsError;

    const response = {
      pageViews: {
        daily: pageViewsData || [],
        total: pageViewsCount || 0
      },
      registrations: {
        daily: registrationsData || [],
        total: registrationsCount || 0
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Analytics stats error:', error);
    
    // エラー時のフォールバックデータ
    const fallbackData = {
      pageViews: {
        daily: [
          { date: '2024-01-01', count: 100 },
          { date: '2024-01-02', count: 150 }
        ],
        total: 250
      },
      registrations: {
        daily: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 15 }
        ],
        total: 25
      }
    };

    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json(fallbackData);
    }

    return res.status(500).json({ error: 'データの取得に失敗しました' });
  }
}

function isValidDate(dateStr: string): boolean {
  const date = dayjs(dateStr);
  return date.isValid() && date.format('YYYY-MM-DD') === dateStr;
}