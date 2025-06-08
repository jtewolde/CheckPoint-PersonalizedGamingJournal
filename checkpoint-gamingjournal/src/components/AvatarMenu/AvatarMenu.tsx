import { Menu, Avatar } from "@mantine/core";
import { LogOut, User, CircleHelp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect} from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/Authcontext";

export default function AvatarMenu(){
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, setIsAuthenticated}  = useAuth();
    const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);


      // 🧠 Fetch session info on mount
      useEffect(() => {
        const fetchSession = async () => {
            const session = await authClient.getSession(); // Get current session
            if (session?.data?.user) {
                setUser({
                    name: session.data.user.name,
                    image: session.data.user.image || undefined,
                });
            }
        };

        fetchSession();
    }, []);
      

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
                <Avatar radius="xl" size={50} src={user?.image || undefined} alt={user?.name || "User"} style={{ cursor: "pointer", border:'3px solid black' }} />
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item leftSection={<User size={30}/>} >
                {user?.name || "Account"}
                </Menu.Item>

                <Menu.Item leftSection={<CircleHelp size={30} color='green'/>} onClick={() => router.push('/FAQ')}>
                    FAQ
                </Menu.Item>

                <Menu.Item leftSection={<LogOut size={30} color="red"/>} onClick={handleSignOut} color="red">
                    Log Out
                </Menu.Item>
            </Menu.Dropdown>

        </Menu>
    )
}