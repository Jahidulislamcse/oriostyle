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
        $defaults = SettingService::DEFAULTS;

        if (file_exists(storage_path('app/public/settings/site_logo_1790606099.png'))) {
            $defaults['site_logo'] = 'settings/site_logo_1790606099.png';
        }
        if (file_exists(storage_path('app/public/settings/site_logo_white_1790596902.png'))) {
            $defaults['site_logo_white'] = 'settings/site_logo_white_1790596902.png';
        }
        if (file_exists(storage_path('app/public/settings/site_favicon_1790606099.png'))) {
            $defaults['site_favicon'] = 'settings/site_favicon_1790606099.png';
        }

        $settingService->setMany($defaults);
    }
}
