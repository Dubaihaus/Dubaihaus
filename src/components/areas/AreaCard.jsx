// src/components/areas/AreaCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useProperties } from "@/hooks/useProperties";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const FALLBACK_IMG = "/dashboard/building.jpg";

export default function AreaCard({ area, index }) {
  if (!area) return null;

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);
  
  // Fetch a single property in this area to use its cover image
  const { data } = useProperties(
    {
      page: 1,
      pageSize: 1,
      pricedOnly: false,
      districts: area.id,
      region: area.region,
    },
    {
      enabled: !!area.id,
      staleTime: 1000 * 60 * 10,
    }
  );

  const coverFromProperty = data?.results?.[0]?.coverImage || null;
  const imageSrc = coverFromProperty || FALLBACK_IMG;

  // Parallax effect
  useEffect(() => {
    if (!cardRef.current || !isHovered) return;

    const card = cardRef.current;
    
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 3;
      const rotateX = ((centerY - y) / centerY) * 3;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />
        
        {/* Image container */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={imageSrc}
            alt={area.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            priority={index < 6}
          />
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
          
          {/* Region badge */}
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute bottom-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-gray-800 shadow-md"
          >
            {area.region}
          </motion.span>

          {/* Property count badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white"
          >
            {data?.count || 0}+ properties
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 relative z-0">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-lg font-bold text-gray-900 mb-2 line-clamp-1"
          >
            {area.name}
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1"
          >
            Discover premium off-plan properties in {area.name}, {area.region}. 
            {data?.count ? ` Featuring ${data.count} exclusive developments.` : ' Prime investment opportunities await.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="flex items-center justify-between mt-auto"
          >
            <span className="inline-flex items-center text-sm font-semibold text-sky-600 group-hover:text-sky-700 transition-colors duration-300">
              Explore Area
              <svg
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
            
            {/* Interactive stats */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                Hot
              </span>
            </div>
          </motion.div>
        </div>

        {/* Hover border effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-sky-200 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}