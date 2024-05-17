import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";




export default function Home() {
  const { data: session } = useSession();


  return (
    <Layout>
      <div className="text-primary flex justify-between items-center">
        <h2>
          Привіт, <b>{session?.user?.name}</b>
        </h2>

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


      </div>
    </Layout>

  )
}
