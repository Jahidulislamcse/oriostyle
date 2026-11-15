<?php

namespace App\Models;

use App\Support\UrlSanitizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'is_public',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get casted value based on type.
     */
    public function getFormattedValueAttribute(): mixed
    {
        if (is_null($this->value) || $this->value === '') {
            return null;
        }

        if (in_array($this->key, ['site_logo', 'site_logo_white', 'site_favicon'], true)) {
            return UrlSanitizer::sanitize($this->value);
        }

        $booleanKeys = [
            'vat_inclusive',
            'cash_on_delivery_enabled',
            'online_payment_enabled',
            'whatsapp_chat_enabled',
            'popup_enabled',
            'popup_show_once_per_session',
        ];

        if ($this->type === 'boolean' || in_array($this->key, $booleanKeys, true)) {
            return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
        }

        return match ($this->type) {
            'integer' => (int) $this->value,
            'float' => (float) $this->value,
            'json' => json_decode($this->value, true) ?? [],
            default => $this->value,
        };
    }

    /**
     * Scopes.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopeGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }
}
