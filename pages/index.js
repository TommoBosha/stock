import Currency from "@/components/Currency";
import Layout from "@/components/Layout";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";



export default function Home() {
  const { data: session } = useSession();
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    fetchCurrency();
  }, []);

  function fetchCurrency() {
    axios.get("/api/currency").then((result) => {
      console.log(result.data)
      setCurrency(result.data);
    });
  }

  return (
    <Layout>
      <div className="text-blue-900 flex justify-between items-center">
        <h2>
          Hello, <b>{session?.user?.name}</b>
        </h2>
        <div>
          {currency ? (
            <p>Останній курс валюти: {currency[currency.length - 1].currency} грн.</p>
          ) : (
            <p>Завантаження останнього курсу валюти...</p>
          )}
        </div>
        <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={session?.user?.image}
            alt="photo"
            className="w-6 h-6" />
          <span className=" px-2">
            {session?.user?.name}

          </span>

        </div>


      </div>
      <div className="mt-4">
        <Currency fetchCurrency={fetchCurrency} />

      </div>
    </Layout>

  )
}
