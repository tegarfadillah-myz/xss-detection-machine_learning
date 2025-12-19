<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class VulnerableController extends Controller
{
    // Stored XSS: Saves post without ANY checks
    public function store(Request $request)
    {
        $post = Post::create([
            'content' => $request->input('content')
        ]);

        return response()->json([
            'message' => 'Post created (Vulnerable Mode)',
            'post' => $post
        ], 201);
    }

    // Reflected XSS: Echoes back the search query directly
    public function search(Request $request)
    {
        $query = $request->input('q');
        // Simulating a search result that includes the user's input unsanitized
        return response()->json([
            'results' => [],
            'query_echo' => "No results found for: " . $query // This string contains the payload
        ]);
    }
}
