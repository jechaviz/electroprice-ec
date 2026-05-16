import { 
    productsSignal, reviewsSignal, wholesalersSignal, usersSignal, ordersSignal, 
    isCatalogLoadingSignal, isAccountDataLoadingSignal, dataErrorSignal 
} from "../signals/data.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import { 
    mapProductRecord, mapReviewRecord, mapWholesalerRecord, mapUserRecord, mapOrderRecord 
} from "../utils/mappers";
import { NotificationService } from "./NotificationService";

export class DataService {
    static async fetchPublicData() {
        isCatalogLoadingSignal.value = true;
        dataErrorSignal.value = null;
        try {
            const pb = await loadPocketBase();
            const [productsResult, reviewsResult, wholesalersResult] = await Promise.allSettled([
                pb.collection('products').getFullList(),
                pb.collection('reviews').getFullList(),
                pb.collection('wholesalers').getFullList()
            ]);

            if (productsResult.status === 'rejected') {
                throw productsResult.reason;
            }

            const productsData = productsResult.value;
            const reviewsData = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
            const wholesalersData = wholesalersResult.status === 'fulfilled' ? wholesalersResult.value : null;

            if (productsData) {
                productsSignal.value = (productsData as any).map(mapProductRecord);
            }

            if (reviewsData) {
                reviewsSignal.value = (reviewsData as any).map(mapReviewRecord);
                
                // Link reviews to products
                if (productsSignal.value.length > 0) {
                    productsSignal.value = productsSignal.value.map(p => ({
                        ...p,
                        reviews: (reviewsSignal.value as any[]).filter(r => r.productId === p.id)
                    }));
                }
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
                const [allUsersData, ordersData] = await Promise.all([
                    pb.collection('users').getFullList().catch(() => null),
                    pb.collection('orders').getFullList().catch(() => null)
                ]);

                usersSignal.value = allUsersData ? (allUsersData as any).map(mapUserRecord) : [];
                ordersSignal.value = ordersData ? (ordersData as any).map(mapOrderRecord) : [];
                return;
            }

            if (role === 'user') {
                const userOrdersData = await pb.collection('orders').getFullList({
                    filter: `user_id = "${userId}"`,
                    sort: '-date'
                }).catch(() => null);

                usersSignal.value = [];
                ordersSignal.value = userOrdersData ? (userOrdersData as any).map(mapOrderRecord) : [];
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
