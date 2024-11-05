import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;
  if (!eventId || Array.isArray(eventId)) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(Array.isArray(page) ? page[0] : page);
    const limitNumber = parseInt(Array.isArray(limit) ? limit[0] : limit);
    const offset = (pageNumber - 1) * limitNumber;

    let query = supabase
      .from('registrations')
      .select(`
        id,
        participant_info->name as name,
        participant_info->email as email,
        status,
        created_at as registeredAt,
        tickets (
          name as ticketType
        )
      `)
      .eq('event_id', eventId);

    if (search) {
      const searchTerm = Array.isArray(search) ? search[0] : search;
      query = query.ilike('participant_info->>name', `%${searchTerm}%`);
    }

    if (status) {
      const statusFilter = Array.isArray(status) ? status[0] : status;
      query = query.eq('status', statusFilter);
    }

    const { data: participants, error: dbError, count } = await query
      .range(offset, offset + limitNumber - 1)
      .order('created_at', { ascending: false });

    if (dbError) {
      throw dbError;
    }

    const formattedParticipants = participants?.map(participant => ({
      id: participant.id,
      name: participant.name,
      email: participant.email,
      status: participant.status,
      ticketType: participant.tickets?.ticketType || '未設定',
      registeredAt: participant.registeredAt
    })) || [];

    return res.status(200).json({
      participants: formattedParticipants,
      total: count || 0
    });

  } catch (error) {
    console.error('Error fetching participants:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}