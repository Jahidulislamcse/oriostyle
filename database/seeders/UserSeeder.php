<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        $users = [
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@orio.com',
                'phone' => '01711000001',
                'role' => User::ROLE_SUPER_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Store Administrator',
                'email' => 'admin@orio.com',
                'phone' => '01711000002',
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Demo Customer',
                'email' => 'customer@orio.com',
                'phone' => '01711000003',
                'role' => User::ROLE_CUSTOMER,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Procurement Officer',
                'email' => 'staff@orio.com',
                'phone' => '01711000004',
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Rahim Ahmed',
                'email' => 'rahim@gmail.com',
                'phone' => '01819000005',
                'role' => User::ROLE_CUSTOMER,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Fatima Begum',
                'email' => 'fatima@gmail.com',
                'phone' => '01912000006',
                'role' => User::ROLE_CUSTOMER,
                'is_active' => true,
                'password' => $defaultPassword,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
