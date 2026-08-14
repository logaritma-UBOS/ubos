-- Buat tabel marketing_tasks untuk fitur Interactive Workspace di Admin Playbook
CREATE TABLE IF NOT EXISTS marketing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL,
  task_key VARCHAR(100) UNIQUE NOT NULL,
  task_label TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  current_metric VARCHAR(255) DEFAULT '',
  target_metric VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan RLS (Row Level Security)
ALTER TABLE marketing_tasks ENABLE ROW LEVEL SECURITY;

-- Karena ini tabel global untuk keperluan tim internal/admin (tanpa user_id di tabel ini), 
-- kita berikan policy akses bagi user yang sedang login (sebagai admin) 
-- atau cukup gunakan authenticated policy sementara.
-- Hapus policy yang lama jika sudah ada
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON marketing_tasks;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON marketing_tasks;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON marketing_tasks;

CREATE POLICY "Enable read access for authenticated users" ON marketing_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON marketing_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON marketing_tasks
  FOR UPDATE USING (auth.role() = 'authenticated');
