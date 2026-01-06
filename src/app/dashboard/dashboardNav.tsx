import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, Menu, X, LayoutDashboard, Link as LinkIcon, Users, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import { MyURLs } from "@/app/dashboard/myurls/myurls";
import { Referrals } from "@/app/dashboard/referrals/referrals";

export default function DashboardNav({ isPanelOpen, closePanel, openPanel }: { isPanelOpen: boolean; closePanel: () => void; openPanel: (path: string, content: React.ReactNode) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, isPanelOpen]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handlePanelLink = (path: string, content: React.ReactNode) => {
    openPanel(path, content);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboard, onClick: () => router.push("/dashboard"), active: pathname === "/dashboard" && !isPanelOpen },
    { name: "My URLs", icon: LinkIcon, onClick: () => handlePanelLink("myurls", <MyURLs />), active: isPanelOpen && pathname.includes("myurls") },
    { name: "Referrals", icon: Users, onClick: () => handlePanelLink("referrals", <Referrals />), active: isPanelOpen && pathname.includes("referrals") },
    { name: "Blog", icon: FileText, onClick: () => handlePanelLink("blog", <MyURLs />), active: false },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "py-4" : "py-6"}`}>
      <div className="container mx-auto px-6">
        <div className={`glass glass-hover rounded-2xl flex items-center justify-between px-6 py-4 transition-all duration-300 ${scrolled ? "shadow-2xl shadow-black/50" : ""}`}>
          <div className="flex items-center gap-8">
            <h1
              onClick={() => router.push("/dashboard")}
              className="text-2xl font-black tracking-tighter text-white emblema-one-regular cursor-pointer hover:scale-105 transition-transform"
            >
              URLTRIM
            </h1>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    link.active 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile / Logout */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 animate-in slide-in-from-top-4 duration-300">
            <div className="glass rounded-2xl p-4 space-y-2 border border-white/10">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={link.onClick}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all ${
                    link.active 
                      ? "bg-white/10 text-white font-bold" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </button>
              ))}
              
              {user && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">Member</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}