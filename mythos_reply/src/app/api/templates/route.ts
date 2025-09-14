import { NextRequest, NextResponse } from 'next/server';

const defaultTemplates = [
  {
    id: '1',
    name: "Supportive Response",
    description: "Encouraging reply for achievements or launches",
    category: "support",
    template: "🎉 Congratulations on {{achievement}}! 🔥 What's next on your roadmap?",
    variables: ["achievement"],
    symbols: { celebrate: "🎉", fire: "🔥", heart: "❤️" },
    tone: "supportive",
    usageCount: 0
  },
  {
    id: '2',
    name: "Professional Question",
    description: "Professional follow-up question",
    category: "question",
    template: "Interesting perspective on {{topic}}. 🤔 How do you see this evolving in the next {{timeframe}}?",
    variables: ["topic", "timeframe"],
    symbols: { thinking: "🤔", chart: "📊", bulb: "💡" },
    tone: "professional",
    usageCount: 0
  },
  {
    id: '3',
    name: "Casual Appreciation",
    description: "Casual way to show appreciation",
    category: "greeting",
    template: "Love this take! 👍 {{username}} always dropping gems 💎",
    variables: ["username"],
    symbols: { thumbs: "👍", gem: "💎", fire: "🔥" },
    tone: "casual",
    usageCount: 0
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tone = searchParams.get('tone');

    let filteredTemplates = [...defaultTemplates];

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (tone) {
      filteredTemplates = filteredTemplates.filter(t => t.tone === tone);
    }

    return NextResponse.json(filteredTemplates);

  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, template, variables = [], symbols = {}, tone } = body;

    if (!name || !template || !category || !tone) {
      return NextResponse.json(
        { error: 'Name, template, category, and tone are required' },
        { status: 400 }
      );
    }

    const newTemplate = {
      id: Date.now().toString(),
      name,
      description: description || '',
      category,
      template,
      variables,
      symbols,
      tone,
      usageCount: 0
    };

    return NextResponse.json(newTemplate, { status: 201 });

  } catch (error) {
    console.error('Templates POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}