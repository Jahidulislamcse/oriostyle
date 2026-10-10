<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Services\SupplyChain\SupplierService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService
    ) {}

    /**
     * Display a listing of suppliers with metrics and ledger overview.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active', 'has_balance']);
        $suppliers = $this->supplierService->listSuppliers($filters, 15);
        $metrics = $this->supplierService->getMetrics();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'metrics' => $metrics,
            'filters' => $filters,
        ]);
    }

    /**
     * Display detailed supplier profile and ledger history.
     */
    public function show(Request $request, Supplier $supplier): Response
    {
        $ledger = $this->supplierService->getLedger($supplier, 25);

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier,
            'ledger' => $ledger,
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'opening_balance' => 'nullable|numeric',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $this->supplierService->createSupplier($validated, $request->user()?->id);

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier created successfully.');
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $this->supplierService->updateSupplier($supplier, $validated);

        return redirect()->back()->with('success', 'Supplier details updated successfully.');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('admin.suppliers.index')->with('success', 'Supplier removed successfully.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Supplier $supplier): RedirectResponse
    {
        $supplier->update(['is_active' => !$supplier->is_active]);

        return redirect()->back()->with('success', 'Supplier status toggled successfully.');
    }

    /**
     * Record a payment, bill, or adjustment in supplier ledger.
     */
    public function recordPayment(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'transaction_type' => 'required|in:payment,bill,adjustment,return',
            'amount' => 'required|numeric|min:0.01',
            'reference_no' => 'nullable|string|max:100',
            'payment_method' => 'nullable|string|max:50',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $amount = (float) $validated['amount'];
        $debit = 0.00;
        $credit = 0.00;

        // Payment made to supplier or return of goods reduces payable (debit)
        if (in_array($validated['transaction_type'], ['payment', 'return'])) {
            $debit = $amount;
        } elseif ($validated['transaction_type'] === 'bill') {
            $credit = $amount; // Supplier bill increases payable (credit)
        } else {
            // Adjustment: positive increases payable (credit), negative reduces payable (debit)
            $direction = $request->input('adjustment_direction', 'increase');
            if ($direction === 'decrease') {
                $debit = $amount;
            } else {
                $credit = $amount;
            }
        }

        $this->supplierService->recordTransaction($supplier, [
            'transaction_type' => $validated['transaction_type'],
            'reference_no' => $validated['reference_no'] ?? null,
            'debit' => $debit,
            'credit' => $credit,
            'payment_method' => $validated['payment_method'] ?? null,
            'transaction_date' => $validated['transaction_date'],
            'notes' => $validated['notes'] ?? null,
        ], $request->user()?->id);

        return redirect()->back()->with('success', 'Transaction successfully posted to supplier ledger.');
    }
}
