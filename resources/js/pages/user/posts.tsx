import { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { CalendarDays, MessageSquare, Tag } from 'lucide-react';
import { User as UserIcon,Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {usePage} from "@inertiajs/react";

interface Post {
    id: number;
    title: string;
    content: string;
    category: {
        id: number;
        name: string;
    };
     user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    comments_count: number;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

interface PaginatedData {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PostsPageProps {
    posts?: PaginatedData;
    categories?: Category[];
    filters?: {
        search?: string;
        category?: string;
        sort?: string;
        only_my_posts?: boolean;
    };
}

const defaultPosts: PaginatedData = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    links: [
        {
            url: null,
            label: '1',
            active: true
        }
    ]
};

const defaultFilters = {
    search: '',
    category: '',
    sort: ''
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/user/posts',
    },
];

export default function PostsPage({ 
    posts = defaultPosts, 
    categories = [], 
    filters = defaultFilters 
}: PostsPageProps) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category ?? 'all');
    const [sortBy, setSortBy] = useState(filters?.sort ?? 'latest');
    const [editPost, setEditPost] = useState<Post | null>(null);
     const [formData, setFormData] = useState({
            title: '',
            content: '',
            category_id: '',
            published_at: '',
        });
        const [onlyMyPosts, setOnlyMyPosts] = useState(filters?.only_my_posts ?? false);

    console.log('from log:',posts.data[0]);
    const {auth} = usePage().props;
    const user = auth.user;
    console.log('user:',user);
    

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('user.posts.index'),
            { search: value, category: selectedCategory, sort: sortBy },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        router.get(
            route('user.posts.index'),
            { 
                search, 
                category: value === 'all' ? '' : value, 
                sort: sortBy 
            },
            { 
                preserveState: true, 
                preserveScroll: true,
                replace: true 
            }
        );
    };

    const handleSortChange = (value: string) => {
    const isOnlyMyPosts = value === 'only_my_posts';
    setOnlyMyPosts(isOnlyMyPosts);
    setSortBy(value); // Keep sortBy as the selected value
    router.get(
        route('user.posts.index'),
        { 
            search, 
            category: selectedCategory, 
            sort: isOnlyMyPosts ? 'latest' : value, // Send 'latest' for sort when My Blogs is selected
            only_my_posts: isOnlyMyPosts ? 'true' : '' 
        },
        { preserveState: true, preserveScroll: true, replace: true }
    );
};

    const handlePageChange = (page: number) => {
        router.get(
            route('user.posts.index'),
            { page, search, category: selectedCategory, sort: sortBy },
            { preserveState: true, preserveScroll: true }
        );
    };

     const handleAdd = () => {
        setEditPost(null);
        setFormData({
            title: '',
            content: '',
            category_id: '',
            published_at: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editPost) {
            router.put(`/user/posts/${editPost.id}`, formData, {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Post updated successfully', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
                onError: () => {
                    toast.error('Failed to update post', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
            });
        } else {
            router.post('/user/posts', formData, {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success('Post created successfully', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
                onError: () => {
                    toast.error('Failed to create post', {
                        duration: 3000,
                        position: 'top-right',
                    });
                },
            });
        }
    };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

     const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = (id: number) => {
            if (confirm('Are you sure you want to delete this post?')) {
                router.delete(`/user/posts/${id}`, {
                    onSuccess: () => {
                        toast.success('Post deleted successfully', {
                            duration: 3000,
                            position: 'top-right',
                        });
                    },
                    onError: () => {
                        toast.error('Failed to delete post', {
                            duration: 3000,
                            position: 'top-right',
                        });
                    },
                });
            }
        };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <Toaster richColors closeButton position="top-right" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Posts</h1>
                    <Button onClick={handleAdd}>
                                                Add  Blog                     
                                        </Button>  
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="only_my_posts">My Blogs</SelectItem>
                            <SelectItem value="most_commented">Most Commented</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(posts.data) && posts.data.map((post) => (
                        <div 
                            key={post.id} 
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100 relative"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                                    {post.title || 'Untitled'}
                                </h2>

                                <div className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    <span>{post.user?.name ?? 'Unknown author'}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        <span>{post.category?.name || 'Uncategorized'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.comments_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarDays className="w-4 h-4" />
                                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {post.content || 'No content available'}
                                </p>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.visit(route('user.posts.show', post.id))}
                                >
                                    Read More
                                </Button>
                                {post.user.id === user.id && (
                                    <Trash2 
                                    className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer absolute top-3 right-3" 
                                    onClick={() => handleDelete(post.id)} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(posts.current_page - 1)}
                            disabled={posts.current_page === 1}
                            className="h-8 px-2"
                        >
                            Previous
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                            {Array.isArray(posts.links) && posts.links.map((link, i) => {
                                if (!link || link.label === '...') {
                                    return (
                                        <span key={i} className="px-2">...</span>
                                    );
                                }
                                
                                if (!link.url) {
                                    return null;
                                }

                                const page = parseInt(link.label);
                                if (isNaN(page)) {
                                    return null;
                                }

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(posts.current_page + 1)}
                            disabled={posts.current_page === posts.last_page}
                            className="h-8 px-2"
                        >
                            Next
                        </Button>
                    </nav>
                </div>
            </div>


            {/* Modal for Add/Edit Post */}
             <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editPost ? 'Edit Blog' : 'Add Blog'}</DialogTitle>  
                            <DialogDescription>
                            {editPost ? 'Make changes to your blog post here.' : 'Create a new blog post here.'}
                            </DialogDescription> 
                            </DialogHeader>
                            <form onSubmit={handleSubmit}
                             className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required />
                                </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>                                
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => handleSelectChange('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                  </div>

                            <div className="space-y-2">
                                <Label htmlFor="published_at">Published At</Label>
                                <Input id="published_at"
                                    name="published_at"
                                    type="datetime-local"
                                    value={formData.published_at}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel 
                                </Button>                               
                                 <Button type="submit">
                                    {editPost ? 'Update' : 'Create'}
                                </Button>            
                            </DialogFooter>
                        </form>                    
                    </DialogContent>                
                </Dialog> 
        </AppLayout>
    );
}