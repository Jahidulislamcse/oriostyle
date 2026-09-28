<?php

namespace Database\Seeders;

use App\Services\Settings\SettingService;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SettingService $settingService): void
    {
        $settingService->setMany(SettingService::DEFAULTS);
    }
}
