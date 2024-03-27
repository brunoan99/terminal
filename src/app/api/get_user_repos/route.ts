import axios from "axios";
import github_address from "../../../config/env/github_address";
import github_token from "../../../config/env/github_token";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = `${github_address.value}`;
const TOKEN = `${github_token.value}`;

export async function GET(request: NextRequest) {
  try {
    let usr = request.nextUrl.searchParams.get("usr");
    if (!usr)
      return new NextResponse("User Needed", {
        status: 400,
      });
    let page = request.nextUrl.searchParams.get("page");
    let per_page = request.nextUrl.searchParams.get("per_page");
    const request_to_do = {
      url: `${BASE_URL}/users/${usr}/repos?per_page=${per_page}&page=${page}`,
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${TOKEN}`,
      },
    };
    process.nextTick(() => {});
    const response = await axios.request(request_to_do);
    let data = response.data;
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (e) {
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
