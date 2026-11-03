import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const sourceLinks = [
  { label: 'India.gov.in', url: 'https://www.india.gov.in/' },
  { label: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
  { label: 'Karnataka Seva Sindhu', url: 'https://sevasindhu.karnataka.gov.in/' },
  { label: 'Passport Seva', url: 'https://www.passportindia.gov.in/' },
  { label: 'Voters’ Services Portal', url: 'https://voters.eci.gov.in/' },
];
const requestWindows = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    const now = Date.now();
    const client = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const windowState = requestWindows.get(client);
    if (windowState && windowState.resetAt > now && windowState.count >= 20) {
      return NextResponse.json({ answer: 'You have reached the assistant request limit. Please try again in a minute.' }, { status: 429 });
    }
    requestWindows.set(client, windowState && windowState.resetAt > now ? { count: windowState.count + 1, resetAt: windowState.resetAt } : { count: 1, resetAt: now + 60_000 });
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1600) : '';
    const language = typeof body.language === 'string' ? body.language : 'English';
    const context = Array.isArray(body.context) ? body.context.slice(-6) : [];
    if (!message) return NextResponse.json({ answer: 'Please tell me what you need help with.' }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ answer: 'The AI connection is not configured in this deployment yet. You can still use the verified scheme and service directories, or add a server-only GEMINI_API_KEY to enable conversational guidance.', sources: sourceLinks.slice(0, 1) });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are JanSetu AI, a careful public-service guide for India. Answer in ${language}. Use simple, direct language for people with limited digital literacy. Never invent eligibility, deadlines, fees, processing times or procedures. If you are unsure, say so. Distinguish guidance from a government decision. Prefer official Indian government sources. Include a short "Sources to verify" line when relevant. Conversation context: ${JSON.stringify(context)}\nCitizen question: ${message}`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    return NextResponse.json({ answer, sources: sourceLinks.filter((source) => answer.toLowerCase().includes(source.label.toLowerCase().split(' ')[0].toLowerCase())).slice(0, 3) });
  } catch {
    return NextResponse.json({ answer: 'I could not reach the assistant right now. Please use the official links in the directories below and try again shortly.', sources: [{ label: 'India.gov.in', url: 'https://www.india.gov.in/' }] }, { status: 200 });
  }
}
