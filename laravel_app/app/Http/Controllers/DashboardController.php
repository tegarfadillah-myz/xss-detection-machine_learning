<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\XssDetectorService;

class DashboardController extends Controller
{
    protected $detector;

    public function __construct(XssDetectorService $detector)
    {
        $this->detector = $detector;
    }

    public function index()
    {
        return view('dashboard');
    }

    public function check(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $text = $request->input('content');
        $result = $this->detector->predict($text);

        if ($request->expectsJson()) {
            return response()->json([
                'result' => $result,
                'input' => $text
            ]);
        }

        return view('dashboard', [
            'result' => $result,
            'input' => $text
        ]);
    }
}
