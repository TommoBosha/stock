import clientPromise from '@/lib/mongodb'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import NextAuth, { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const adminEmails = [process.env.ADMIN_EMAIL, process.env.ADMIN2_EMAIL, process.env.ADMIN3_EMAIL, process.env.ADMIN4_EMAIL, process.env.ADMIN5_EMAIL,process.env.ADMIN6_EMAIL];

export const authOptions = {
    providers: [

        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        }),

    ],
    adapter: MongoDBAdapter(clientPromise),
    callbacks: {
        session: ({ session, token, user }) => {
            if (adminEmails.includes(session?.user?.email)) {
                return session;
            } else {
                return false;
            }

        }
    }
}

export default NextAuth(authOptions);

export async function isAdminRequest(res, req) {
    const session = await getServerSession(req, res, authOptions);
    if (!adminEmails.includes(session?.user?.email)) {
        res.status(401);
        res.end();
        throw 'not an admin';
    }
}


// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { mongooseConnect } from "@/lib/mongoose";
// import LoginHistory from "@/models/LoginHistory";

// const users = [
//   { username: process.env.USER1_USERNAME, password: process.env.USER1_PASSWORD },
//   { username: process.env.USER2_USERNAME, password: process.env.USER2_PASSWORD },
//   { username: process.env.USER3_USERNAME, password: process.env.USER3_PASSWORD },
//   { username: process.env.USER4_USERNAME, password: process.env.USER4_PASSWORD },
//   { username: process.env.USER5_USERNAME, password: process.env.USER5_PASSWORD },
// ];

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" }
//       },
//       authorize: async (credentials) => {
//         const { username, password } = credentials;
//         console.log("Attempting to authenticate with username:", username);

//         // Найдите пользователя по имени
//         const user = users.find(u => u.username === username);
//         if (!user) {
//           console.log("User not found");
//           return null; // Прерываем, если пользователь не найден
//         }

//         // Проверка пароля
//         if (user.password !== password) {
//           console.log("Password mismatch for user:", username);
//           return null; // Прерываем, если пароль неверен
//         }

//         console.log("Authentication successful for user:", username);

//         await mongooseConnect(); // Подключаемся к базе данных

//         // Записываем информацию о входе в базу данных
//         await LoginHistory.create({ username });

//         return { id: user.username, name: user.username };
//       }
//     })
//   ],
//   callbacks: {
//     session: ({ session, user }) => {
//       session.user = user;
//       return session;
//     },
//   }
// };

// export default NextAuth(authOptions);
