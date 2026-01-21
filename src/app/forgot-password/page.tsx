"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Spinner, Alert } from "@/app/component/ui"; // Import components

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const navigateTo = (path: string)=> {
    router.push(path);
  };

  return <div className="min-h-screen flex flex-col justify-center items-center background py-6 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Forgot Password</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 onClick={() => navigateTo("/")} className="text-3xl font-bold tracking-wide text-white emblema-one-regular cursor-pointer">
            URLTRIM
          </h1>
        </div>
      </nav>

      <div className="w-full mt-1 md:mt-24 sm:w-1/3 montserrat bg-white shadow-md rounded-lg p-3 sm:p-8 border border-gray-200">
        <h2 className="text-center text-xl sm:text-xl font-extrabold text-gray-900">
          Reset your password
        </h2>

        {isSubmitted ? <div className="mt-4 text-center">
              <p className="text-sm text-gray-700">
          If an account exists with the email <span className="font-medium">{email}</span>, we've sent password reset instructions.
          wait for few moment to receive the email.
              </p>
              <button onClick={() => navigateTo("/login")} className="mt-4 text-black font-bold hover:text-gray-800 underline cursor-pointer">
                Return to login
              </button>
            </div> : <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email address
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-1.5 border border-gray-300 rounded-md focus:ring-black focus:border-black text-sm sm:text-base" />
              </div>

              <Button type="submit"  variant="black" className="w-full py-1.5 font-bold text-sm bg-black hover:bg-gray-800">
                Reset Password
              </Button>
            </form>}

        {/* Back to login from forgot password */}
        {!isSubmitted && <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password? <button type="button" onClick={() => navigateTo("/login")} className="text-black font-bold hover:text-gray-800 underline cursor-pointer">
                Back to login
              </button>
            </p>
          </div>}
      </div>
    </div>;
}
