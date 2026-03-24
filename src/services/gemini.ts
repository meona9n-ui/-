import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3-flash-preview';

export async function generateCourseList(country: string, city: string, major: string, freeOnly: boolean = false): Promise<string> {
  const freeText = freeOnly ? "يرجى التركيز حصرياً على الكورسات المجانية (غير المدفوعة) بالكامل، سواء الحضورية أو الأونلاين، وتجنب ذكر الكورسات المدفوعة." : "";
  const prompt = `أنت مساعد جامعي ذكي مخصص للطلاب في الدول العربية.
بناءً على البيانات التالية:
- الدولة: ${country}
- المحافظة/المدينة: ${city}
- التخصص: ${major}

يرجى تنفيذ الخطوة الأولى (حصر الكورسات):
1. ابحث واقترح قائمة بالكورسات المتاحة حضوريًا في الجامعات والمعاهد في هذه المنطقة.
2. اعرض أيضًا الكورسات الأونلاين المرتبطة بنفس المجال أو التخصص من منصات مثل (Coursera, Edraak, Rwaq, FutureLearn وغيرها).
${freeText}
نسق الإجابة بشكل واضح ومنظم باستخدام Markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text || 'عذراً، لم أتمكن من توليد الرد.';
}

export async function generateStudySchedule(courses: string, hours: string): Promise<string> {
  const prompt = `أنت مساعد جامعي ذكي.
لدي الكورسات/المواد التالية: ${courses}
وعدد ساعات المذاكرة المتاحة يومياً: ${hours} ساعات.

يرجى تنفيذ الخطوة الثانية (تنظيم الوقت):
1. أنشئ جدول مذاكرة يومي وأسبوعي متوازن.
2. أضف تنبيهات ومقترحات للمواعيد المهمة (محاضرات، امتحانات، مراجعات).
3. اقترح خطة متوازنة بين الكورسات الحضورية والأونلاين.
نسق الإجابة بشكل واضح ومنظم باستخدام Markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text || 'عذراً، لم أتمكن من توليد الرد.';
}

export async function summarizeDocument(base64Data: string, mimeType: string, isExtraBook: boolean = false): Promise<string> {
  const prompt = `أنت مساعد جامعي ذكي.
تم رفع هذا المستند الجامعي. يرجى تنفيذ الخطوة الثالثة (أو السابعة إذا كان كتاباً إضافياً):
1. لخص كل فصل في نقاط أساسية.
2. قسم الكتاب إلى أجزاء صغيرة يمكن مذاكرتها يوميًا.
3. أنشئ مراجعة شاملة ليلة الامتحان.
${isExtraBook ? '4. قدم أمثلة عملية أو تطبيقية تساعد الطالب على فهم المحتوى وربطه بالواقع.' : ''}
نسق الإجابة بشكل واضح ومنظم باستخدام Markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
  });
  return response.text || 'عذراً، لم أتمكن من توليد الرد.';
}

export async function generateQuiz(context: string): Promise<string> {
  const prompt = `أنت مساعد جامعي ذكي.
بناءً على المحتوى أو الملخص التالي:
"""
${context}
"""

يرجى تنفيذ الخطوة الرابعة (توليد أسئلة وامتحانات):
1. أنشئ 5 أسئلة تدريبية متنوعة (اختيار من متعدد، صح/خطأ، إجابات قصيرة) لكل جزء رئيسي.
2. في النهاية، أنشئ امتحان شامل يغطي المحتوى كله.
3. قم بتوفير الإجابات الصحيحة في نهاية الرد.
نسق الإجابة بشكل واضح ومنظم باستخدام Markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text || 'عذراً، لم أتمكن من توليد الرد.';
}

export async function explainConcept(question: string): Promise<string> {
  const prompt = `أنت مساعد جامعي ذكي.
طلب الطالب شرح السؤال أو المفهوم التالي:
"${question}"

يرجى تنفيذ الخطوة الخامسة (شرح الأسئلة الصعبة):
1. قدم شرحًا مبسطًا خطوة بخطوة.
2. استخدم أمثلة عملية واربط المفهوم بالواقع لتسهيل الفهم.
نسق الإجابة بشكل واضح ومنظم باستخدام Markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text || 'عذراً، لم أتمكن من توليد الرد.';
}
