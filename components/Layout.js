import Nav from "@/components/Nav";
import { useSession, signIn } from "next-auth/react"



export default function Layout({ children }) {
    const { data: session } = useSession();
    if (!session) {
        return (<div className=' w-screen h-screen bg-primary flex items-center'>
            <div className="text-center w-full">
                <button
                    onClick={() => signIn('google')}
                    className="bg-secondary p-2 px-4 rounded-lg ">Login with Google</button>
            </div>
        </div>);
    }
    return (
        <div className="bg-primary min-h-screen flex">
            <Nav />
            <div className="bg-secondary flex-grow mt-2 mr-2  mb-2 rounded-lg p-4">
                {children}
            </div>
        </div>

    )
}