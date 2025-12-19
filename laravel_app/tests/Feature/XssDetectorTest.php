<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Post;
use Illuminate\Support\Facades\Http;

class XssDetectorTest extends TestCase
{
    use RefreshDatabase;
    public function test_dashboard_loads()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        // Since React renders client-side, we check for the entry point
        $response->assertSee('<div id="app"></div>', false);
    }

    public function test_check_endpoint_safe_text()
    {
        // Mock the ML service response
        Http::fake([
            '*' => Http::response(['prediction' => 'Safe', 'class' => 0], 200),
        ]);

        // The UI now uses AJAX primarily, so we test the JSON endpoint behavior
        $response = $this->postJson('/check', [
            'content' => 'hello world'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('result.prediction', 'Safe');
    }

    public function test_check_endpoint_xss_text()
    {
        // Mock the ML service response
        Http::fake([
            '*' => Http::response(['prediction' => 'XSS Detected', 'class' => 1], 200),
        ]);

        $response = $this->postJson('/check', [
            'content' => '<script>alert(1)</script>'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('result.prediction', 'XSS Detected');
    }

    public function test_post_creation_safe()
    {
        Http::fake([
            '*' => Http::response(['prediction' => 'Safe', 'class' => 0], 200),
        ]);

        $response = $this->postJson('/api/posts', [
            'content' => 'This is a safe guestbook entry.'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Post created successfully');

        $this->assertDatabaseHas('posts', ['content' => 'This is a safe guestbook entry.']);
    }

    public function test_post_creation_blocked_by_waf()
    {
        Http::fake([
            '*' => Http::response(['prediction' => 'XSS Detected', 'class' => 1], 200),
        ]);

        $response = $this->postJson('/api/posts', [
            'content' => '<script>alert("xss")</script>'
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'XSS_DETECTED');

        $this->assertDatabaseMissing('posts', ['content' => '<script>alert("xss")</script>']);
    }

    public function test_check_endpoint_json_response()
    {
        Http::fake([
            '*' => Http::response(['prediction' => 'Safe', 'class' => 0], 200),
        ]);

        $response = $this->postJson('/check', [
            'content' => 'safe text'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'result' => [
                    'prediction' => 'Safe',
                    'class' => 0
                ],
                'input' => 'safe text'
            ]);
    }
}
