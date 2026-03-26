import { NextResponse } from "next/server";

export function apiError(message: string, statusCode: number = 400, errors: any = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status: statusCode }
  );
}
