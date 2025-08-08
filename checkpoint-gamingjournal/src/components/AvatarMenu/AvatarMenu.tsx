import { Menu, Avatar } from "@mantine/core";
import { LogOut, User, CircleHelp, Settings } from "lucide-react";
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

        <Menu width={200} shadow="md" position='bottom-start'>

            <Menu.Target>
                <Avatar radius="xl" size={50} src={user?.image || undefined} alt={user?.name || "User"} style={{ cursor: "pointer", border:'2px solid black' }} />
            </Menu.Target>

            <Menu.Dropdown styles={{
                dropdown: {
                    backgroundColor: '#232526',
                    border: '1px solid black',
                    fontFamily: 'Poppins',
                    fontWeight: 690,
                }
            }}>
                <Menu.Item leftSection={<User size={30}/>} color="white" >
                {user?.name || "Account"}
                </Menu.Item>

                <Menu.Item leftSection={<Settings size={30} color="lightgray" />} onClick={() => router.push('/settings')} color="white">
                    Settings
                </Menu.Item>

                <Menu.Item leftSection={<LogOut size={30} color="red"/>} onClick={handleSignOut} color="red">
                    Log Out
                </Menu.Item>
            </Menu.Dropdown>

        </Menu>
    )
}