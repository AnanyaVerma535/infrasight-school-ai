-- Create storage bucket for infrastructure images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('infrastructure-images', 'infrastructure-images', true);

-- Create storage policies
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'infrastructure-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'infrastructure-images');

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'infrastructure-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);