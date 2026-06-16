<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use DateTimeImmutable;
use DateTimeZone;

final class MirrorFreshnessChecker
{
    public function __construct(private readonly MysqlMirrorWriter $writer)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function status(int $maxAgeSeconds): array
    {
        $metadata = $this->writer->metadata();
        $completedAt = $metadata['pbm_last_sync_completed_at'] ?? '';
        $completed = $completedAt !== '' ? new DateTimeImmutable($completedAt) : null;
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
        $age = $completed ? max(0, $now->getTimestamp() - $completed->getTimestamp()) : null;
        $fresh = $age !== null && $age <= $maxAgeSeconds;

        return [
            'fresh' => $fresh,
            'ageSeconds' => $age,
            'maxAgeSeconds' => $maxAgeSeconds,
            'metadata' => $metadata,
            'counts' => $this->writer->hotCounts(),
        ];
    }
}
