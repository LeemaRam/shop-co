<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Restrict a route to users with one of the given roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role->value, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'This action is unauthorized.',
            ], 403);
        }

        if ($user->isVendor() && ! $user->vendor) {
            return response()->json([
                'success' => false,
                'message' => 'No vendor profile is associated with this account.',
            ], 403);
        }

        return $next($request);
    }
}
