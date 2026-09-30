"use client";

import { useState, useRef } from "react";
import { updateProfilePicture } from "@/actions/profile";

export default function ProfileUploader({ 
    userId, 
    initialImage, 
    name, 
    size = "sm" 
}: { 
    userId: string, 
    initialImage?: string | null, 
    name: string,
    size?: "sm" | "lg"
}) {
    const [image, setImage] = useState(initialImage);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar!");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran gambar maksimal 2MB!");
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setImage(base64); // Optimistic UI
            const res = await updateProfilePicture(userId, base64);
            if (res.error) {
                alert("Gagal mengunggah foto: " + res.error);
                setImage(initialImage); // Revert
            }
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const isLg = size === "lg";
    const dimensions = isLg ? "w-12 h-12 text-xl" : "w-8 h-8 text-sm";

    return (
        <div className="relative group flex-shrink-0">
            <input 
                type="file" 
                ref={fileRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            
            <button 
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className={`relative rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 ${dimensions} ${image ? "bg-white" : "bg-blue-100 text-blue-700"} hover:ring-2 hover:ring-indigo-400 transition-all`}
            >
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    name.charAt(0)
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className={`text-white ${isLg ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
            </button>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
