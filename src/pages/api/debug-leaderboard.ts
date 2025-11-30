import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const envCheck = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  let dbCheck = {};
  try {
    const { data, error, count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('students')
      .select('id, name, points')
      .limit(5);

    dbCheck = {
      connectionSuccess: !error,
      error: error,
      count: count,
      sampleData: sampleData,
      sampleError: sampleError
    };
  } catch (e) {
    dbCheck = { error: e };
  }

  res.status(200).json({
    environment: envCheck,
    database: dbCheck,
    message: "If environment.hasUrl is false, you are using the stub client which returns empty data."
  });
}
