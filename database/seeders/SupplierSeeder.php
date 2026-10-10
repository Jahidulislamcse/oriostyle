<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\SupplierLedger;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::whereIn('role', [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN])->first();
        $adminId = $adminUser?->id;

        $suppliersData = [
            [
                'name' => 'Kabir Chowdhury',
                'company_name' => 'Dhaka Textile Mills Ltd.',
                'email' => 'kabir@dhakatextile.com',
                'phone' => '+880 1711 234567',
                'address' => 'Plot 42, Tejgaon Industrial Area',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'opening_balance' => 150000.00,
                'is_active' => true,
                'notes' => 'Primary cotton and linen woven fabric mill partner with OEKO-TEX certification.',
                'ledgers' => [
                    [
                        'transaction_type' => 'opening_balance',
                        'reference_no' => 'INIT-OP-001',
                        'debit' => 0.00,
                        'credit' => 150000.00,
                        'balance' => 150000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-01',
                        'notes' => 'Initial opening balance migrated from legacy ledger.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-081',
                        'debit' => 0.00,
                        'credit' => 125000.00,
                        'balance' => 275000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-15',
                        'notes' => 'Delivery of Egyptian Giza Cotton fabric consignment batch #841.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-BNK-9811',
                        'debit' => 100000.00,
                        'credit' => 0.00,
                        'balance' => 175000.00,
                        'payment_method' => 'bank_transfer',
                        'transaction_date' => '2026-08-28',
                        'notes' => 'City Bank corporate online transfer against PO-2026-081.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-094',
                        'debit' => 0.00,
                        'credit' => 95000.00,
                        'balance' => 270000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-09-10',
                        'notes' => '100% Normandy Flax Linen fabric consignment for spring casuals.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-CHQ-4402',
                        'debit' => 80000.00,
                        'credit' => 0.00,
                        'balance' => 190000.00,
                        'payment_method' => 'cheque',
                        'transaction_date' => '2026-09-25',
                        'notes' => 'Eastern Bank Account Payee Cheque #4402 cleared.',
                    ],
                ],
            ],
            [
                'name' => 'M. S. Faruk',
                'company_name' => 'Bengal Leather & Tannery Corp.',
                'email' => 'faruk@bengaltannery.com',
                'phone' => '+880 1819 876543',
                'address' => 'Hazaribagh Industrial Zone, Postagola',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'opening_balance' => 95000.00,
                'is_active' => true,
                'notes' => 'Tannery supplier providing premium vegetable-tanned calfskin hides.',
                'ledgers' => [
                    [
                        'transaction_type' => 'opening_balance',
                        'reference_no' => 'INIT-OP-002',
                        'debit' => 0.00,
                        'credit' => 95000.00,
                        'balance' => 95000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-05',
                        'notes' => 'Initial opening balance verified.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-088',
                        'debit' => 0.00,
                        'credit' => 110000.00,
                        'balance' => 205000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-20',
                        'notes' => 'Full-grain burnished calfskin leather hides for Oxford shoes.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-BNK-1029',
                        'debit' => 85000.00,
                        'credit' => 0.00,
                        'balance' => 120000.00,
                        'payment_method' => 'bank_transfer',
                        'transaction_date' => '2026-09-02',
                        'notes' => 'Standard Chartered Bank online transfer.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-099',
                        'debit' => 0.00,
                        'credit' => 65000.00,
                        'balance' => 185000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-09-18',
                        'notes' => 'Top-grain cognac tan leather hides for tote bags.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-BNK-3341',
                        'debit' => 65000.00,
                        'credit' => 0.00,
                        'balance' => 120000.00,
                        'payment_method' => 'bank_transfer',
                        'transaction_date' => '2026-09-30',
                        'notes' => 'Settlement payment towards invoice PO-2026-099.',
                    ],
                ],
            ],
            [
                'name' => 'Morshedul Alam',
                'company_name' => 'Chittagong Silk & Handloom Guild',
                'email' => 'morshed@ctgloom.org',
                'phone' => '+880 1912 345678',
                'address' => 'Station Road, Handloom Complex',
                'city' => 'Chittagong',
                'country' => 'Bangladesh',
                'opening_balance' => 50000.00,
                'is_active' => true,
                'notes' => 'Artisanal handloom weavers cooperative producing pure Jamdani sarees & silk panjabis.',
                'ledgers' => [
                    [
                        'transaction_type' => 'opening_balance',
                        'reference_no' => 'INIT-OP-003',
                        'debit' => 0.00,
                        'credit' => 50000.00,
                        'balance' => 50000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-10',
                        'notes' => 'Opening balance forward.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-091',
                        'debit' => 0.00,
                        'credit' => 75000.00,
                        'balance' => 125000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-25',
                        'notes' => 'Handwoven authentic Dhakai Jamdani sarees (10 pieces).',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-BKS-7762',
                        'debit' => 45000.00,
                        'credit' => 0.00,
                        'balance' => 80000.00,
                        'payment_method' => 'bkash',
                        'transaction_date' => '2026-09-12',
                        'notes' => 'bKash merchant automated settlement.',
                    ],
                    [
                        'transaction_type' => 'return',
                        'reference_no' => 'RET-2026-003',
                        'debit' => 12500.00,
                        'credit' => 0.00,
                        'balance' => 67500.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-09-28',
                        'notes' => 'Credit note issued for 1 piece fabric weave variance return.',
                    ],
                ],
            ],
            [
                'name' => 'Tanveer Hasan',
                'company_name' => 'Starlight Trims & Hardware Accessories',
                'email' => 'tanveer@starlighttrims.com',
                'phone' => '+880 1715 998877',
                'address' => 'DEPZ Road, Ganakbari, Savar',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'opening_balance' => 20000.00,
                'is_active' => true,
                'notes' => 'Zippers, metallic buttons, mother-of-pearl buttons, and customized trims vendor.',
                'ledgers' => [
                    [
                        'transaction_type' => 'opening_balance',
                        'reference_no' => 'INIT-OP-004',
                        'debit' => 0.00,
                        'credit' => 20000.00,
                        'balance' => 20000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-01',
                        'notes' => 'Opening balance forward.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-086',
                        'debit' => 0.00,
                        'credit' => 32000.00,
                        'balance' => 52000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-18',
                        'notes' => 'Supply of YKK brass zippers and carved horn buttons.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-CSH-1102',
                        'debit' => 25000.00,
                        'credit' => 0.00,
                        'balance' => 27000.00,
                        'payment_method' => 'cash',
                        'transaction_date' => '2026-09-05',
                        'notes' => 'Cash voucher receipt #1102.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-103',
                        'debit' => 0.00,
                        'credit' => 18500.00,
                        'balance' => 45500.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-09-22',
                        'notes' => 'Embroidered woven neck labels and care tags.',
                    ],
                ],
            ],
            [
                'name' => 'Engr. Asaduzzaman',
                'company_name' => 'Metro Garments Manufacturing Ltd.',
                'email' => 'asad@metrogarments.com.bd',
                'phone' => '+880 1817 112233',
                'address' => 'Sector 3, Uttara Model Town',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'opening_balance' => 180000.00,
                'is_active' => true,
                'notes' => 'Apparel manufacturing, CAD pattern grading, and assembly contractor.',
                'ledgers' => [
                    [
                        'transaction_type' => 'opening_balance',
                        'reference_no' => 'INIT-OP-005',
                        'debit' => 0.00,
                        'credit' => 180000.00,
                        'balance' => 180000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-01',
                        'notes' => 'Opening balance forward.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-083',
                        'debit' => 0.00,
                        'credit' => 160000.00,
                        'balance' => 340000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-08-16',
                        'notes' => 'Cutting, tailoring, and stitching of 500 pique polos and tees.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-BNK-8812',
                        'debit' => 150000.00,
                        'credit' => 0.00,
                        'balance' => 190000.00,
                        'payment_method' => 'bank_transfer',
                        'transaction_date' => '2026-08-30',
                        'notes' => 'BRAC Bank online corporate transfer.',
                    ],
                    [
                        'transaction_type' => 'bill',
                        'reference_no' => 'PO-2026-098',
                        'debit' => 0.00,
                        'credit' => 140000.00,
                        'balance' => 330000.00,
                        'payment_method' => null,
                        'transaction_date' => '2026-09-15',
                        'notes' => 'Panjabi manufacturing and button-holing batch #440.',
                    ],
                    [
                        'transaction_type' => 'payment',
                        'reference_no' => 'TXN-CHQ-5521',
                        'debit' => 100000.00,
                        'credit' => 0.00,
                        'balance' => 230000.00,
                        'payment_method' => 'cheque',
                        'transaction_date' => '2026-09-29',
                        'notes' => 'Account Payee Cheque #5521 cleared.',
                    ],
                ],
            ],
        ];

        foreach ($suppliersData as $sData) {
            $ledgers = $sData['ledgers'] ?? [];
            unset($sData['ledgers']);

            // Calculate final current balance from ledger chain
            $lastBalance = !empty($ledgers) ? end($ledgers)['balance'] : $sData['opening_balance'];
            $sData['current_balance'] = $lastBalance;

            $supplier = Supplier::updateOrCreate(
                ['email' => $sData['email']],
                $sData
            );

            // Wipe old ledgers for this supplier to avoid duplicate entries on re-seed
            SupplierLedger::where('supplier_id', $supplier->id)->delete();

            foreach ($ledgers as $lData) {
                $lData['supplier_id'] = $supplier->id;
                $lData['created_by'] = $adminId;
                SupplierLedger::create($lData);
            }
        }
    }
}
