'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Lightbulb, ChevronRight, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts from blog table, assuming there's an admin table for it
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        // Table probably doesn't exist, ignore for now
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lightbulb size={24} className="text-[#4F75FF]" />
            Inspirasi Bisnis
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Artikel, tips, dan trik terbaru dari tim Logaritma untuk memajukan bisnis Anda</p>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-2xl border border-slate-100 h-[300px] animate-pulse"></div>
           ))}
         </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-[#4F75FF]" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">Belum ada artikel</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Tim Logaritma sedang menyiapkan konten-konten menarik untuk membantu Anda. Cek lagi nanti!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <a key={post.id} href={`#`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
               <div className="h-48 bg-slate-100 overflow-hidden">
                 {post.image_url ? (
                   <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                     <Lightbulb size={40} className="text-[#4F75FF]/30" />
                   </div>
                 )}
               </div>
               <div className="p-5 flex-1 flex flex-col">
                 <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                   <span className="flex items-center gap-1"><Clock size={12}/> {new Date(post.created_at).toLocaleDateString('id-ID')}</span>
                   <span className="bg-blue-50 text-[#4F75FF] px-2 py-0.5 rounded font-bold uppercase">{post.category || 'Tips Bisnis'}</span>
                 </div>
                 <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-[#4F75FF] transition-colors line-clamp-2">{post.title}</h3>
                 <p className="text-slate-500 text-sm line-clamp-3 flex-1 mb-4">{post.excerpt || post.content?.substring(0, 100) + '...'}</p>
                 <div className="flex items-center text-[#4F75FF] font-bold text-sm">
                   Baca selengkapnya <ChevronRight size={16} />
                 </div>
               </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
