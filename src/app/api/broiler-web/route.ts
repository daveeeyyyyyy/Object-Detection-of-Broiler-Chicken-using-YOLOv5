import dbConnect from "@/database/dbConnect";
import Broiler from "@/database/model/broiler";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  let year = searchParams.get("year");
  let type = searchParams.get("type");

  if (!year) year = new Date().getFullYear().toString();

  const totalBroiler = (await Broiler.find().select("count")).reduce(
    (p, n) => p + n.count,
    0
  );

  const totalBroilerToday = (
    await Broiler.find({
      $and: [
        {
          createdAt: {
            $gte: dayjs().tz("Asia/Manila").startOf("day").toDate(),
          },
        },
        {
          createdAt: {
            $lte: dayjs().tz("Asia/Manila").endOf("day").toDate(),
          },
        },
      ],
    }).select("count")
  ).reduce((p, n) => p + n.count, 0);

  return await Broiler.aggregate(
    type == "monthly"
      ? [
          {
            $match: {
              $expr: {
                $eq: [{ $year: "$createdAt" }, parseInt(year)],
              },
            },
          },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
              },
              count: { $sum: "$count" },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              count: 1,
            },
          },
        ]
      : [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$createdAt" }, parseInt(year)] },
                  {
                    $eq: [{ $month: "$createdAt" }, new Date().getMonth() + 1],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: {
                day: { $dayOfMonth: "$createdAt" },
              },
              count: { $sum: "$count" },
            },
          },
          {
            $project: {
              _id: 0,
              day: "$_id.day",
              count: 1,
            },
          },
        ]
  )
    .then((result) => {
      return Response.json(
        {
          success: true,
          code: 200,
          data: {
            broilers: result,
            total: totalBroiler,
            totalToday: totalBroilerToday,
          },
        },
        { status: 200 }
      );
    })
    .catch((err) => {
      console.error(err);
    });
}

export async function POST(req: Request) {
  await dbConnect();
  let body = await req.json();

  return await Broiler.findOneAndUpdate({ _id: body._id }, { $set: body })
    .then(() =>
      Response.json(
        { success: true, code: 200, message: "Updated Successfully" },
        { status: 200 }
      )
    )
    .catch(() => Response.json({ success: false, code: 500 }, { status: 500 }));
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let id = searchParams.get("id");

  return await Broiler.findOneAndDelete({ _id: id })
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
