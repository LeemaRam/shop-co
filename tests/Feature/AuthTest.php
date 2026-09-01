<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'customer')
            ->assertJsonStructure(['data' => ['token', 'user' => ['id', 'email']]]);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com', 'role' => 'customer']);
    }

    public function test_vendor_registration_creates_vendor_profile(): void
    {
        $response = $this->postJson('/api/auth/register/vendor', [
            'name' => 'Store Owner',
            'email' => 'owner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'store_name' => 'Cool Store',
        ]);

        $response->assertCreated()->assertJsonPath('data.user.role', 'vendor');
        $this->assertDatabaseHas('vendors', ['store_name' => 'Cool Store']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);

        $this->postJson('/api/auth/login', ['email' => 'a@b.com', 'password' => 'secret123'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);

        $this->postJson('/api/auth/login', ['email' => 'a@b.com', 'password' => 'wrong'])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
