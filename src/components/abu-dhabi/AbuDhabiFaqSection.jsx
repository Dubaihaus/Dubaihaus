// src/components/abu-dhabi/AbuDhabiFaqSection.jsx
"use client";

import FAQSection from "@/components/FAQSection";

export default function AbuDhabiFaqSection() {
    return (
        <div className="bg-[#F5F7FB]">
            {/* 
         We pass hideTabs=true and defaultTab="abudhabi" to the existing FAQSection.
         This requires updating FAQSection to accept these props.
       */}
            <FAQSection hideTabs={true} defaultTab="abudhabi" />
        </div>
    );
}
