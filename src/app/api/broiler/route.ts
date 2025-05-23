import dbConnect from "@/database/dbConnect";
import Broiler from "@/database/model/broiler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  let month = searchParams.get("month");
  let query = {};

  if (month) {
    query = {
      $expr: {
        $eq: [{ $month: "$createdAt" }, parseInt(month) + 1],
      },
    };
  }

  let broilers = await Broiler.find(query).sort({ createdAt: -1 });
  return Response.json(
    { success: true, code: 200, data: broilers },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();
  const { broiler, total, price } = body.broiler;
  await Broiler.create({ count: broiler, price, totalAmount: total });

  return Response.json(
    { success: true, code: 200, message: "Sent Successfully" },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return Response.json({}, { status: 200 });
}
