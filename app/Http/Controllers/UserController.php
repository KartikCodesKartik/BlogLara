<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Comment;
use App\Models\Category;
use App\Models\Post;
use Inertia\Inertia;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $query = Post::with(['category', 'comments', 'user'])
        ->withCount('comments')
        ->when($request->search, function ($query, $search) {
            $query->where('title', 'like', "%{$search}%");
        })
        ->when($request->filled('category') && $request->category != 'all', function ($query) use ($request) {
            $query->where('category_id', (int) $request->category);
        })
        ->when($request->sort == 'most_commented', function ($query) {
            $query->orderBy('comments_count', 'desc');
        }, function ($query) {
            $query->latest();
        })
        ->when($request->boolean('only_my_posts'), function ($query) {
            $query->where('user_id', auth()->id());
        });

    $posts = $query->paginate(10)->through(function ($post) {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'content' => $post->content ?? '',
            'category' => [
                'id' => $post->category->id,
                'name' => $post->category->name ?? '',
            ],
            'user' => [
                'id' => $post->user->id ?? null,
                'name' => $post->user->name ?? 'Unknown',
                'email' => $post->user->email ?? '',
            ],
            'comments_count' => $post->comments_count,
            'created_at' => $post->created_at?->toISOString() ?? '',
        ];
    });

    $categories = Category::all()->map(function ($category) {
        return [
            'id' => $category->id,
            'name' => $category->name,
        ];
    });

    return Inertia::render('user/posts', [
        'posts' => $posts,
        'categories' => $categories,
        'filters' => [
            'search' => $request->search,
            'category' => $request->category,
            'sort' => $request->sort,
            'only_my_posts' => $request->boolean('only_my_posts'),
        ],
    ]);
}

    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();
        return Inertia::render('user/post-create', compact('categories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'published_at' => 'nullable|date',
        ]);

        if ($request->filled('published_at')) {
            $validated['published_at'] = Carbon::parse($request->published_at)->format('Y-m-d H:i:s');
        }

        $validated['slug'] = Str::slug($request->title);
        $validated['user_id'] = auth()->id();

        Post::create($validated);

        return redirect()->route('user.posts.index')->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $post = Post::with(['category','comments.user'])
        ->withCount('comments')
        ->findOrFail($id);

        return Inertia::render('user/posts/show',[
            'post' => [
                'id' => $post->id,
                'title' => $post->title ?? '',
                'content' => $post->content ?? '',
                'category' => [
                    'id' => $post->category->id ?? 0,
                    'name' => $post->category->name ?? '',
                ],
                'comments' => $post->comments->map(function($comment){
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'user' => [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                        ],
                        'created_at' => $comment->created_at?->toISOString() ?? '',
                    ];
                }),
                'comments_count' => $post->comments_count ?? 0,
                'created_at' => $post->created_at?->toISOString() ?? '',
            ]
        ]);
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $post = Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $categories = Category::all();
        return Inertia::render('user/post-edit', compact('post', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function storeComment(Request $request, string $id)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);
        $post = Post::findOrFail($id);
        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);
        return redirect()->back()
        ->with('success', 'Comment added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
         $post = Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'published_at' => 'nullable|date',
        ]);

        if ($request->filled('published_at')) {
            $validated['published_at'] = Carbon::parse($request->published_at)->format('Y-m-d H:i:s');
        }

        $validated['slug'] = Str::slug($request->title);

        $post->update($validated);

        return redirect()->route('user.posts.index')->with('success', 'Post updated successfully.');
    }

    public function destroyComment(string $postId, string $commentId)
    {
        
        $comment = Comment::where('post_id', $postId)
            ->where('id', $commentId)
            ->where('user_id',auth()->id())->firstOrFail();
            $comment->delete();
        return back()
        ->with('success', 'Comment deleted successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
         $post = Post::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $post->delete();

        return redirect()->route('user.posts.index')->with('success', 'Post deleted successfully.');
    }
}
