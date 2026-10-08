-- Public bucket for images used inside questions / solutions (maps, diagrams).
-- Only admins can upload or delete; anyone can view.
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

create policy "question-images: public read"
  on storage.objects for select
  using (bucket_id = 'question-images');

create policy "question-images: admin upload"
  on storage.objects for insert
  with check (bucket_id = 'question-images' and public.is_admin());

create policy "question-images: admin update"
  on storage.objects for update
  using (bucket_id = 'question-images' and public.is_admin());

create policy "question-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'question-images' and public.is_admin());
