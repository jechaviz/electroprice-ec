<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

interface SchemaRegistry
{
    public function forCollection(string $collection): CollectionSchema;

    /**
     * Collections whose source of truth is MySQL (writable via the endpoint).
     *
     * @return list<string>
     */
    public function appOwnedCollections(): array;
}
