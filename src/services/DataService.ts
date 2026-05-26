import { 
    productsSignal, reviewsSignal, wholesalersSignal, usersSignal, ordersSignal, 
    isCatalogLoadingSignal, isAccountDataLoadingSignal, dataErrorSignal 
} from "../signals/data.signals";
import { currentUserSignal } from "../signals/auth.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import { 
    mapProductRecord, mapReviewRecord, mapWholesalerRecord, mapUserRecord, mapOrderRecord 
} from "../utils/mappers";
import { NotificationService } from "./NotificationService";
import { ProductCatalogService } from "./ProductCatalogService";

const ADMIN_PRODUCT_INTEL_LIMIT = 120;
const ADMIN_PRODUCT_INTEL_FIELDS = [
    'id',
    'name',
    'brand',
    'category',
    'image_url',
    'specs',
    'wholesaler_stock',
    'feature_score',
    'canonical_key',
    'model_number',
    'manufacturer_url',
    'gallery',
    'documents',
    'software_links',
    'canonical_ids',
    'provider_aliases',
    'missing_pieces',
    'content_score',
    'identity_confidence',
    'enrichment_status',
    'business_notes',
    'best_price',
    'total_stock',
    'is_deal',
].join(',');

export class DataService {
    private static async hydrateCurrentUserProductReferences() {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user') return;

        const productIds = new Set([
            ...user.cart.map((item) => item.productId),
            ...user.favorites,
        ]);
        const missingProductIds = [...productIds].filter((productId) => (
            !productsSignal.value.some((product) => product.id === productId)
        ));

        if (missingProductIds.length === 0) return;

        await Promise.allSettled(
            missingProductIds.map((productId) => ProductCatalogService.fetchProductDetail(productId))
        );
    }

    static async fetchPublicData() {
        isCatalogLoadingSignal.value = true;
        dataErrorSignal.value = null;
        try {
            const pb = await loadPocketBase();
            const [productsResult, wholesalersResult] = await Promise.allSettled([
                ProductCatalogService.fetchPublicPreview(),
                pb.collection('wholesalers').getFullList()
            ]);

            if (productsResult.status === 'rejected') {
                throw productsResult.reason;
            }

            const productsData = productsResult.value;
            const wholesalersData = wholesalersResult.status === 'fulfilled' ? wholesalersResult.value : null;

            if (productsData) {
                ProductCatalogService.mergeProductsIntoCache(productsData);
            }

            if (wholesalersData) {
                wholesalersSignal.value = (wholesalersData as any).map(mapWholesalerRecord);
            }
        } catch (err: any) {
            console.error("Error fetching data from PocketBase:", err);
            dataErrorSignal.value = "Error de conexión: No se pudo cargar el catálogo de productos.";
            NotificationService.error("No se pudo conectar con el backend.");
        } finally {
            isCatalogLoadingSignal.value = false;
        }
    }

    static async fetchPrivilegedData(userId: string, role: string) {
        if (!userId || !role) {
            usersSignal.value = [];
            ordersSignal.value = [];
            return;
        }

        isAccountDataLoadingSignal.value = true;

        try {
            const pb = await loadPocketBase();

            if (role === 'admin') {
                const [allUsersData, ordersData, reviewsData, productsData] = await Promise.all([
                    pb.collection('users').getFullList().catch(() => null),
                    pb.collection('orders').getFullList().catch(() => null),
                    pb.collection('reviews').getFullList().catch(() => null),
                    pb.collection('products').getList(1, ADMIN_PRODUCT_INTEL_LIMIT, {
                        sort: 'content_score,total_stock,id',
                        fields: ADMIN_PRODUCT_INTEL_FIELDS,
                        skipTotal: true,
                    }).catch(() => null)
                ]);

                usersSignal.value = allUsersData ? (allUsersData as any).map(mapUserRecord) : [];
                ordersSignal.value = ordersData ? (ordersData as any).map(mapOrderRecord) : [];
                reviewsSignal.value = reviewsData ? (reviewsData as any).map(mapReviewRecord) : [];
                if (productsData) {
                    ProductCatalogService.mergeProductsIntoCache(((productsData as any).items || []).map(mapProductRecord));
                }
                return;
            }

            if (role === 'user') {
                const [userOrdersData, userReviewsData] = await Promise.all([
                    pb.collection('orders').getFullList({
                        filter: `user_id = "${userId}"`,
                        sort: '-date'
                    }).catch(() => null),
                    pb.collection('reviews').getFullList({
                        filter: `author_id = "${userId}"`,
                        sort: '-date'
                    }).catch(() => null)
                ]);

                usersSignal.value = [];
                ordersSignal.value = userOrdersData ? (userOrdersData as any).map(mapOrderRecord) : [];
                reviewsSignal.value = userReviewsData ? (userReviewsData as any).map(mapReviewRecord) : [];
                await DataService.hydrateCurrentUserProductReferences();
                return;
            }

            usersSignal.value = [];
            ordersSignal.value = [];
        } catch (err: any) {
            console.error("Error fetching account data from PocketBase:", err);
            usersSignal.value = [];
            ordersSignal.value = [];
            NotificationService.error('No se pudieron cargar los datos de tu cuenta.');
        } finally {
            isAccountDataLoadingSignal.value = false;
        }
    }
}
