<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        $admins = [
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@orio.com',
                'phone' => '01711000001',
                'role' => Admin::ROLE_SUPER_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
            ],
            [
                'name' => 'Store Administrator',
                'email' => 'admin@orio.com',
                'phone' => '01711000002',
                'role' => Admin::ROLE_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
            ],
            [
                'name' => 'Procurement Officer',
                'email' => 'staff@orio.com',
                'phone' => '01711000004',
                'role' => Admin::ROLE_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
            ],
        ];

        foreach ($admins as $adminData) {
            Admin::updateOrCreate(
                ['email' => $adminData['email']],
                $adminData
            );
        }
    }
}
