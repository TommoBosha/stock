// import { useSession, signIn } from "next-auth/react";
// import { useState } from "react";
// import Nav from "@/components/Nav";

// export default function Layout({ children }) {
//     const { data: session } = useSession();
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState(null);

//     const handleLogin = async (e) => {
//     e.preventDefault();
//     const result = await signIn("credentials", {
//         redirect: false,
//         username,
//         password
//     });

//     if (result.error) {
//         console.log("Login failed:", result.error);
//         setError("Неправильный логин или пароль");
//     } else {
//         console.log("Login successful:", result);
//     }
// };

//     if (!session) {
//         return (
//             <div className="w-screen h-screen bg-primary flex items-center">
//                 <div className="text-center w-full">
//                     <form onSubmit={handleLogin} className="bg-secondary p-6 rounded-lg shadow-md w-64 mx-auto">
//                         <h2 className="text-lg font-bold mb-4">Вход</h2>
//                         {error && <p className="text-red-500 mb-4">{error}</p>}
//                         <input
//                             type="text"
//                             placeholder="Логин"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="block w-full mb-3 p-2 border rounded"
//                             required
//                         />
//                         <input
//                             type="password"
//                             placeholder="Пароль"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="block w-full mb-3 p-2 border rounded"
//                             required
//                         />
//                         <button
//                             type="submit"
//                             className="bg-blue-500 text-white w-full p-2 rounded">
//                             Войти
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-primary min-h-screen flex">
//             <Nav />
//             <div className="bg-secondary flex-grow mt-2 mr-2 mb-2 rounded-lg p-4">
//                 {children}
//             </div>
//         </div>
//     );
// }

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


