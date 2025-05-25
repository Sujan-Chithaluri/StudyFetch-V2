import { create } from 'zustand';

interface PdfStore {
  pdfText: string[];
  setPdfText: (text: string[]) => void;
}

export const usePdfStore = create<PdfStore>((set) => ({
  pdfText: [],
  setPdfText: (text) => set({ pdfText: text }),
}));