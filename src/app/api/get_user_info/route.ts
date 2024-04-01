import github_address from "../../../config/env/github_address";
import { NextRequest, NextResponse } from "next/server";
import { default_options } from "../utils/fetch_options";

const BASE_URL = `${github_address.value}`;

export async function GET(request: NextRequest) {
  try {
    let usr = request.nextUrl.searchParams.get("usr");
    if (!usr)
      return new NextResponse("User Needed", {
        status: 400,
      });

    let resp = await fetch(`${BASE_URL}/users/${usr}`, default_options);
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
