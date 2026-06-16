<?php
declare(strict_types=1);

namespace PocketBaseMysqlTranslator;

final class EndpointOptions
{
    public const DEFAULT_ALLOWED_COLLECTIONS = ['products'];

    /**
     * @param list<string> $allowedCollections
     * @param list<string> $allowedMethods
     */
    public function __construct(
        public readonly array $allowedCollections = self::DEFAULT_ALLOWED_COLLECTIONS,
        public readonly bool $exposeErrors = false,
        public readonly bool $healthChecksDatabase = true,
        public readonly string $source = 'mysql-translator',
        public readonly int $maxPerPage = 500,
        public readonly int $defaultPerPage = 30,
        public readonly int $maxPage = 1000000,
        public readonly int $mirrorMaxAgeSeconds = 0,
        public readonly array $allowedMethods = ['GET', 'HEAD', 'OPTIONS'],
    ) {
    }

    public static function fromEnv(): self
    {
        $allowed = Env::parseIdentifierList(Env::get('PBM_ALLOWED_COLLECTIONS', '') ?? '', true);
        return new self(
            $allowed === [] ? self::DEFAULT_ALLOWED_COLLECTIONS : $allowed,
            Env::truthy(Env::get('PBM_EXPOSE_ERRORS', 'false')),
            !Env::falsey(Env::get('PBM_HEALTH_CHECK_DB', 'true')),
            Env::get('PBM_SOURCE', 'mysql-translator') ?? 'mysql-translator',
            self::boundedInt(Env::get('PBM_MAX_PER_PAGE', '500'), 500, 1, 5000),
            self::boundedInt(Env::get('PBM_DEFAULT_PER_PAGE', '30'), 30, 1, 5000),
            self::boundedInt(Env::get('PBM_MAX_PAGE', '1000000'), 1000000, 1, 100000000),
            self::boundedInt(Env::get('PBM_MAX_MIRROR_AGE_SECONDS', '0'), 0, 0, 31536000),
        );
    }

    public function allowsCollection(string $collection): bool
    {
        return in_array('*', $this->allowedCollections, true)
            || in_array($collection, $this->allowedCollections, true);
    }

    public function allowsMethod(string $method): bool
    {
        return in_array(strtoupper($method), $this->allowedMethods, true);
    }

    private static function boundedInt(?string $value, int $default, int $min, int $max): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT);
        if ($int === false) {
            return $default;
        }
        return max($min, min($max, $int));
    }
}
