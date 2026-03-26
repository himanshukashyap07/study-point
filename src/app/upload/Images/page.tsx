"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


interface ImageType {
    title: string;
    category: string;
    imageUrl: string[];
    description: string;
}

export default function page() {
    const [title, setTitle] = useState("");
    const [category, setCotegory] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [description, setDescription] = useState("")
    async function handelSubmit() {
        if (!title || !category || !imageUrl || !description) {
            toast.error("All fields are required");
            return;
        };
        const res = await axios.post("/api/uploadFile", imageUrl)
        if (!res.data.success) {
            toast.error("Failed to upload image");
            return;
        }
        setImageUrl(res.data.uploadResponse.url)
        const payload: ImageType = {
            title,
            category,
            imageUrl: [res.data.uploadResponse.url],
            description
        }
        const response = await axios.post("/api/imageSection", payload)
        if (!response.data.success) {
            toast.error("Failed to create image section");
            return;
        }
        return toast.success("Image uploaded successfully");
    }

    return (
        <div className="text-white">
            Upload image
            <br />
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <br />
            <input type="text" placeholder="Enter category" value={category} onChange={(e) => setCotegory(e.target.value)} />
            <br />
            <input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <br />
            <input type="file" placeholder="Enter image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <br />
            <button type="submit" onClick={handelSubmit}>Submit</button>
        </div>
    )
}