<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class XssDetectorService
{
    protected string $mlServiceUrl;

    public function __construct()
    {
        // Default to the docker service name if env is missing
        $this->mlServiceUrl = env('ML_SERVICE_URL', 'http://ml_service:5000/predict');
    }

    public function predict(string $text): array
    {
        try {
            $response = Http::post($this->mlServiceUrl, [
                'text' => $text,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'error' => 'ML Service returned error: ' . $response->status(),
                'prediction' => 'Unknown'
            ];
        } catch (\Exception $e) {
            return [
                'error' => 'Connection failed: ' . $e->getMessage(),
                'prediction' => 'Error'
            ];
        }
    }
}
