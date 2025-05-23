import dbConnect from "@/database/dbConnect";
import User from "@/database/model/user.model";
import { NextRequest } from "next/server";

export async function GET() {
  await dbConnect();
  let users = await User.find();
  return Response.json(
    { success: true, code: 200, data: users },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();
  if (body?.id != null) await User.findOneAndUpdate({ _id: body.id }, body);
  else await User.create(body);

  return Response.json(
    {
      success: true,
      code: 200,
      message: body?.id != null ? "Updated Successfully" : "Sent Successfully",
    },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let id = searchParams.get("id");

  return await User.findOneAndDelete({ _id: id })
    .then(() =>
      Response.json(
        {
          success: true,
          code: 200,
          data: {},
        },
        { status: 200 }
      )
    )
    .catch(() =>
      Response.json(
        {
          success: false,
          code: 500,
        },
        { status: 500 }
      )
    );
}

export async function OPTIONS() {
  return Response.json({}, { status: 200 });
}
