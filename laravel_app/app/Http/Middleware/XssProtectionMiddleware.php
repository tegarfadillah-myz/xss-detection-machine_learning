<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\XssDetectorService;

class XssProtectionMiddleware
{
    protected $detector;

    public function __construct(XssDetectorService $detector)
    {
        $this->detector = $detector;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Only check POST/PUT/PATCH methods and if 'content' field exists
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH']) && $request->has('content')) {
            $content = $request->input('content');

            // Call ML Service
            $result = $this->detector->predict($content);

            if (isset($result['prediction']) && $result['prediction'] !== 'Safe') {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Forbidden: Malicious content detected.',
                        'error' => 'XSS_DETECTED',
                        'detail' => $result
                    ], 403);
                }
                abort(403, 'Forbidden: Malicious content detected.');
            }
        }

        return $next($request);
    }
}
