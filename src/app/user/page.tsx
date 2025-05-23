"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DataTable } from "@/components/tables/recent_data-tables";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, ChevronLeft, UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { DialogContent, Dialog, DialogTitle } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import UserType from "./user.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PasswordInput from "@/components/ui/InputPassword";
import { useToast } from "@/components/ui/use-toast";

const User = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<UserType[]>([]);
  const [trigger, setTrigger] = useState(0);
  const [openForm, setOpenForm] = useState<{
    open: boolean;
    data: UserType | null;
  }>({ open: false, data: null });

  const refreshTable = () => setTrigger(trigger + 1);

  // form schema
  const formSchema = z
    .object({
      name: z.string().min(1, { message: "Field is required" }).default("1"),
      lastname: z.string().min(1, { message: "Field is required" }),
      username: z.string().min(1, { message: "Field is required" }),
      password: z
        .string()
        .min(6, { message: "Password should be atleast 6 in length" }),

      ...(openForm.data == null
        ? {
            confirmPassword: z
              .string()
              .min(6, { message: "Password should be atleast 6 in length" }),
          }
        : {}),
    })
    .refine(
      (data) =>
        openForm.data == null ? data.password === data.confirmPassword : true,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data } = await axios.post("/api/user", {
      ...values,
      ...(openForm.data != null ? { id: openForm.data?._id ?? "" } : {}),
    });
    const { success } = data;

    if (success) {
      toast({
        description: `${
          openForm.data != null ? "Updated" : "Added"
        } Successfully`,
      });
      setOpenForm({ open: false, data: null });
      refreshTable();
    }
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({
        row: {
          original: { name, lastname },
        },
      }) => name + " " + lastname,
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <div>{dayjs(getValue() as any).format("MMM DD, 'YY hh:mma")}</div>
      ),
    },
    {
      accessorKey: "_id",
      header: "Functions",
      cell: ({ getValue, row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setOpenForm({ open: true, data: row.original });
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
              <span>Are you sure to delete this User ?</span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteBroiler(getValue() as string);
                  }}
                >
                  YES
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

  const getData2 = async () => {
    const { data } = await axios.get("/api/user");
    if (data?.success ?? false) return data?.data;
  };

  const handleDeleteBroiler = async (id: string) => {
    let res = await axios.delete("/api/user", {
      params: {
        id,
      },
    });

    if (res?.data?.success ?? false) {
      toast({
        title: "Table has been refreshed",
      });
      refreshTable();
    }
  };

  useEffect(() => {
    (async () => {
      setUsers(await getData2());
    })();

    if (openForm.open && openForm.data != null) form.reset(openForm.data);
    else {
      form.reset({ name: "" });
    }
  }, [trigger, openForm, form]);

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
        <Button
          className="mr-4 w-30"
          onClick={() => {
            setOpenForm({ open: true, data: null });
            form.resetField("name");
          }}
        >
          <UserPlus className="mr-4" />
          New User
        </Button>
      </div>
      <span className="mt-4 ml-4 text-5xl">Users</span>
      <DataTable columns={columns} data={users} />
      <Dialog
        open={openForm.open}
        onOpenChange={(e) => setOpenForm({ open: false, data: null })}
      >
        <DialogContent
          style={{
            width: 400,
          }}
          className="flex flex-col"
        >
          <DialogTitle>
            {openForm.data != null ? "Edit User" : "New User"}
          </DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                {...form.register("name")}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>First Name</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                {...form.register("lastname")}
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Lastname</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                {...form.register("username")}
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Username</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                {...form.register("password")}
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel>Password</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {openForm.data == null && (
                <FormField
                  {...form.register("confirmPassword")}
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <PasswordInput {...(field as any)} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" size="lg">
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default User;
