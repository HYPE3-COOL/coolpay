import '@/app/polyfills';
import { NextRequest, NextResponse } from 'next/server';
import { AiService, PromptType } from '@/services/ai.service';
import { UserRepository } from '@/repositories/user.repository';
import { CoolPayService } from '@/services/coolpay.service';
import { env } from '@/env';
import { sendWarning } from '@/utils/twitter-api';

export async function POST(request: NextRequest) {

  const tweet_id = '1942753531326578699'
  const requestUrl = `${env.HOST}requests/${tweet_id}`;
  const message = `✅ Your request is live here: ${requestUrl} Expect reply in 48 hours.`
  await sendWarning(message, tweet_id);

  // const userRepository = new UserRepository();
  // const user = await userRepository.findById(3); // Example: Fetch user with ID 1

  // const totalCount = await CoolPayService.countActivities({ is_live: true });
  // const activities = await CoolPayService.getActivities({ is_live: true });

  // const meta = {
  //   count: activities.length,
  //   total: totalCount,
  //   page,
  //   pageCount: Math.ceil(totalCount / pageSize),
  //   pageSize,
  // };

  return NextResponse.json({
    status: 'success',
    // data: activities,
    // data: user,
  });
  // .findByUsername('testuser');
  // const { text } = await request.json();
  // if (!text) {
  //   return NextResponse.json({ error: 'Missing text in request body.' }, { status: 400 });
  // }

  // const result = await AiService.analyze(PromptType.Instruction, text);
  // return NextResponse.json(result);
}