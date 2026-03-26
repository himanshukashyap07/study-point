import { NextResponse } from "next/server";

export function apiResponse(payload: any = {}, statusCode: number = 200) {
  // If payload is an array, wrap it under `data` key to avoid
  // spreading array indices as object keys (0, 1, 2…)
  const body = Array.isArray(payload)
    ? { success: true, data: payload }
    : { success: true, ...payload };

  return NextResponse.json(body, { status: statusCode });
}
