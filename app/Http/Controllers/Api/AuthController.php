<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VendorRegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Vendor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => $request->string('password'),
            'phone' => $request->input('phone'),
            'role' => UserRole::Customer,
        ]);

        return $this->issueToken($user, 'Registration successful', 201);
    }

    public function registerVendor(VendorRegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->string('name'),
                'email' => $request->string('email'),
                'password' => $request->string('password'),
                'phone' => $request->input('phone'),
                'role' => UserRole::Vendor,
            ]);

            Vendor::create([
                'user_id' => $user->id,
                'store_name' => $request->string('store_name'),
                'slug' => $this->uniqueVendorSlug($request->string('store_name')),
                'description' => $request->input('store_description'),
                'phone' => $request->input('phone'),
                'status' => 'active',
            ]);

            return $user;
        });

        return $this->issueToken($user->load('vendor'), 'Vendor registration successful', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return $this->error('Invalid credentials.', 401);
        }

        return $this->issueToken($user->load('vendor'), 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(
            new UserResource($request->user()->load('vendor')),
            'Authenticated user'
        );
    }

    protected function issueToken(User $user, string $message, int $status = 200): JsonResponse
    {
        $token = $user->createToken('auth')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], $message, $status);
    }

    protected function uniqueVendorSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'store';
        $slug = $base;
        $i = 1;

        while (Vendor::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
