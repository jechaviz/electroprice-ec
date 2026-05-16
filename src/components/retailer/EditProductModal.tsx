
import React, { useState, useContext, useMemo } from 'react';
import type { Product } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { AppContext } from '../../contexts/AppContext';

interface EditProductModalProps {
    product: Product;
    onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
    // FIX: updateProductPrice now exists on AppContextType
    const { user, updateProductPrice } = useContext(AppContext);
    const { currency, rates } = useCurrency();
    
    const retailerPriceInfo = useMemo(() => {
        if (!user || !user.retailerId) return null;
        // FIX: Changed prices to wholesalerStock and retailerId to wholesalerId
        return product.wholesalerStock.find(p => p.wholesalerId === user.retailerId);
    }, [product, user]);
    
    const [price, setPrice] = useState(retailerPriceInfo?.price || 0);
    const [stock, setStock] = useState(retailerPriceInfo?.stock || 0);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
            setPrice(0);
            return;
        }

        const nextPrice = e.target.valueAsNumber;
        if (Number.isFinite(nextPrice) && nextPrice >= 0) {
            setPrice(nextPrice);
        }
    };

    const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
            setStock(0);
            return;
        }

        const nextStock = e.target.valueAsNumber;
        if (Number.isFinite(nextStock) && nextStock >= 0) {
            setStock(nextStock);
        }
    };
    
    const handleSave = () => {
        // FIX: user.retailerId now exists on User type
        if (user && user.retailerId) {
            const normalizedPrice = Number.isFinite(price) && price >= 0 ? price : 0;
            const normalizedStock = Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0;

            updateProductPrice(product.id, user.retailerId, normalizedPrice, normalizedStock);
            onClose();
        }
    };
    
    if (!rates || !currency) return null;

    return (
        <dialog open className="modal modal-open">
            <div className="modal-box">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg">Edit Listing: {product.name}</h3>
                
                <div className="form-control w-full mt-4">
                    <label className="label">
                        <span className="label-text">Your Price (in GBP - will be converted)</span>
                    </label>
                    <input 
                        type="number" 
                        value={price}
                        onChange={handlePriceChange}
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        className="input input-bordered w-full" 
                    />
                </div>

                <div className="form-control w-full mt-4">
                    <label className="label">
                        <span className="label-text">Stock Level</span>
                    </label>
                    <input 
                        type="number" 
                        value={stock}
                        onChange={handleStockChange}
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className="input input-bordered w-full" 
                    />
                </div>

                <div className="modal-action">
                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                    <button onClick={onClose} className="btn">Cancel</button>
                </div>
            </div>
             <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default EditProductModal;
