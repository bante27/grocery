<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // List users with optional filters
    public function index(Request $request)
    {
        try {
            $query = User::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(fn($q) => 
                    $q->where('name', 'like', "%$search%")
                      ->orWhere('email', 'like', "%$search%")
                      ->orWhere('phone', 'like', "%$search%")
                );
            }

            foreach (['role', 'status', 'verification_status'] as $filter) {
                if ($request->filled($filter)) $query->where($filter, $request->$filter);
            }

            $users = $query->orderBy($request->get('sort_by', 'created_at'), $request->get('sort_order', 'desc'))->get();

            return response()->json([
                'success' => true,
                'users' => $users->map(fn($user) => $this->formatUser($user)),
                'total' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch users'], 500);
        }
    }

    // Show single user
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

        return response()->json(['success' => true, 'user' => $this->formatUser($user)]);
    }

    // Change role
    public function makeAdmin($id) { return $this->changeRole($id, 'admin'); }
    public function removeAdmin($id) { return $this->changeRole($id, 'user'); }

    private function changeRole($id, $role)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

        if ($role === 'admin' && $user->role === 'admin') return response()->json(['success' => false, 'message' => 'Already admin'], 400);
        if ($role === 'user' && $user->role !== 'admin') return response()->json(['success' => false, 'message' => 'Not an admin'], 400);

        if ($role === 'user' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['success' => false, 'message' => 'Cannot remove last admin'], 400);
        }

        $user->role = $role;
        $user->save();

        return response()->json(['success' => true, 'message' => "Role changed to $role", 'user' => $this->formatUser($user)]);
    }

    // Restrict / Unrestrict
    public function restrict($id) { return $this->toggleRestriction($id, true); }
    public function unrestrict($id) { return $this->toggleRestriction($id, false); }

    private function toggleRestriction($id, $restrict = true)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

        $statusCheck = $restrict ? 'restricted' : 'active';
        if ($user->status === $statusCheck) return response()->json(['success' => false, 'message' => "User is already $statusCheck"], 400);

        $user->status = $restrict ? 'restricted' : 'active';
        $user->restricted_at = $restrict ? now() : null;
        $user->save();

        return response()->json(['success' => true, 'message' => $restrict ? 'User restricted' : 'User unrestricted', 'user' => $this->formatUser($user)]);
    }

    // Verify user
    public function verify($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);
        if ($user->verification_status === 'verified') return response()->json(['success' => false, 'message' => 'Already verified'], 400);

        $user->verification_status = 'verified';
        $user->verified_at = now();
        $user->save();

        return response()->json(['success' => true, 'message' => 'User verified', 'user' => $this->formatUser($user)]);
    }

    // Delete user
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);
        if ($user->id === auth()->id()) return response()->json(['success' => false, 'message' => 'Cannot delete self'], 400);
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['success' => false, 'message' => 'Cannot delete last admin'], 400);
        }

        $user->delete();
        return response()->json(['success' => true, 'message' => 'User deleted']);
    }

    // User statistics
    public function stats()
    {
        $stats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'verified' => User::where('verification_status', 'verified')->count(),
            'restricted' => User::where('status', 'restricted')->count(),
            'pending_verification' => User::where('verification_status', 'pending')->count(),
            'active' => User::where('status', 'active')->count(),
            'today' => User::whereDate('created_at', today())->count(),
            'this_month' => User::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json(['success' => true, 'stats' => $stats]);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found'], 404);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes','email','max:255',Rule::unique('users')->ignore($user->id)],
            'phone' => 'sometimes|string|max:20',
            'balance' => 'sometimes|numeric|min:0',
            'role' => ['sometimes', Rule::in(['admin','user'])],
            'status' => ['sometimes', Rule::in(['active','restricted','suspended'])],
            'verification_status' => ['sometimes', Rule::in(['pending','verified','rejected'])],
        ]);

        if ($validator->fails()) return response()->json(['success'=>false,'message'=>'Validation failed','errors'=>$validator->errors()],422);

        $user->update($request->only(['name','email','phone','balance','role','status','verification_status']));
        return response()->json(['success'=>true,'message'=>'User updated','user'=>$this->formatUser($user)]);
    }

    // Pending verifications
    public function pendingVerifications()
    {
        $pending = User::where('verification_status','pending')->get();
        return response()->json([
            'success'=>true,
            'pending'=>$pending->map(fn($user)=>[
                'userId'=>$user->id,
                'fullName'=>$user->name,
                'email'=>$user->email,
                'phone'=>$user->phone,
                'govIdFront'=>$user->gov_id_front,
                'govIdBack'=>$user->gov_id_back,
                'submittedAt'=>optional($user->created_at)->toISOString()
            ]),
            'count'=>$pending->count()
        ]);
    }

    // Format user helper
    private function formatUser(User $user)
    {
        return [
            'userId'=>$user->id,
            'fullName'=>$user->name,
            'email'=>$user->email,
            'phone'=>$user->phone,
            'profilePic'=>$user->profile_picture,
            'address'=>$user->address,
            'balance'=>(float)($user->balance ?? 0),
            'pendingBalance'=>(float)($user->pending_balance ?? 0),
            'rank'=>$user->rank,
            'isAdmin'=>$user->role==='admin',
            'isRestricted'=>$user->status==='restricted',
            'verified'=>$user->verification_status==='verified',
            'registrationDate'=>optional($user->created_at)->toISOString(),
            'role'=>$user->role,
            'status'=>$user->status,
            'verification_status'=>$user->verification_status,
            'restricted_at'=>optional($user->restricted_at)->toISOString(),
            'verified_at'=>optional($user->verified_at)->toISOString(),
            'govIdFront'=>$user->gov_id_front,
            'govIdBack'=>$user->gov_id_back,
        ];
    }
}
