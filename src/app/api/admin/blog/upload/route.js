import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "blog");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Prepare file info
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = file.name.split(".").pop();
        const timestamp = Date.now();
        const uniqueId = randomUUID().split("-")[0];
        const filename = `${timestamp}-${uniqueId}.${fileExtension}`;

        // Ensure upload directory exists
        try {
            await mkdir(UPLOAD_DIR, { recursive: true });
        } catch (err) {
            // Directory might already exist, ignore error
        }

        // Write file
        const filepath = join(UPLOAD_DIR, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/blog/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
            size: file.size,
            type: file.type,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed", details: error.message },
            { status: 500 }
        );
    }
}

// Optional: Handle OPTIONS for CORS if needed
export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Allow": "POST, OPTIONS",
        },
    });
}
