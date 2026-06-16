<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

interface SchemaRegistry
{
    public function forCollection(string $collection): CollectionSchema;
}
