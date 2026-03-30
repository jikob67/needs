
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSupportResponse = async (userMessage: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      أنت مساعد دعم فني ذكي لتطبيق "needs".
      أنت خبير في توجيه المستخدمين لعمليات الدفع بالعملات الرقمية (Crypto Payments).
      إذا سأل المستخدم عن كيفية الدفع أو الـ Tx Hash، اشرح له:
      1. الـ Tx Hash هو "رقم المعاملة" ويجده في محفظته بعد إرسال العملات.
      2. يجب نسخ هذا الرقم ولصقه في صفحة المتجر ليقوم النظام بالتحقق منه تلقائياً عبر البلوكشين.
      3. نحن ندعم شبكات (Solana, Ethereum, Bitcoin, Sui, Monad).
      كن لطيفاً، عملياً، واستخدم اللغة العربية بشكل ودي.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "عذراً، لم أستطع فهم طلبك.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "واجهنا مشكلة تقنية.";
  }
};

export const getWheelchairRecommendation = async (
  userData: { age: string; weight: string; environment: string; control: string },
  products: Product[]
): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    const productsInfo = products
      .filter(p => p.type === 'WHEELCHAIR')
      .map(p => `ID: ${p.id}, العنوان: ${p.title}, السعر: ${p.price} ${p.currency}, الوصف: ${p.description}`)
      .join('\n');

    const prompt = `
      كمستشار طبي متخصص في الكراسي المتحركة، قم بتحليل حالة المستخدم التالية واقتراح الحل الأفضل:
      - العمر: ${userData.age}
      - الوزن التقريبي: ${userData.weight}
      - بيئة الاستخدام: ${userData.environment}
      - تفضيل التحكم: ${userData.control}

      قائمة الكراسي المتوفرة لدينا حالياً:
      ${productsInfo || 'لا توجد منتجات حالياً، قدم توصية عامة بنوع الكرسي المناسب.'}

      المطلوب:
      1. حدد نوع الكرسي المثالي لهذه الحالة (يدوي، كهربائي، خفيف الوزن، بوضعية الوقوف، إلخ).
      2. اشرح لماذا هذا النوع هو الأفضل بناءً على المعطيات.
      3. إذا كان هناك منتج من القائمة يناسبهم، اذكره باسمه.
      4. قدم 3 نصائح لاستخدام الكرسي بأمان.
      تحدث باللغة العربية بأسلوب مهني وودود.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "لم أستطع صياغة توصية دقيقة حالياً.";
  } catch (error) {
    console.error("Advisor AI Error:", error);
    return "عذراً، المستشار الذكي يواجه ضغطاً حالياً. حاول مجدداً.";
  }
};
