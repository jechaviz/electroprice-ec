<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class MirrorRecord
{
    /**
     * @param array<string, mixed> $fields
     */
    public function __construct(
        public readonly string $collection,
        public readonly string $id,
        public readonly ?string $created,
        public readonly ?string $updated,
        public readonly string $dataJson,
        public readonly array $fields,
    ) {
    }
}
