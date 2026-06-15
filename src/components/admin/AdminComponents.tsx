import React from 'react';
import type { Order, OrderStatus, Review, Product, User, Wholesaler } from '../../types';
import NativeSelect from '../common/NativeSelect';
import ImageWithFallback from '../common/ImageWithFallback';
import { getOrderItemKey, selectedOptionsLabel } from '../../utils/cartLine';

interface OrderRowProps {
   order: Order;
   users: User[];
   wholesalers: Wholesaler[];
   formatPrice: (price: number) => string;
   formatDate: (date: string) => string;
   getStatusTone: (status: OrderStatus) => string;
   getOrderStatusLabel: (status: OrderStatus) => string;
   updateOrderStatus: (orderId: string, status: OrderStatus) => void;
   ORDER_STATUSES: OrderStatus[];
   t: (key: string) => string;
   compact?: boolean;
}

export const OrderRow: React.FC<OrderRowProps> = ({
   order,
   users,
   wholesalers,
   formatPrice,
   formatDate,
   getStatusTone,
   getOrderStatusLabel,
   updateOrderStatus,
   ORDER_STATUSES,
   t,
   compact
}) => {
   const orderUser = users.find(item => item.id === order.userId);
   return (
      <tr className="border-b border-base-content/5 last:border-0 hover:bg-base-300/25">
         <td className="pl-4">
            <button
               type="button"
               className="font-mono text-xs font-semibold text-primary hover:underline"
               title={order.id}
            >
               {order.id.slice(0, 8)}
            </button>
            <div className="mt-1 text-xs text-base-content/45">{formatDate(order.date)}</div>
         </td>
         <td>
            <div className="font-semibold">{orderUser?.name || t('adminDashboard.common.notAvailable')}</div>
            <div className="text-xs text-base-content/45">{orderUser?.email || t('adminDashboard.common.notAvailable')}</div>
         </td>
         {!compact && (
            <td className="max-w-md">
               <div className="space-y-1">
                  {order.items.map(item => {
                     const wholesaler = wholesalers.find(candidate => candidate.id === item.wholesalerId);
                     return (
                        <div key={`${order.id}-${getOrderItemKey(item)}`} className="flex items-center gap-2 text-xs text-base-content/65">
                           <ImageWithFallback src={item.imageUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
                           <span className="min-w-0 flex-1 truncate">
                              <span className="font-bold text-primary">x{item.quantity}</span> {item.name}
                              {selectedOptionsLabel(item.selectedOptions) && (
                                 <span className="ml-1 text-base-content/40">({selectedOptionsLabel(item.selectedOptions)})</span>
                              )}
                           </span>
                           <span className="shrink-0 text-base-content/40">{wholesaler?.name || t('adminDashboard.common.notAvailable')}</span>
                        </div>
                     );
                  })}
               </div>
            </td>
         )}
         <td className="font-bold">
            <div>{formatPrice(order.total)}</div>
            <div className="text-[10px] text-success">
               {t('admin.revenueProfit')}: {formatPrice(order.total - (order.totalCost || 0))}
            </div>
            <div className="text-[10px] text-base-content/40">
               {t('admin.costBasis')}: {formatPrice(order.totalCost || 0)}
            </div>
         </td>
         <td>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusTone(order.status)}`}>
               {getOrderStatusLabel(order.status)}
            </span>
         </td>
         <td className="pr-4">
            <NativeSelect
               size="xs"
               className="min-w-52 rounded-md border-base-content/10 bg-base-100"
               value={order.status}
               onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
            >
               {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
               ))}
            </NativeSelect>
         </td>
      </tr>
   );
};

interface ReviewModerationItemProps {
   review: Review;
   products: Product[];
   users: User[];
   formatDate: (date: string) => string;
   updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected') => void;
   t: (key: string) => string;
}

export const ReviewModerationItem: React.FC<ReviewModerationItemProps> = ({
   review,
   products,
   users,
   formatDate,
   updateReviewStatus,
   t
}) => {
   const product = products.find(item => item.id === review.productId);
   const reviewUser = users.find(item => item.id === review.authorId);
   return (
      <div className="rounded-lg border border-base-content/10 bg-base-100 p-4">
         <div className="flex gap-3">
            {product?.imageUrl && (
               <ImageWithFallback src={product.imageUrl} alt="" className="h-16 w-16 rounded-md object-cover" />
            )}
            <div className="min-w-0 flex-1">
               <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-bold">{product?.name || review.productId}</p>
                  <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                     {t('review.statuses.pending')}
                  </span>
               </div>
               <p className="mt-1 text-xs text-base-content/45">
                  {reviewUser?.name || review.author} · {formatDate(review.date)}
               </p>
               <p className="mt-3 text-sm leading-relaxed text-base-content/70">"{review.comment}"</p>
            </div>
         </div>
         <div className="mt-4 flex justify-end gap-2">
            <button
               type="button"
               onClick={() => updateReviewStatus(review.id, 'rejected')}
               className="btn btn-error btn-sm rounded-md text-white"
            >
               <i className="fa-solid fa-xmark" />
               {t('adminDashboard.reviews.reject')}
            </button>
            <button
               type="button"
               onClick={() => updateReviewStatus(review.id, 'approved')}
               className="btn btn-success btn-sm rounded-md text-white"
            >
               <i className="fa-solid fa-check" />
               {t('adminDashboard.reviews.approve')}
            </button>
         </div>
      </div>
   );
};

export const EmptyState: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
   <div className="rounded-lg border border-dashed border-base-content/10 bg-base-200/40 px-5 py-8 text-center text-sm text-base-content/50">
      <i className={`fa-solid ${icon} mb-3 block text-2xl text-base-content/20`} />
      {text}
   </div>
);
