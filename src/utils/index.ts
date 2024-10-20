import { NextResponse } from "next/server";

export function errorObject<T>(error: T, statusCode: number = 500) {
  return NextResponse.json(
    {
      data: null,
      error: {
        message: ((error as any)?.message as string) ?? "Something went wrong",
      },
    },
    { status: statusCode }
  );
}
export function dataObject<T>(data: T, statusCode: number = 500) {
  return NextResponse.json(
    {
      data,
      error: null,
    },
    { status: statusCode }
  );
}
