<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check if user is not logged in or role does not match
        if (!$request->user() || $request->user()->role !== $role) {
            // Redirect based on current user's role
            if ($request->user() && $request->user()->role === 'admin') {
                return redirect()->route('admin.posts.index');
            }
            return redirect()->route('user.posts.index');
        }

        return $next($request);
    }
}
