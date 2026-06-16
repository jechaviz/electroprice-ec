<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

use DateTimeImmutable;
use DateTimeZone;
use RuntimeException;

final class MirrorSyncService
{
    public function __construct(
        private readonly PocketBaseSqliteSource $source,
        private readonly MysqlMirrorWriter $writer,
    ) {
    }

    public function sync(MirrorOptions $options): MirrorSyncResult
    {
        return $this->withLock($options, function () use ($options): MirrorSyncResult {
            $syncId = gmdate('YmdHis') . '-' . bin2hex(random_bytes(4));
            $sourceCounts = [];
            $writtenCounts = [];

            foreach ($options->collections as $collection) {
                $sourceCounts[$collection] = $this->source->count($collection);
            }

            if ($options->dryRun) {
                return new MirrorSyncResult($syncId, true, $sourceCounts, [], ['mode' => 'dry-run']);
            }

            $this->writer->ensureSchema();
            $this->writer->beginSnapshot();

            foreach ($options->collections as $collection) {
                $batch = [];
                $writtenCounts[$collection] = 0;
                foreach ($this->source->records($collection, $options->batchSize) as $record) {
                    $batch[] = $record;
                    if (count($batch) >= $options->batchSize) {
                        $this->writer->writeRecords($batch);
                        $writtenCounts[$collection] += count($batch);
                        $batch = [];
                    }
                }
                if ($batch !== []) {
                    $this->writer->writeRecords($batch);
                    $writtenCounts[$collection] += count($batch);
                }
            }

            $this->writer->validateStageCounts($sourceCounts);
            $this->writer->swapSnapshot();
            $completedAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DATE_ATOM);
            $metadata = [
                'pb_mysql_version' => PocketBaseQueryTranslator::VERSION,
                'pbm_last_sync_id' => $syncId,
                'pbm_last_sync_source' => $options->source,
                'pbm_last_sync_collections' => implode(',', $options->collections),
                'pbm_last_sync_completed_at' => $completedAt,
                'pbm_last_sync_batch_size' => $options->batchSize,
            ];
            foreach ($sourceCounts as $collection => $count) {
                $metadata["pbm_last_sync_source_count_{$collection}"] = $count;
                $metadata["pbm_last_sync_written_count_{$collection}"] = $writtenCounts[$collection] ?? 0;
            }
            $this->writer->updateMetadata($metadata);
            $metadata['hot_counts'] = json_encode($this->writer->hotCounts(), JSON_UNESCAPED_SLASHES);

            return new MirrorSyncResult($syncId, false, $sourceCounts, $writtenCounts, $metadata);
        });
    }

    /**
     * @template T
     * @param callable(): T $operation
     * @return T
     */
    private function withLock(MirrorOptions $options, callable $operation): mixed
    {
        if (!$options->lockFile) {
            return $operation();
        }

        $dir = dirname($options->lockFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0770, true);
        }
        $handle = fopen($options->lockFile, 'c');
        if (!$handle) {
            throw new RuntimeException("Unable to open lock file {$options->lockFile}.");
        }
        if (!flock($handle, LOCK_EX | LOCK_NB)) {
            throw new RuntimeException('Mirror sync is already running.');
        }
        try {
            return $operation();
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
}
