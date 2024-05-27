import { NextRequest, NextResponse } from "next/server";
import { default_options } from "../utils/fetch_options";
import { getEnv } from "@config/env";

export async function GET(request: NextRequest) {
  try {
    let usr = request.nextUrl.searchParams.get("usr");
    if (!usr)
      return new NextResponse("User Needed", {
        status: 400,
      });
    let page = request.nextUrl.searchParams.get("page");
    let per_page = request.nextUrl.searchParams.get("per_page");

    let baseUrl = getEnv("GITHUB_ADDRESS");

    let resp = await fetch(
      `${baseUrl}/users/${usr}/repos?per_page=${per_page}&page=${page}`,
      default_options()
    );
    let data = await resp.json();
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (e) {
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
