import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getSession } from '@/server/auth-guard';
import { createElectroBotTools } from '@/server/ai/tools';
import { Conversation } from '@/server/models/Conversation';
import { connectToDatabase } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, id: conversationId, context } = await req.json();
  const session = await getSession();

  await connectToDatabase();

  // Intent routing: detect if user query is a simple FAQ/greeting vs complex product evaluation
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const isComplexComparison = /compare|vs|versus|difference|specs|recommend|budget/i.test(lastUserMessage);
  const isSimpleGreeting = /^(hi|hello|hey|help|store hours|shipping policy|return policy)/i.test(lastUserMessage.trim());

  // Model selection: gpt-5.4-nano for fast/cheap routing, gpt-5.4 for deep reasoning
  const modelToUse: any = isSimpleGreeting
    ? openai('gpt-5.4-nano' as any)
    : openai('gpt-5.4' as any, {
        structuredOutputs: true,
      } as any);

  const tools: any = createElectroBotTools(session);

  const result = streamText({
    model: modelToUse,
    system: `You are ElectroBot, an expert AI Electronics Sales Consultant for ElectroStore AI.
Your purpose is to provide precise, technically sound recommendations on computers, GPUs, monitors, peripherals, and consumer electronics.
Rules:
1. Always state exact prices and specifications fetched from your tools. NEVER hallucinate specs or pricing.
2. When comparing products, use compareProducts tool and produce a clear side-by-side comparison highlighting best-in-class features.
3. For adding items to cart, invoke addToCart, which prompts the user with an interactive confirmation approval card.
4. Keep answers concise, authoritative, and helpful.`,
    messages,
    tools,
    onFinish: async (event: any) => {
      try {
        if (conversationId) {
          await Conversation.findOneAndUpdate(
            { _id: conversationId },
            {
              $set: {
                userId: session?.user?.id,
                context: context || { lastViewedProducts: [] },
                isActive: true,
              },
              $push: {
                messages: {
                  $each: [
                    ...messages.slice(-1),
                    {
                      id: `asst-${Date.now()}`,
                      role: 'assistant',
                      content: event.text,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.error('Failed to persist conversation history:', err);
      }
    },
  } as any);

  return (result as any).toDataStreamResponse
    ? (result as any).toDataStreamResponse()
    : (result as any).toTextStreamResponse();
}
