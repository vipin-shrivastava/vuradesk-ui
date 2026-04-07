import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';
import { Loader2, ImageOff } from 'lucide-react';

interface SecureImageProps {
  id?: string;
  src?: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const SecureImage: React.FC<SecureImageProps> = ({ id, src, alt, className, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true; // Add isMounted flag

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        let endpoint = '';
        if (id) {
          endpoint = `/attachments/${id}/download`;
        } else if (src) {
          endpoint = src.startsWith('/api/') ? src.replace('/api/', '') : src;
        } else {
          throw new Error('No id or src provided to SecureImage');
        }

        const response = await axiosClient.get(endpoint, { responseType: 'blob' });

        if (isMounted) {
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (err) {
        console.error('Failed to load secure image:', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false; // Set flag to false on unmount
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, src]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg ${className}`}>
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-red-400 rounded-lg ${className}`}>
        <ImageOff className="h-6 w-6" />
        <span className="text-xs mt-1 text-center px-1">Error loading image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={(e) => {
        console.error("SecureImage failed to render the ObjectURL:", imageUrl, e);
        setError(true);
      }}
    />
  );
};

export default SecureImage;
