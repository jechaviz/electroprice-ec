<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class DefaultSchemaRegistry implements SchemaRegistry
{
    /** @var array<string, CollectionSchema> */
    private array $schemas;

    public function __construct()
    {
        $this->schemas = [
            // Catalog (read-only in the app): owned by the SQLite->MySQL mirror.
            'products' => new CollectionSchema('products', 'pbm_products', false, [
                'id' => 'id',
                'created' => 'created',
                'updated' => 'updated',
                'name' => 'name',
                'brand' => 'brand',
                'category' => 'category',
                'image_url' => 'image_url',
                'search_text' => 'search_text',
                'best_price' => 'best_price',
                'total_stock' => 'total_stock',
                'is_deal' => 'is_deal',
                'avg_rating' => 'avg_rating',
                'review_count' => 'review_count',
            ]),
            'wholesalers' => new CollectionSchema('wholesalers', 'pbm_records', true),

            // App-owned (authoritative in MySQL): the `app_records` table is NEVER
            // touched by the mirror's full-replace swap, so user-generated data
            // (auth, orders, reviews, telemetry) is safe across catalog syncs.
            'users' => new CollectionSchema('users', 'app_records', true),
            'orders' => new CollectionSchema('orders', 'app_records', true),
            'reviews' => new CollectionSchema('reviews', 'app_records', true),
            'telemetry' => new CollectionSchema('telemetry', 'app_records', true),
        ];
    }

    public function forCollection(string $collection): CollectionSchema
    {
        return $this->schemas[$collection] ?? new CollectionSchema($collection, 'pbm_records', true);
    }

    /**
     * Collections whose source of truth is MySQL (writable via the endpoint),
     * as opposed to mirror-managed catalog collections.
     *
     * @return list<string>
     */
    public function appOwnedCollections(): array
    {
        return ['users', 'orders', 'reviews', 'telemetry'];
    }
}
