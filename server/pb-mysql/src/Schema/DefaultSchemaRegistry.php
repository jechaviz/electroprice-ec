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
        ];
    }

    public function forCollection(string $collection): CollectionSchema
    {
        return $this->schemas[$collection] ?? new CollectionSchema($collection, 'pbm_records', true);
    }
}
