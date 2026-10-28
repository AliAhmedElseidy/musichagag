import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI instance
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    supportedModels: ['lyria-3-clip-preview', 'lyria-3-pro-preview'],
    defaultModel: 'lyria-3-clip-preview',
    bpm: 125,
    title: 'مهرجان حجاج مرسي حجاج',
  });
});

// Lyria Mahragan Generation Endpoint (Synchronous with aggregated payload)
app.post('/api/generate-mahragan', async (req, res) => {
  try {
    const {
      model = 'lyria-3-clip-preview',
      prompt: customPrompt,
      bpm = 125,
      singerName = 'حجاج مرسي حجاج',
      lyrics: customLyrics,
      mizmarIntensity = 'high',
      darbukaPattern = 'heavy-electro',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'مفتاح GEMINI_API_KEY غير موجود في إعدادات التطبيق. يرجى تفعيله لتشغيل نموذج Lyria.',
        code: 'MISSING_API_KEY',
      });
    }

    const ai = getAIClient();

    const defaultLyrics = `
[Intro - كلام دخول مهرجانات حماسي]
اصحى للكلام وركز في اللي جاي!
المجال ده ليه كبير واحد بس..
حَجّاج مَرْسِي حَجّاج.. السيطرة والهيبة كلها!
وزع يا ابني المزيكا دي!

[Verse 1 - إيقاع مهرجان مصري سريع]
على المبدأ ثابتين، وفي الجدعنة سابقين
اسأل علينا في أي جيهة، هتلاقينا معلمين
حَجّاج مَرْسِي لما يخش، كله يقف انتباه
ده الباشا صاحب الأصول، والرجولة ماشية معاه!

[Chorus - الكوبليه الرئيسي بطاقة عالية وصوت مزمار]
حَجّاج.. مَرْسِي حَجّاج!
ملك السيطرة وعالي المزاج!
يمشي في سكة الكل يوسع.. عشان الجدعنة ليها تاج!
حَجّاج.. مَرْسِي حَجّاج!
كلمته سيف ومش محتاج.. أسد المجال وملوش إزعاج!

[Verse 2 - تقسيمة طبلة ومزيكا شعبي]
صاحب صاحبه في الشدة يسد، ولا عمره يهاب من حد
قلبه أبيض بس في حقه، بيقلب الدنيا بجد
الناس مقامات وإحنا مقامنا فوق
حَجّاج مَرْسِي حَجّاج.. حضوره بيخلي الجو يروق!

[Outro - قفلة مهرجان]
خلصانة بشياكة..
حَجّاج مَرْسِي حَجّاج.. علامة مسجلة في الجدعنة!
`.trim();

    const lyricsToUse = customLyrics || defaultLyrics;

    // Detailed prompt optimized for Lyria Mahraganat Generation
    const systemMusicPrompt = customPrompt || `
Create a high-energy authentic Egyptian Mahraganat (Electro-Shaabi / مهرجانات مصرية) track at ${bpm} BPM dedicated to "${singerName}".
Musical elements:
- Extremely punchy and aggressive Egyptian electronic Darbuka / Tabla beats (${darbukaPattern} syncopated dum-tak patterns).
- Piercing loud traditional Egyptian Mizmar (مزمار بلدي صامت وحاد) hook and screaming synth leads in Maqam Rast / Bayati.
- Deep resonant 808 sub-bass slides, distorted electro-kick, and fast hi-hat trap rolls.
- Energetic male Mahraganat singer vocal delivery with authentic Egyptian street autotune and rhythmic chant cadence.
- Atmospheric Egyptian street wedding party vibes with crowd hype whistles, sweeps, and DJ build-ups.

Song Structure and Egyptian Arabic Lyrics to sing:
${lyricsToUse}
`.trim();

    const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    console.log(`[Lyria] Initiating music generation with model: ${selectedModel} at ${bpm} BPM...`);

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: systemMusicPrompt,
    });

    let audioBase64 = '';
    let extractedLyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !extractedLyrics) {
          extractedLyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      throw new Error('لم يتم استلام مقطع صوتي من نموذج Lyria. تأكد من تفعيل صلاحيات النموذج.');
    }

    console.log(`[Lyria] Audio generated successfully! Size: ${Math.round((audioBase64.length * 0.75) / 1024)} KB`);

    return res.json({
      success: true,
      audioBase64,
      mimeType,
      model: selectedModel,
      lyrics: extractedLyrics || lyricsToUse,
      bpm,
      trackTitle: `مهرجان حجاج مرسي حجاج - ملوك السيطرة (${bpm} BPM)`,
      singerName,
    });
  } catch (error: any) {
    console.error('[Lyria Generation Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء الاتصال بمحرك Lyria',
      details: error.toString(),
    });
  }
});

// SSE Streaming generation endpoint for real-time chunks
app.post('/api/generate-mahragan-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const {
      model = 'lyria-3-clip-preview',
      prompt: customPrompt,
      bpm = 125,
      singerName = 'حجاج مرسي حجاج',
      lyrics: customLyrics,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'مفتاح GEMINI_API_KEY غير متوفر في السيرفر.' })}\n\n`);
      return res.end();
    }

    const ai = getAIClient();
    const lyricsToUse = customLyrics || `[Intro] حجاج مرسي حجاج كبير المجال! [Chorus] ملك السيطرة وعالي المزاج!`;

    const systemMusicPrompt = customPrompt || `
High-energy Egyptian Mahraganat (Electro-Shaabi) track at ${bpm} BPM for "${singerName}".
Heavy electronic Darbuka beats, screaming loud Egyptian Mizmar melodies, heavy 808 sub-bass, and male autotuned Egyptian vocal chants singing:
${lyricsToUse}
`.trim();

    const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    res.write(`data: ${JSON.stringify({ type: 'status', message: 'بدء الاتصال بمحرك Lyria الموسيقي...' })}\n\n`);

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: systemMusicPrompt,
    });

    let totalAudioBytes = 0;

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          totalAudioBytes += part.inlineData.data.length;
          res.write(`data: ${JSON.stringify({
            type: 'audio_chunk',
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'audio/wav',
            receivedBytes: totalAudioBytes,
          })}\n\n`);
        }
        if (part.text) {
          res.write(`data: ${JSON.stringify({
            type: 'lyrics',
            text: part.text,
          })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done', totalBytes: totalAudioBytes })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('[Lyria Stream Error]:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'فشل توليد الصوت' })}\n\n`);
    res.end();
  }
});

// Serve frontend in dev (via Vite middleware) or prod (static dist)
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(port, () => {
    console.log(`[Server] Mahraganat Studio running on http://localhost:${port}`);
  });
});
