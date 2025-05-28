import { create } from 'zustand';

interface PdfStore {
  pdfText: string[];
  pdfAnnotations: Record<number, string[]>;
  setPdfText: (text: string[]) => void;
  setAnnotations: (annotations: Record<number, string[]>) => void;
  addAnnotation: (page: number, annotation: string) => void;
}

export const usePdfStore = create<PdfStore>((set) => ({
  pdfText: [],
  pdfAnnotations: {},
  setPdfText: (text) => set({ pdfText: text }),
  setAnnotations: (annotations) => set({ pdfAnnotations: annotations }),
  addAnnotation: (page, annotation) => set((state) => ({
    pdfAnnotations: {
      ...state.pdfAnnotations,
      [page]: [...(state.pdfAnnotations[page] || []), annotation]
    }
  })),
}));
