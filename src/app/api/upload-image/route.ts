import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import { UploadImage } from '../../../lib/upload-image';
import { Image } from '../../../lib/models/image.model';

export async function POST(request: Request) {
    try {
        // 1. Connect to the DB first
        await connect(); 
        
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // 2. Upload to Cloudinary
        const uploadResult = await UploadImage(image, "image-upload") as any;
        console.log("Cloudinary Success:", uploadResult.secure_url);

        // 3. Save to MongoDB (Uncommented and active)
        const savedImage = await Image.create({
            filename: image.name,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            size: uploadResult.bytes,
            folder: uploadResult.folder || "image-upload",
            width: uploadResult.width,
            height: uploadResult.height
        });

        // 4. Return the saved DB document
        return NextResponse.json({ 
            success: true,
            image: savedImage, 
            cloudinaryUrl: uploadResult.secure_url
        }, { status: 200 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ 
            error: "Upload failed", 
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}