import dbConnect from "@/database/dbConnect";
import Settings from "@/database/model/settings";

export async function GET() {
  await dbConnect();
  let settings = await Settings.find().sort({ createdAt: -1 });
  return Response.json(
    { success: true, code: 200, data: settings },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();
  const { chickenPrice } = body;

  await Settings.findOneAndUpdate({}, { $set: { chickenPrice } });

  return Response.json(
    { success: true, code: 200, message: "Sent Successfully" },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return Response.json({}, { status: 200 });
}
