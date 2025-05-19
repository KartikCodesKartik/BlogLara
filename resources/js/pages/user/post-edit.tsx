import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

interface Category {
  id: number | string;
  name: string;
}

interface Post {
  id: number | string;
  title: string;
  content: string;
  category_id: number | string;
  published_at?: string | null;
}

interface PostEditProps {
  post: Post;
  categories: Category[];
}

export default function PostEdit({ post, categories }: PostEditProps) {
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [categoryId, setCategoryId] = useState(post.category_id || '');
  const [publishedAt, setPublishedAt] = useState(post.published_at ? new Date(post.published_at).toISOString().slice(0,16) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(route('user.posts.update', post.id), { title, content, category_id: categoryId, published_at: publishedAt });
  };

  return (
    <AppLayout>
      <Head title="Edit Post" />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="input"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={8}
            className="textarea"
          />
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="select">
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={e => setPublishedAt(e.target.value)}
            className="input"
          />
          <Button type="submit">Update Post</Button>
        </form>
      </div>
    </AppLayout>
  );
}
