<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // ... other methods ...
    
    /**
     * Admin login - checks for admin role
     */
    public function adminLogin(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check credentials
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        $user = User::where('email', $request->email)->first();
        
        // Check if user has admin role
        if ($user->role !== 'admin') {
            Auth::logout();
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        // Create admin token
        $token = $user->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'isAdmin' => true,
            ],
            'token' => $token
        ]);
    }
    /**
 * Regular user login
 */
public function login(Request $request)
{
    // Validate input
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:users,email',
        'password' => 'required|string|min:6',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Check credentials
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password'
        ], 401);
    }

    $user = User::where('email', $request->email)->first();
    
    // Create token based on role
    $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'isAdmin' => $user->role === 'admin',
        ],
        'token' => $token
    ]);
}

/**
 * Show login form (for web routes)
 */
public function showLoginForm()
{
    return view('auth.login'); // Make sure this view exists
}

/**
 * Show registration form (for web routes)
 */
public function showRegistrationForm()
{
    return view('auth.register'); // Make sure this view exists
}

/**
 * Handle user registration
 */
public function register(Request $request)
{
    // Validate input
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'phone' => 'nullable|string|max:20',
        'password' => 'required|string|min:6|confirmed',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Create user
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'phone' => $request->phone,
        'password' => Hash::make($request->password),
        'role' => 'user', // Default role
    ]);

    // Login the user
    Auth::login($user);
    
    // Create token
    $token = $user->createToken('auth_token', ['user'])->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'isAdmin' => false,
        ],
        'token' => $token
    ]);
}

/**
 * Logout method
 */
public function logout(Request $request)
{
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

    // ... other methods ...
}