<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            
            // For demo purposes, you can use a hardcoded admin user
            // Or create a real user in your database
            $email = $request->email;
            $password = $request->password;
            
            // Check if user exists in database
            $user = User::where('email', $email)->first();
            
            // If no user exists in database, use demo credentials
            if (!$user) {
                // Demo credentials (you can change these)
                if ($email === 'admin@example.com' && $password === 'admin123') {
                    // Create a temporary user for demo
                    $user = new User();
                    $user->id = 1;
                    $user->name = 'Admin User';
                    $user->email = 'admin@example.com';
                    $user->is_admin = true;
                    
                    // Generate a token (for Sanctum)
                    $token = $user->createToken('admin-token')->plainTextToken;
                    
                    return response()->json([
                        'success' => true,
                        'token' => $token,
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'is_admin' => true
                        ],
                        'message' => 'Logged in successfully (demo mode)'
                    ], 200);
                } else {
                    throw ValidationException::withMessages([
                        'email' => ['Invalid credentials'],
                    ]);
                }
            }
            
            // If user exists in database, check password
            if (!Hash::check($password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Invalid credentials'],
                ]);
            }
            
            // Check if user is admin
            if (!$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }
            
            // Create Sanctum token
            $token = $user->createToken('admin-token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin
                ],
                'message' => 'Logged in successfully'
            ], 200);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}