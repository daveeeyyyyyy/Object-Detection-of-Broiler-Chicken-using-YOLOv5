"use client";

import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState({ isError: false, errorMsg: "" });

  const { toast } = useToast();

  const init = async () => {
    await axios.get("/api/init");
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="mb-24 text-3xl">
        Welcome to Admin Broiler Management{" "}
      </span>
      {loading ? (
        <span className="flex text-slate-300">
          Please wait... <LoadingSpinner className="mb-2 ml-2" />
        </span>
      ) : (
        <span className="mb-2">To proceed, please input your PIN</span>
      )}
      <InputOTP
        maxLength={6}
        value={pin}
        disabled={loading}
        onChange={async (e) => {
          setPin(e);
          if (e.length >= 6) {
            setLoading(true);

            let { data } = await axios.get("/api/init", {
              params: {
                pin: e,
              },
            });

            if (data.code == 201) {
              setError({ isError: true, errorMsg: "Pin is Incorrect" });
              setLoading(false);
            } else {
              setError({ isError: false, errorMsg: "" });
              setLoading(false);
              Cookie.set("isLoggedIn", "true");
              Cookie.set("lastPin", pin);
              setPin("");
              toast({
                title: "Successly Logged In",
                description: "Redirecting to Home Page",
              });

              setTimeout(() => window.location.reload(), 1500);
            }
          }
        }}
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
      {error.isError && (
        <div className="px-4 py-3 mt-2 text-red-500 border border-red-500 rounded">
          {error.errorMsg}
        </div>
      )}
    </div>
  );
}
