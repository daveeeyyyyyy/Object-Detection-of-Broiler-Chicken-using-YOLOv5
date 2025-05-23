"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import Excel from "exceljs";

import { DataTable } from "@/components/tables/recent_data-tables";
import { Button } from "@/components/ui/button";
import { Broiler } from "@/types";
import { Settings, Trash2, Download, ChevronLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/combobox";

import jason from "@/assets/json/constant.json";

interface ExtendedBroiler extends Broiler {
  name: string;
}

export default function Report() {
  const [broilersRaw, setBroilerRaw] = useState<Broiler[]>([]);
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState<{
    open: boolean;
    broiler: ExtendedBroiler | null;
  }>({ open: false, broiler: null });
  const [trigger, setTrigger] = useState(0);

  const { toast } = useToast();

  const columns: ColumnDef<Broiler>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ getValue }) => getValue() ?? "Broiler",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <div>{dayjs(getValue() as any).format("MMM DD, 'YY hh:mma")}</div>
      ),
    },
    {
      accessorKey: "count",
      header: "Broiler Count",
      cell: ({ getValue }) => <div>{getValue() as ReactNode}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) =>
        getValue() != null ? (
          <div>₱{getValue() as ReactNode}</div>
        ) : (
          <span className="text-slate-300">N/A</span>
        ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ getValue }) =>
        getValue() != null ? (
          <div>
            ₱
            {(getValue() as number)?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        ) : (
          <span className="text-slate-300">N/A</span>
        ),
    },
    {
      accessorKey: "_id",
      header: "Functions",
      cell: ({ getValue }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              let b = broilersRaw.filter((e) => e._id == getValue())[0];
              setOpenEdit({ open: true, broiler: b });
            }}
          >
            <Settings className="mr-2" /> Edit
          </Button>
          <Popover>
            <PopoverTrigger>
              <Button variant="destructive">
                <Trash2 className="mr-2" /> Delete
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4">
              <span>Are you sure to delete this broiler data ?</span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteBroiler(getValue() as string)}
                >
                  {loading ? <LoadingSpinner className="" /> : "YES"}
                </Button>
                <PopoverClose asChild>
                  <Button>NO</Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ];

  const reloadTable = () => setTrigger(trigger + 1);

  const getData2 = async (month?: number | null) => {
    const { data } = await axios.get("/api/broiler", {
      params: {
        month,
      },
    });
    if (data?.success ?? false) return data?.data;
  };

  const handleDeleteBroiler = async (id: string) => {
    setLoading(true);

    let res = await axios.delete("/api/broiler-web", {
      params: {
        id,
      },
    });

    if (res?.data?.success ?? false) {
      setLoading(false);
      reloadTable();
      toast({
        title: "Table has been refreshed",
      });
    } else setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const totalAmount =
      (openEdit?.broiler?.count ?? 0) * (openEdit?.broiler?.price ?? 0);

    let res = await axios.post("/api/broiler-web", {
      ...openEdit.broiler,
      totalAmount,
    });

    if (res?.data?.success ?? false) {
      setLoading(false);
      reloadTable();
      setOpenEdit({ open: false, broiler: null });
      toast({
        title: "Table has been refreshed",
      });
    } else setLoading(false);
  };

  const handleOnSelectFilter = (value: string) => {
    const monthIndex = jason.months.findIndex(
      (e) => e.toLocaleLowerCase() == value
    );

    (async () => {
      setBroilerRaw(await getData2(monthIndex < 0 ? null : monthIndex));
    })();
  };

  const exportToExcel = () => {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");

    sheet.mergeCells("A1:D1");
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("A1").font = {
      family: 4,
      size: 18,
      bold: true,
    };
    sheet.getCell(
      "A1"
    ).value = `Broiler Count Report as of ${new Date().getFullYear()}`;

    sheet.getRow(2).values = ["Name", "Date", "Broiler Count", "Total Amount"];
    sheet.properties.defaultRowHeight = 20;

    sheet.columns = [
      {
        key: "name",
        width: 30,
      },
      {
        key: "date",
        width: 30,
      },
      {
        key: "count",
        width: 15,
      },
      {
        key: "total",
        width: 22,
      },
    ];

    broilersRaw.map((e) => {
      sheet.addRow({
        name: e.name ?? "No Name",
        date: dayjs(e.createdAt).format("MMMM DD, YYYY - hh:mma"),
        count: e.count,
        total:
          [0, undefined, null].includes(e.count) ||
          [0, undefined, null].includes(e.price)
            ? 0
            : e.count * e.price,
      });
    });

    let s = (str: string) =>
      sheet.getCell(`${str.toLocaleUpperCase()}${broilersRaw.length + 3}`);
    s("f").font = {
      family: 4,
      size: 12,
    };
    s("c").value = "TOTAL";
    s("d").font = {
      family: 4,
      size: 14,
      bold: true,
    };

    const total = broilersRaw.reduce(
      (p, n) =>
        p +
        ([0, undefined, null].includes(n.count) ||
        [0, undefined, null].includes(n.price)
          ? 0
          : n.price * n.count),
      0
    );
    s("d").value = total.toFixed(2);
    s("d").alignment = {
      horizontal: "right",
    };

    // * styles the headers and lower cells
    for (let i = 0; i < broilersRaw.length + 1; i++) {
      ["A", "B", "C", "D"].map((c) => {
        sheet.getCell(`${c}${i + 2}`).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        if (i == 0)
          sheet.getCell(`${c}2`).font = {
            family: 4,
            size: 12,
            bold: true,
          };
      });
    }

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BROILER-REPORT-${dayjs().format("MM/DD/YYYY")}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Exported to excel successfully",
      });
    });
  };

  useEffect(() => {
    (async () => {
      setBroilerRaw(await getData2());
    })();
  }, [trigger]);

  return (
    <div className="flex flex-col m-4">
      <div className="flex justify-between">
        <Button
          className="w-24 ml-4"
          onClick={() => (window.location.href = "/")}
        >
          <ChevronLeft />
          BACK
        </Button>
        <Button className="mr-4 w-30" onClick={exportToExcel}>
          <Download className="mr-4" />
          EXPORT
        </Button>
      </div>
      <div className="flex justify-between items-end">
        <span className="mt-4 ml-4 text-5xl">Reports</span>
        <ComboBox
          onSelect={handleOnSelectFilter}
          placeholder="Select a Month"
          items={[
            {
              label: "All",
              value: "all",
            },
            ...jason.months.map((e) => ({
              label: e,
              value: e.toLocaleLowerCase(),
            })),
          ]}
        />
      </div>
      <DataTable columns={columns} data={broilersRaw} />
      <Dialog
        open={openEdit.open}
        onOpenChange={(e) => setOpenEdit({ ...openEdit, open: e })}
      >
        <DialogContent
          style={{
            width: 400,
          }}
          className="flex flex-col"
        >
          <DialogTitle>Update Broiler Data</DialogTitle>
          <div className="flex items-center gap-2">
            <label htmlFor="name" className="w-1/3">
              Name
            </label>
            <Input
              defaultValue={openEdit?.broiler?.name ?? ""}
              onChange={(e) =>
                setOpenEdit({
                  ...openEdit,
                  broiler: {
                    ...openEdit.broiler!,
                    name: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="name" className="w-1/3">
              Broiler Count
            </label>
            <Input
              type="number"
              defaultValue={openEdit?.broiler?.count ?? 0}
              onChange={(e) =>
                setOpenEdit({
                  ...openEdit,
                  broiler: {
                    ...openEdit.broiler!,
                    count: parseInt(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="name" className="w-1/3">
              Price
            </label>
            <Input
              type="number"
              defaultValue={
                (openEdit.broiler?.totalAmount ?? 0) /
                (openEdit.broiler?.count ?? 0)
              }
              onChange={(e) =>
                setOpenEdit({
                  ...openEdit,
                  broiler: {
                    ...openEdit.broiler!,
                    price: parseFloat(e.target.value),
                  },
                })
              }
            />
          </div>
          <span className="self-end">
            Total: ₱
            {[0, null, undefined].includes(openEdit.broiler?.count) ||
            [0, null, undefined].includes(openEdit.broiler?.price)
              ? "0.00"
              : (
                  (openEdit?.broiler?.count ?? 0) *
                  (openEdit?.broiler?.price ?? 0)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </span>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? <LoadingSpinner className={""} /> : "UPDATE"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
