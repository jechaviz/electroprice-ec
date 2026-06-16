<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class MirrorSyncResult
{
    /**
     * @param array<string, int> $sourceCounts
     * @param array<string, int> $writtenCounts
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public readonly string $syncId,
        public readonly bool $dryRun,
        public readonly array $sourceCounts,
        public readonly array $writtenCounts,
        public readonly array $metadata,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'syncId' => $this->syncId,
            'dryRun' => $this->dryRun,
            'sourceCounts' => $this->sourceCounts,
            'writtenCounts' => $this->writtenCounts,
            'metadata' => $this->metadata,
        ];
    }
}
