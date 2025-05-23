"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { ColumnDef } from "@tanstack/react-table";
import { LogOut, Settings, FileBarChart2, LucideUsers } from "lucide-react";
import Cookie from "js-cookie";
import axios from "axios";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import jason from "@/assets/json/constant.json";
import AnalyticalCard from "@/components/customs/analytical_card";
import { DataTable } from "@/components/tables/recent_data-tables";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Broiler } from "@/types";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MoneyInput from "@/components/ui/money_input";

ChartJS.register(
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function HomePage() {
  const { toast } = useToast();

  const [broilers, setBroiler] = useState<Broiler[]>([]);
  const [broilersRaw, setBroilerRaw] = useState<Broiler[]>([]);
  const [totals, setTotal] = useState({ total: 0, totalToday: 0 });
  const [openUpdate, setOpenUpdate] = useState(false);
  const [max, setMax] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [pins, setPins] = useState({
    pin: "",
    newPin: "",
    confirmPin: "",
  });

  const [isValidating, setIsValidating] = useState(false);
  const [filter, setFilter] = useState<string>("monthly");
  const [days, setDays] = useState<string[]>([]);

  const [error, setError] = useState({ isError: false, errorMsg: "" });
  const [error2, setError2] = useState({ isError: false, errorMsg: "" });

  const [chickenPrice, setChickenPrice] = useState<any>(null);

  const refresh = () => setTrigger(trigger + 1);

  const validatePinUpdate = async () => {
    setIsValidating(true);
    let { data } = await axios.get("/api/init", {
      params: {
        pin: pins.pin,
      },
    });

    if (data.code == 201) {
      setError({ isError: true, errorMsg: "Incorrect Pin" });
      setIsValidating(false);
      return;
    } else {
      setError({ isError: false, errorMsg: "" });
      setIsValidating(false);

      if (pins.newPin != pins.confirmPin) {
        setError2({ isError: true, errorMsg: "Pin don't match" });
        setIsValidating(false);
        return;
      }
    }

    let res = await axios.post("/api/init", {
      pin: pins.newPin,
    });

    if (res?.data?.success) {
      toast({
        title: "Successfully Updated",
      });
      setOpenUpdate(false);
      setPins({ pin: "", newPin: "", confirmPin: "" });
    }
  };

  const columns: ColumnDef<Broiler>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <div className="text-center">
          {dayjs(getValue() as any).format("MMM DD, 'YY hh:mma")}
        </div>
      ),
    },
    {
      accessorKey: "count",
      header: "Broiler Count",
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as ReactNode}</div>
      ),
    },
  ];

  const handleUpdateChickenPrice = async () => {
    const {
      data: { success },
    } = await axios.post("/api/chicken-price", {
      chickenPrice,
    });

    if (success) {
      toast({
        title: "Successfully Updated the price",
      });

      refresh();
    }
  };

  const getData = async () => {
    const { data } = await axios.get("/api/broiler-web", {
      params: {
        type: filter,
      },
    });
    if (data?.success ?? false) return data?.data;
  };

  const getData2 = async () => {
    const { data } = await axios.get("/api/broiler");
    if (data?.success ?? false) return data?.data;
  };

  const getChickenPrice = async () => {
    const { data } = await axios.get("/api/chicken-price");
    const { success, data: apiData } = data;
    if (success) setChickenPrice(apiData[0]?.chickenPrice ?? null);
  };

  const getChickenData = async () => {
    (async () => {
      let _ = new Array(
        filter == "monthly"
          ? 12
          : dayjs().endOf("month").diff(dayjs().startOf("month"), "day") + 1
      ).fill(0);
      let __ = await getData();
      let _broilers = __.broilers;
      let _max = 0;

      setTotal({
        total: __.total,
        totalToday: __.totalToday,
      });

      setBroilerRaw(await getData2());

      for (let i = 0; i < _broilers.length; i++) {
        if (_max < _broilers[i].count) _max = _broilers[i].count;
        _[_broilers[i][filter == "monthly" ? "month" : "day"] - 1] =
          _broilers[i].count;
      }
      setMax(Math.ceil(_max / 100) * 100);
      setBroiler(_);
    })();

    if (filter == "daily") {
      const startOfMonth = dayjs().startOf("month");
      const endOfMonth = dayjs().endOf("month");
      let daysInMonth = [];
      for (let day = startOfMonth.date(); day <= endOfMonth.date(); day++) {
        daysInMonth.push(startOfMonth.date(day).format("MMM DD"));
      }
      setDays(daysInMonth);
    }
  };

  useEffect(() => {
    getChickenData();
  }, [filter]);

  useEffect(() => {
    getChickenPrice();
  }, [trigger]);

  return (
    <>
      <div className="flex flex-row justify-end gap-2 mt-10 mr-10">
        <Tabs defaultValue="monthly" onValueChange={(e) => setFilter(e)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => (window.location.href = "/report")}>
          <FileBarChart2 className="w-4 h-4 mr-2" /> Reports
        </Button>
        <Button onClick={() => (window.location.href = "/user")}>
          <LucideUsers className="w-4 h-4 mr-2" /> Users
        </Button>
        <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenUpdate(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{
              width: 320,
            }}
          >
            <Tabs defaultValue="pin" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pin">PIN</TabsTrigger>
                <TabsTrigger value="price">Price</TabsTrigger>
              </TabsList>
              <TabsContent value="pin">
                <div className="flex items-center gap-4">
                  <p>Enter Old Pin</p>
                  {error.isError && (
                    <span className="px-2 py-1 text-sm text-red-500">
                      *{error.errorMsg}
                    </span>
                  )}
                </div>
                <InputOTP
                  maxLength={6}
                  value={pins.pin}
                  disabled={isValidating}
                  onChange={(e) => setPins({ ...pins, pin: e })}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="flex items-center gap-4">
                  <p>Enter New Pin</p>
                  {error2.isError && (
                    <span className="px-2 py-1 text-sm text-red-500">
                      *{error2.errorMsg}
                    </span>
                  )}
                </div>
                <InputOTP
                  maxLength={6}
                  value={pins.newPin}
                  disabled={isValidating}
                  onChange={(e) => setPins({ ...pins, newPin: e })}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <p>Enter Confirm Pin</p>
                <InputOTP
                  maxLength={6}
                  value={pins.confirmPin}
                  disabled={isValidating}
                  onChange={(e) => setPins({ ...pins, confirmPin: e })}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  className="w-full mt-2"
                  disabled={
                    Object.values(pins).filter(
                      (e) => e == "" || e == null || e.length < 6
                    ).length > 0
                  }
                  onClick={validatePinUpdate}
                >
                  UPDATE
                </Button>
              </TabsContent>
              <TabsContent value="price">
                <MoneyInput
                  placeholder="Set the Price of Chicken"
                  defaultValue={chickenPrice}
                  options={{
                    addOnBefore: {
                      is_money: true,
                      decorator: "₱",
                    },
                  }}
                  onChange={(e) => {
                    setChickenPrice(parseFloat(e.target.value));
                  }}
                />
                <Button
                  className="w-full mt-2"
                  disabled={
                    chickenPrice == null ||
                    chickenPrice == undefined ||
                    chickenPrice == 0 ||
                    Number.isNaN(chickenPrice)
                  }
                  onClick={handleUpdateChickenPrice}
                >
                  UPDATE
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        <Button
          onClick={() => {
            Cookie.remove("isLoggedIn");
            Cookie.remove("lastPin");
            toast({
              title: "Successfully Logout",
              description: "Redirecting....",
            });

            setTimeout(() => window.location.reload(), 1000);
          }}
        >
          {/* supposedly link is not needed here but for formality lets include this here*/}
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
      <div className="flex min-h-screen justify-evenly mt-10">
        <div className="flex flex-col w-2/3 gap-y-8">
          <div className="flex gap-x-8">
            <AnalyticalCard
              title="Total Broiler Counted"
              value={totals.total}
            />
            <AnalyticalCard
              title="Total Broiler Counted Today"
              value={totals.totalToday}
            />
          </div>
          <Bar
            data={{
              labels: filter == "daily" ? days : jason.months,
              datasets: [
                {
                  label: "Broiler",
                  data: broilers,
                  backgroundColor: "teal",
                  type: "bar",
                },
              ],
            }}
            options={{
              responsive: true,
              hover: {
                mode: "point",
              },
              // interaction: {
              //   mode: "index",
              //   intersect: false,
              // },
              animations: {
                y: {
                  easing: "easeInOutElastic",
                },
              },
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  position: "bottom",
                  text: "Broiler Count in the Year 2024",
                  font: {
                    size: 32,
                  },
                },
              },
              scales: {
                y: {
                  min: 0,
                  max,
                  stacked: false,
                  title: {
                    display: true,
                    text: "Number of Broiler",
                  },
                  ticks: {
                    stepSize: 5,
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Date / Time",
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              onHover: function (event, chartElement) {},
            }}
            plugins={[
              {
                id: "intersectDataVerticalLine",
                beforeDraw: (chart) => {
                  if (chart.getActiveElements().length) {
                    const activePoint = chart.getActiveElements()[0];
                    const chartArea = chart.chartArea;
                    const ctx = chart.ctx;
                    ctx.save();
                    // grey vertical hover line - full chart height
                    ctx.beginPath();
                    ctx.moveTo(activePoint.element.x, chartArea.top);
                    ctx.lineTo(activePoint.element.x, chartArea.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "rgba(0,0,0, 0.1)";
                    ctx.stroke();
                    ctx.restore();

                    // colored vertical hover line - ['data point' to chart bottom] - only for charts 1 dataset
                    if (chart.data.datasets.length === 1) {
                      ctx.beginPath();
                      ctx.moveTo(activePoint.element.x, activePoint.element.y);
                      ctx.lineTo(activePoint.element.x, chartArea.bottom);
                      ctx.lineWidth = 2;
                      ctx.stroke();
                      ctx.restore();
                    }
                  }
                },
              },
            ]}
          />
        </div>
        <DataTable columns={columns} data={broilersRaw} classNames="mt-10" />
      </div>
    </>
  );
}
