<?php

namespace App\Services\SupplyChain;

use App\Models\Supplier;
use App\Models\SupplierLedger;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    /**
     * List suppliers with filters and pagination.
     */
    public function listSuppliers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Supplier::query();

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== 'all') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['has_balance'])) {
            if ($filters['has_balance'] === 'payable') {
                $query->where('current_balance', '>', 0);
            } elseif ($filters['has_balance'] === 'cleared') {
                $query->where('current_balance', '=', 0);
            }
        }

        return $query->orderBy('name', 'asc')->paginate($perPage)->withQueryString();
    }

    /**
     * Compute summary metrics for suppliers dashboard.
     */
    public function getMetrics(): array
    {
        $totalSuppliers = Supplier::count();
        $activeSuppliers = Supplier::where('is_active', true)->count();
        $totalPayable = Supplier::where('current_balance', '>', 0)->sum('current_balance');
        $clearedCount = Supplier::where('current_balance', '<=', 0)->count();

        return [
            'total_suppliers' => $totalSuppliers,
            'active_suppliers' => $activeSuppliers,
            'total_payable' => (float) $totalPayable,
            'cleared_suppliers' => $clearedCount,
        ];
    }

    /**
     * Create new supplier and record opening balance ledger if provided.
     */
    public function createSupplier(array $data, ?int $userId = null): Supplier
    {
        return DB::transaction(function () use ($data, $userId) {
            $openingBalance = isset($data['opening_balance']) ? (float) $data['opening_balance'] : 0.00;

            $supplier = Supplier::create([
                'name' => $data['name'],
                'company_name' => $data['company_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'country' => $data['country'] ?? 'Bangladesh',
                'opening_balance' => $openingBalance,
                'current_balance' => $openingBalance,
                'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : true,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($openingBalance != 0.00) {
                SupplierLedger::create([
                    'supplier_id' => $supplier->id,
                    'transaction_type' => 'opening_balance',
                    'reference_no' => 'OB-' . str_pad((string) $supplier->id, 5, '0', STR_PAD_LEFT),
                    'debit' => $openingBalance < 0 ? abs($openingBalance) : 0.00,
                    'credit' => $openingBalance > 0 ? $openingBalance : 0.00,
                    'balance' => $openingBalance,
                    'payment_method' => null,
                    'transaction_date' => now()->toDateString(),
                    'notes' => 'Opening balance recorded upon supplier creation',
                    'created_by' => $userId,
                ]);
            }

            return $supplier;
        });
    }

    /**
     * Update existing supplier information.
     */
    public function updateSupplier(Supplier $supplier, array $data): Supplier
    {
        $supplier->update([
            'name' => $data['name'],
            'company_name' => $data['company_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'],
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? 'Bangladesh',
            'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : $supplier->is_active,
            'notes' => $data['notes'] ?? null,
        ]);

        return $supplier;
    }

    /**
     * Record a transaction in supplier ledger and recalculate running balance.
     */
    public function recordTransaction(Supplier $supplier, array $data, ?int $userId = null): SupplierLedger
    {
        return DB::transaction(function () use ($supplier, $data, $userId) {
            $debit = isset($data['debit']) ? (float) $data['debit'] : 0.00;
            $credit = isset($data['credit']) ? (float) $data['credit'] : 0.00;

            // Running balance: Bills (Credit) increase payable, Payments (Debit) reduce payable
            $newBalance = (float) $supplier->current_balance + $credit - $debit;

            $ledger = SupplierLedger::create([
                'supplier_id' => $supplier->id,
                'transaction_type' => $data['transaction_type'] ?? 'payment',
                'reference_no' => $data['reference_no'] ?? null,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $newBalance,
                'payment_method' => $data['payment_method'] ?? null,
                'transaction_date' => $data['transaction_date'] ?? now()->toDateString(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            $supplier->update(['current_balance' => $newBalance]);

            return $ledger;
        });
    }

    /**
     * Get paginated ledger transactions for a supplier.
     */
    public function getLedger(Supplier $supplier, int $perPage = 25): LengthAwarePaginator
    {
        return $supplier->ledgers()
            ->with('creator:id,name,email')
            ->paginate($perPage)
            ->withQueryString();
    }
}
