
import { GoogleGenAI } from "@google/genai";
import { MonthlyBudget } from "../types";

export const analyzeFinance = async (budget: MonthlyBudget): Promise<string> => {
  // Fix: Initialize GoogleGenAI with named parameter as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalActual = budget.items.reduce((sum, item) => sum + item.actual, 0);
  const totalBudget = budget.items.reduce((sum, item) => sum + item.budget, 0);
  const surplus = budget.income - totalActual;

  const prompt = `
    Saya memiliki data keuangan bulanan berikut dalam IDR (Rupiah):
    - Gaji (Take Home Pay): ${budget.income}
    - Total Anggaran: ${totalBudget}
    - Total Pengeluaran Aktual: ${totalActual}
    - Sisa Saldo: ${surplus}

    Berikut detail item pengeluaran (Nama - Anggaran - Aktual):
    ${budget.items.map(i => `${i.name}: Budget ${i.budget}, Actual ${i.actual}`).join('\n')}

    Tolong berikan:
    1. Analisis singkat kondisi keuangan saya saat ini.
    2. 3 rekomendasi praktis untuk mengoptimalkan pengeluaran saya.
    3. Analisis apakah tabungan saya sudah cukup proporsional dengan gaji saya.
    
    Tuliskan dalam Bahasa Indonesia yang profesional dan ramah.
  `;

  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning/analysis tasks
    // Fix: Using explicit parts structure for clarity
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    // Fix: Solely use the .text property (not a method) as per guidelines
    return response.text || "Maaf, AI asisten sedang tidak dapat memberikan analisis.";
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};
