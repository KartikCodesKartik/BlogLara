import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

type Category = {
  id: number | string;
  name: string;
};

interface PostCreateProps {
  categories: Category[];
}

export default function PostCreate({ categories }: PostCreateProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [publishedAt, setPublishedAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('user.posts.store'), { title, content, category_id: categoryId, published_at: publishedAt });
  };

  return (
    <AppLayout>
      <Head title="Create Post" />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
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
          <Button type="submit">Create Post</Button>
        </form>
      </div>
    </AppLayout>
  );
}
