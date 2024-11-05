import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type SurveyAnswer = {
  questionId: string;
  answer: string;
};

type SurveyResponse = {
  eventId: string;
  surveyId: string;
  participantId: string;
  answers: SurveyAnswer[];
};

const validateAnswers = (answers: SurveyAnswer[]): boolean => {
  return answers.every(answer => 
    answer.questionId && 
    answer.answer && 
    answer.answer.trim().length > 0
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;
    const { surveyId, participantId, answers }: SurveyResponse = req.body;

    if (!eventId || !surveyId || !participantId || !answers) {
      return res.status(400).json({ error: '必須パラメータが不足しています' });
    }

    if (!validateAnswers(answers)) {
      return res.status(400).json({ error: '無効な回答データです' });
    }

    // イベントの存在確認
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'イベントが見つかりません' });
    }

    // 重複回答チェック
    const { data: existingResponse, error: existingError } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('participant_id', participantId)
      .single();

    if (existingResponse) {
      return res.status(409).json({ error: '既に回答が存在します' });
    }

    // 回答の保存
    const { data: response, error: insertError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        participant_id: participantId,
        answers: answers,
        submitted_at: new Date().toISOString()
      })
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // AIを使用した回答の分析（オプション）
    try {
      const analysisPrompt = `以下のアンケート回答を分析してください:
${JSON.stringify(answers)}`;
      const analysis = await getLlmModelAndGenerateContent('Gemini', 'アンケート回答の分析を行います', analysisPrompt);
      
      await supabase
        .from('survey_responses')
        .update({ analysis })
        .eq('id', response.id);
    } catch (analysisError) {
      console.error('回答分析中にエラーが発生しました:', analysisError);
    }

    // 回答完了通知の送信
    try {
      const { data: participant } = await supabase
        .from('participants')
        .select('email')
        .eq('id', participantId)
        .single();

      if (participant?.email) {
        // メール送信処理（実装は省略）
        console.log('回答完了メールを送信:', participant.email);
      }
    } catch (notificationError) {
      console.error('通知送信中にエラーが発生しました:', notificationError);
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('アンケート回答の保存中にエラーが発生しました:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}