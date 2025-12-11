import { useRouter, usePathname } from "next/navigation";
import { useRouter as useRouter2 } from "next/router";
import { ChevronDown, User, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import { MyURLs} from "@/app/dashboard/myurls/myurls";
import {Referrals} from "@/app/dashboard/referrals/referrals"
export default function DashboardNav({ isPanelOpen, closePanel, openPanel }: { isPanelOpen: boolean; closePanel: () => void; openPanel: (path: string, content: React.ReactNode) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
   
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


     // Handle panel navigation with URL change but without full page navigation
  const handlePanelLink = (path: string, content: React.ReactNode) => {
    openPanel(path, content);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          onClick={() => router.push("/dashboard")}
          className="text-3xl font-bold tracking-wide text-white emblema-one-regular cursor-pointer"
        >
          URLTRIM
        </h1>

              {/* Desktop Navigation */}
               <div className="hidden md:flex space-x-6 text-white">
            <button onClick={() => handlePanelLink("myurls", <MyURLs/>)} className={`px-3 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold ${
              pathname === "/dashboard/myurls/myurls" ? "text-green-400" : ""
            }`}>
              My URLs
            </button>
           
           <button onClick={() => handlePanelLink("referrals", <Referrals/>)} className={`px-3 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold ${
              pathname === "/dashboard/referrals/referrals" ? "text-green-400" : ""
            }`}>
              Refferals
            </button>
            <div className="relative group">
             <button onClick={() => handlePanelLink("myurls", <MyURLs/>)} className={`px-3 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold ${
              pathname === "/dashboard/myurls/myurls" ? "text-green-400" : ""
            }`}>
                Blog
              </button>
            </div>
          </div>
        <div className="hidden md:flex space-x-6 text-white">
     
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* User info on desktop */}
        {user && (
          <div className="hidden md:flex rock-salt-regular items-center text-white space-x-4">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-black px-3 py-1 rounded hover:bg-white hover:text-black transition flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black text-white py-4 px-4 mt-2 rounded-b-lg shadow-lg">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handlePanelLink("myurls", <MyURLs/>)}
              className={`text-left py-2 border-b border-gray-700 doto font-bold ${
                pathname === "/dashboard/myurls" ? "text-green-400" : ""
              }`}
            >
              My Urls
            </button>
            <button
            onClick={() => handlePanelLink("referrals", <Referrals/>)}
              className={`text-left py-2 border-b border-gray-700 doto font-bold ${
                pathname === "/dashboard/referrals" ? "text-green-400" : ""
              }`}
            >
              Referrals
            </button>
            <button
              onClick={() => handlePanelLink("myurls", <MyURLs/>)}
              className={`text-left py-2 border-b border-gray-700 doto font-bold ${
                pathname === "/dashboard/Blog" ? "text-green-400" : ""
              }`}
            >
              Blog
            </button>
           

            {user && (
              <>
                <div className="rock-salt-regular flex items-center text-white py-2 border-b border-gray-700">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user.name}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center py-2 rock-salt-regular">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}