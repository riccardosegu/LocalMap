"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPlaceAction(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const rating = parseInt(formData.get("rating") as string);
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);
    const groupId = formData.get("groupId") as string;
    const shareCode = formData.get("shareCode") as string;

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "You must be logged in.", success: false };
    }

    // 2. Call RPC to Add Place & Link Group Atomically
    const { data, error } = await supabase.rpc('add_group_place', {
        group_id_input: groupId,
        name_input: name,
        description_input: description,
        lat_input: lat,
        lng_input: lng,
        rating_input: rating
    });

    if (error) {
        console.error("RPC Add Place failed:", error);
        // Generic error message for user, detailed in console
        return { message: "Failed to create place. Please try again.", success: false };
    }

    revalidatePath(`/group/${shareCode}`);
    return {
        message: "Place added successfully!",
        success: true,
        place: { ...data, lat, lng, name, description, rating }
    };
}

export async function createGroupAction(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const customCode = formData.get("customCode") as string; // Optional

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "You must be logged in.", success: false };
    }

    // 2. Validate Code (if provided)
    // Basic regex: Alphanumeric only, 3-20 chars
    if (customCode && !/^[A-Za-z0-9]{3,20}$/.test(customCode)) {
        return { message: "Code must be 3-20 alphanumeric characters.", success: false };
    }

    // 3. Insert Group via RPC (Security Definer)
    const { data: result, error } = await supabase.rpc('create_group', {
        name_input: name,
        code_input: customCode ? customCode.toUpperCase() : null
    });

    if (error) {
        console.error("Group creation failed:", error);
        return { message: "Failed to create group. Please try again.", success: false };
    }

    // RPC returns JSON with success flag and data
    // result = { success: boolean, id: uuid, share_code: string, message?: string }
    if (!result.success) {
        return { message: result.message || "Failed to create group.", success: false };
    }

    return {
        message: "Group created!",
        success: true,
        group: { id: result.id, share_code: result.share_code }
    };
}

export async function validateGroupCode(code: string) {
    const supabase = await createClient();

    // Use RPC to safely check code without exposing table permissions
    const { data, error } = await supabase.rpc('validate_group_code', {
        code_input: code.trim()
    });

    if (error) {
        console.error("Validation RPC error:", error);
        return { valid: false, message: "Error validating code." };
    }

    // RPC returns { valid: boolean, code?: string, id?: uuid }
    if (!data || !data.valid) {
        return { valid: false, message: "Group not found." };
    }

    return { valid: true, code: data.code };
}
