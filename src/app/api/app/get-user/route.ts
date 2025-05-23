import dbConnect from "@/database/dbConnect";
import User from "@/database/model/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  let _id = searchParams.get("id");
  let user = await User.findOne({ _id });

  return Response.json(
    { success: true, code: 200, data: { user } },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return Response.json({}, { status: 200 });
}
