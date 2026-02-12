import { createClient } from './server';

const BUCKET_NAME = 'question-images';

export async function uploadQuestionImage(
  file: File,
  questionId?: string
): Promise<{ url: string; path: string } | null> {
  const supabase = await createClient();
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = questionId 
    ? `${questionId}-${Date.now()}.${fileExt}`
    : `temp-${Date.now()}.${fileExt}`;
  
  const filePath = `questions/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

export async function deleteQuestionImage(path: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
}