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
        $query = Post::with(['category','comments'])
        ->withCount('comments')
        ->when($request->search,function($query, $search){
            $query-> where('title', 'like', "%{$search}%");
        })
        ->when($request->filled('category') && $request->category != 'all', function($query) use ($request){
            $query->where('category_id',(int) $request->category);
        })
        ->when($request->sort == 'most_commented', function($query){
            $query->orderBy('comments_count', 'desc');
        }, function($query){
            $query->latest();
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
                'comments_count' => $post->comments_count,
                'created_at' => $post->created_at?->toISOString() ?? '',
            ];
        });

        $categories = Category::all()->map(function($category){
            return [
                'id' => $category->id,
                'name' => $category->name,
            ]; 
        });

        return Inertia::render('user/posts', [
            'posts'=>$posts,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'sort' => $request->sort,
            ],$request->only(['search', 'category', 'sort'])
        ]);
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
    public function edit(string $id)
    {
        //
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
    public function destroy(string $id)
    {
        //
    }
}
