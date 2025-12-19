<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return response()->json([
            'posts' => Post::latest()->take(50)->get()
        ]);
    }

    public function store(Request $request)
    {
        // Validation is simple because Middleware handles the XSS check
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post = Post::create([
            'content' => $request->input('content')
        ]);

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post
        ], 201);
    }
}
