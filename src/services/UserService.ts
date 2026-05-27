import { currentUserSignal } from "../signals/auth.signals";
import { productsSignal, reviewsSignal, usersSignal } from "../signals/data.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import { sanitizeInputAsync } from "../utils/deferredSanitize";
import { mapReviewRecord } from "../utils/mappers";
import { NotificationService } from "./NotificationService";
import { ProductCatalogService } from "./ProductCatalogService";
import type { User, Review, UserAddress, PaymentMethod, UserRole } from "../types";

type UserStatus = NonNullable<User['status']>;

export class UserService {
    static async toggleFavorite(productId: string) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user') {
            NotificationService.error("Only customers can add favorites.");
            return;
        }

        const isFavorite = user.favorites.includes(productId);
        const newFavorites = isFavorite
            ? user.favorites.filter(id => id !== productId)
            : [...user.favorites, productId];

        currentUserSignal.value = { ...user, favorites: newFavorites };

        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, { favorites: newFavorites });
            NotificationService.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!');
        } catch (e) {
            console.error(e);
            NotificationService.error("Failed to update favorites.");
            currentUserSignal.value = user; // Revert
        }
    }

    static async addReview(reviewData: Omit<Review, 'id' | 'author' | 'authorId' | 'date'>) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user') {
            NotificationService.error("Only customers can write reviews.");
            return;
        }

        const [sanitizedAuthor, sanitizedComment] = await Promise.all([
            sanitizeInputAsync(user.name),
            sanitizeInputAsync(reviewData.comment),
        ]);

        const optimisticId = `pending-review-${Date.now()}`;
        const reviewDate = new Date().toISOString().split('T')[0];
        const optimisticReview: Review = {
            id: optimisticId,
            author: sanitizedAuthor,
            authorId: user.id,
            productId: reviewData.productId,
            rating: reviewData.rating,
            comment: sanitizedComment,
            date: reviewDate,
            status: 'pending',
        };

        reviewsSignal.value = [...reviewsSignal.value, optimisticReview];

        try {
            const pb = await loadPocketBase();
            const createdReview = await pb.collection('reviews').create({
                author: sanitizedAuthor,
                author_id: user.id,
                product_id: reviewData.productId,
                rating: reviewData.rating,
                comment: sanitizedComment,
                date: reviewDate,
                status: 'pending'
            });
            
            reviewsSignal.value = reviewsSignal.value.map(review => (
                review.id === optimisticId
                    ? mapReviewRecord({
                        ...createdReview,
                        author: createdReview.author || sanitizedAuthor,
                        author_id: createdReview.author_id || user.id,
                        product_id: createdReview.product_id || reviewData.productId,
                    })
                    : review
            ));
            NotificationService.success('Review submitted for moderation!');
        } catch (e) {
            console.error(e);
            reviewsSignal.value = reviewsSignal.value.filter(review => review.id !== optimisticId);
            NotificationService.error('Failed to submit review.');
        }
    }

    static async updateUserStatus(userId: string, status: UserStatus) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'admin') return;
        
        usersSignal.value = usersSignal.value.map(u => u.id === userId ? { ...u, status } : u);
        
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(userId, { status });
            NotificationService.success(`User status updated to ${status}.`);
        } catch (e) {
            NotificationService.error('Failed to update user status.');
        }
    }

    static async updateUserRole(userId: string, role: UserRole) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'admin') return;
        
        usersSignal.value = usersSignal.value.map(u => u.id === userId ? { ...u, role } : u);
        
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(userId, { role });
            NotificationService.success(`User role updated to ${role}.`);
        } catch (e) {
            NotificationService.error('Failed to update user role.');
        }
    }

    static async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'admin') return;
        
        reviewsSignal.value = reviewsSignal.value.map(r => r.id === reviewId ? { ...r, status } : r);
        
        try {
            const pb = await loadPocketBase();
            await pb.collection('reviews').update(reviewId, { status });
            NotificationService.success(`Review ${status}.`);
        } catch (e) {
            NotificationService.error('Failed to update review.');
        }
    }

    static async updateProductPrice(productId: string, wholesalerId: string, price: number, stock: number) {
        const user = currentUserSignal.value;
        if (!user || !user.retailerId || user.role !== 'retailer') {
            NotificationService.error('Permission denied.');
            return;
        }

        const originalProducts = [...productsSignal.value];
        const newProducts = productsSignal.value.map(p => {
            if (p.id === productId) {
                const newWholesalerStock = p.wholesalerStock.map(ws => {
                    if (ws.wholesalerId === wholesalerId) return { ...ws, price, stock };
                    return ws;
                });
                return { ...p, wholesalerStock: newWholesalerStock };
            }
            return p;
        });

        productsSignal.value = newProducts;

        const productToUpdate = newProducts.find(p => p.id === productId);
        if (!productToUpdate) return;

        try {
            const pb = await loadPocketBase();
            await pb.collection('products').update(productId, {
                wholesaler_stock: productToUpdate.wholesalerStock,
                ...ProductCatalogService.productIndexPayload(productToUpdate)
            });
            NotificationService.success('Listing updated successfully!');
        } catch (e) {
            console.error('Failed to update product price:', e);
            NotificationService.error('Failed to update listing.');
            productsSignal.value = originalProducts;
        }
    }

    static async updateUserContactInfo(contactInfo: Partial<User>) {
        const user = currentUserSignal.value;
        if (!user) return;

        const [
            name,
            phone,
            phoneSecondary1,
            phoneSecondary2,
            emailSecondary1,
            emailSecondary2
        ] = await Promise.all([
            contactInfo.name ? sanitizeInputAsync(contactInfo.name) : Promise.resolve(user.name),
            contactInfo.phone ? sanitizeInputAsync(contactInfo.phone) : Promise.resolve(user.phone),
            contactInfo.phoneSecondary1 ? sanitizeInputAsync(contactInfo.phoneSecondary1) : Promise.resolve(user.phoneSecondary1),
            contactInfo.phoneSecondary2 ? sanitizeInputAsync(contactInfo.phoneSecondary2) : Promise.resolve(user.phoneSecondary2),
            contactInfo.emailSecondary1 ? sanitizeInputAsync(contactInfo.emailSecondary1) : Promise.resolve(user.emailSecondary1),
            contactInfo.emailSecondary2 ? sanitizeInputAsync(contactInfo.emailSecondary2) : Promise.resolve(user.emailSecondary2),
        ]);

        const sanitizedInfo = { name, phone, phoneSecondary1, phoneSecondary2, emailSecondary1, emailSecondary2 };
        const updatedUser = { ...user, ...sanitizedInfo };
        currentUserSignal.value = updatedUser;

        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, {
                name: sanitizedInfo.name,
                phone: sanitizedInfo.phone,
                phone_secondary_1: sanitizedInfo.phoneSecondary1,
                phone_secondary_2: sanitizedInfo.phoneSecondary2,
                email_secondary_1: sanitizedInfo.emailSecondary1,
                email_secondary_2: sanitizedInfo.emailSecondary2
            });
            NotificationService.success('Contact info updated successfully!');
        } catch (e) {
            NotificationService.error('Failed to update contact info.');
            currentUserSignal.value = user;
        }
    }

    static async addAddress(address: Omit<UserAddress, 'id'>) {
        const user = currentUserSignal.value;
        if (!user) return;
        const newAddress: UserAddress = { ...address, id: `addr-${Date.now()}` };
        const newAddresses = [...(user.addresses || []), newAddress];
        currentUserSignal.value = { ...user, addresses: newAddresses };
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, { addresses: newAddresses });
            NotificationService.success('Address added successfully!');
        } catch (e) {
            currentUserSignal.value = user;
            NotificationService.error('Failed to add address.');
        }
    }

    static async removeAddress(addressId: string) {
        const user = currentUserSignal.value;
        if (!user) return;
        const newAddresses = (user.addresses || []).filter(a => a.id !== addressId);
        currentUserSignal.value = { ...user, addresses: newAddresses };
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, { addresses: newAddresses });
            NotificationService.success('Address removed.');
        } catch (e) {
            currentUserSignal.value = user;
            NotificationService.error('Failed to remove address.');
        }
    }

    static async addPaymentMethod(payment: Omit<PaymentMethod, 'id'>) {
        const user = currentUserSignal.value;
        if (!user) return;
        const newPayment: PaymentMethod = { ...payment, id: `pay-${Date.now()}` };
        const newPayments = [...(user.paymentMethods || []), newPayment];
        currentUserSignal.value = { ...user, paymentMethods: newPayments };
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, { payment_methods: newPayments });
            NotificationService.success('Payment method added!');
        } catch (e) {
            currentUserSignal.value = user;
            NotificationService.error('Failed to add payment method.');
        }
    }

    static async removePaymentMethod(paymentId: string) {
        const user = currentUserSignal.value;
        if (!user) return;
        const newPayments = (user.paymentMethods || []).filter(p => p.id !== paymentId);
        currentUserSignal.value = { ...user, paymentMethods: newPayments };
        try {
            const pb = await loadPocketBase();
            await pb.collection('users').update(user.id, { payment_methods: newPayments });
            NotificationService.success('Payment method removed.');
        } catch (e) {
            currentUserSignal.value = user;
            NotificationService.error('Failed to remove payment method.');
        }
    }
}
