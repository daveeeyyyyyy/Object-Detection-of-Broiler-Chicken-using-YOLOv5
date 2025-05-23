import dbConnect from "@/database/dbConnect";
import Settings from "@/database/model/settings";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  let settings = await Settings.find();

  const searchParams = req.nextUrl.searchParams;
  let pin = searchParams.get("pin");

  if (pin) {
    let settings = await Settings.findOne();

    if (settings.pin != pin) {
      return Response.json(
        { success: true, code: 201, message: "Wrong Password" },
        { status: 200 }
      );
    } else {
      return Response.json({ success: true, code: 200 }, { status: 200 });
    }
  } else {
    if (settings.length > 0) {
      return Response.json(
        { code: 200, success: true, message: "done" },
        { status: 200 }
      );
    } else {
      return Settings.create({ pin: "123456" })
        .then(() =>
          Response.json(
            { success: true, code: 200, message: "initialized" },
            { status: 200 }
          )
        )
        .catch((e) => {
          console.log(e);
          return Response.json(
            { code: 500, success: false, message: "Error in the Server" },
            { status: 500 }
          );
        });
    }
  }
}

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();

  let { pin } = body;

  return await Settings.findOneAndUpdate({}, { pin })
    .then((e) =>
      Response.json(
        {
          success: true,
          code: 200,
          message: "Updated Successfully",
        },
        { status: 200 }
      )
    )
    .catch((e) =>
      Response.json(
        {
          success: false,
          code: 500,
          message: "Error in the Server.",
        },
        { status: 200 }
      )
    );
}
