import { Menu, Avatar } from "@mantine/core";
import { LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/Authcontext";

export default function AvatarMenu(){
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, setIsAuthenticated}  = useAuth();
    const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);
      

    // Function to handle sign out for authenticated users
    const handleSignOut = async () => {
        const { error } = await authClient.signOut();
        if (error) {
        console.error('Error signing out:', error);
        } else {
        setIsAuthenticated(false);
        router.push('/'); // Redirect to home page after sign out
        toast.success('Signed out successfully!'); // Show success toast      
        }
    };

    return(

        <Menu width={200} shadow="md">

            <Menu.Target>
                <Avatar radius="xl" size={40} src={user?.image || undefined} alt={user?.name || "User"} style={{ cursor: "pointer" }} />
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item leftSection={<User size={30}/>} >
                {user?.name || "Account"}
                </Menu.Item>

                <Menu.Item leftSection={<LogOut size={30} color="red"/>} onClick={handleSignOut} color="red">
                    Log Out
                </Menu.Item>
            </Menu.Dropdown>

        </Menu>
    )
}