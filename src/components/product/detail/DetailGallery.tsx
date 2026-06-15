import React from 'react';
import ImageWithFallback from '../../common/ImageWithFallback';

interface DetailGalleryProps {
   galleryImages: string[];
   currentImageIndex: number;
   setCurrentImageIndex: (index: number) => void;
   productName: string;
}

export const DetailGallery: React.FC<DetailGalleryProps> = ({
   galleryImages,
   currentImageIndex,
   setCurrentImageIndex,
   productName
}) => {
   return (
      <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 h-full min-h-[350px] lg:max-h-[500px]">
         {/* Thumbnails */}
         <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-24 shrink-0 order-2 md:order-1 hidden sm:flex">
            {galleryImages.map((img, idx) => (
               <button 
                  key={idx} 
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-20 h-20 md:w-full md:h-24 rounded-xl overflow-hidden border-2 bg-base-100 transition-all duration-200 shrink-0 ${currentImageIndex === idx ? 'border-primary shadow-lg shadow-primary/20' : 'border-base-content/10 opacity-60 hover:opacity-100'}`}
               >
                  <ImageWithFallback src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
               </button>
            ))}
         </div>

         {/* Main Image Frame */}
         <div className="flex-1 bg-gradient-to-br from-base-200 to-base-100 rounded-3xl border border-base-content/5 flex items-center justify-center p-8 relative overflow-hidden order-1 md:order-2 group">
            <ImageWithFallback
               src={galleryImages[currentImageIndex]}
               alt={productName}
               key={currentImageIndex}
               className="w-full h-full max-h-[600px] object-contain relative z-10 drop-shadow-2xl animate-fade-in"
            />

            {/* Mobile thumbnails embedded if tight, hidden on md */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 sm:hidden z-20">
               {galleryImages.map((_, idx) => (
                  <button 
                     key={idx} 
                     onClick={() => setCurrentImageIndex(idx)}
                     className={`w-3 h-3 rounded-full transition-all ${currentImageIndex === idx ? 'bg-primary scale-125' : 'bg-base-content/20'}`}
                  ></button>
               ))}
            </div>
         </div>
      </div>
   );
};
