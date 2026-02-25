import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Exportando a interface
export interface AutorInfo {
  nome: string;
  idade: string;
  especialidades: string[];
  textoIntro: string;
  textoFormacao: string;
  textoMissao: string;
  imagemUrl: string;
  instagramUrl: string;
  logoUrl?: string;
}

const AUTOR_DOC_ID = 'sobre_a_autora';

export const autorService = {
  getAutorInfo: async (): Promise<AutorInfo | null> => {
    try {
      const docRef = doc(db, 'configuracoes', AUTOR_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AutorInfo;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar informações da autora:", error);
      return null;
    }
  },

  salvarAutorInfo: async (info: AutorInfo): Promise<boolean> => {
    try {
      const docRef = doc(db, 'configuracoes', AUTOR_DOC_ID);
      await setDoc(docRef, info);
      return true;
    } catch (error) {
      console.error("Erro ao salvar informações da autora:", error);
      return false;
    }
  }
};