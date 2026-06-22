-- Add match score and job description summary to job_applications

ALTER TABLE public.job_applications
ADD COLUMN match_score integer DEFAULT NULL,
ADD COLUMN job_description_summary text DEFAULT NULL;

-- Allow match_score and job_description_summary to be updated/inserted securely if RLS is enabled, though typically columns inherit policies of the table.
