import { useState } from 'react';

export const useCloudinaryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setLoading(true);
    setError(null);

    // Puxa as chaves que você colocou no .env
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Erro: Chaves do Cloudinary não encontradas no .env");
      setLoading(false);
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      // Faz o envio direto para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro no upload da imagem');
      }

      setUrl(data.secure_url);
      setLoading(false);
      
      // Retorna o link oficial da imagem
      return data.secure_url; 

    } catch (err: any) {
      console.error("Erro no upload:", err);
      setError(err.message || "Falha ao conectar com Cloudinary");
      setLoading(false);
      return null;
    }
  };

  return { uploadImage, loading, error, url };
};