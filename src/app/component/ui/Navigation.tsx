"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavigationProps {
  isLoggedIn: boolean;
  setShowAuthModal: (show: boolean) => void;
  navigateTo: (path: string) => void;
}

export const Navigation = ({
  isLoggedIn,
  setShowAuthModal,
  navigateTo,
}: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.reload();
  };

  return (
    <nav className="glass hidden fixed py-10 top-0 left-0 w-full z-50 border-b border-border hiddeny">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-surface-hover transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} className="text-text-primary" /> : <Menu size={24} className="text-text-primary" />}
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide gradient-text">
            URLTRIM
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary">
            My URLs
          </button>
          <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary">
            Referral
          </button>
          <button className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary">
            Blog
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 w-full glass border-b border-border transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col space-y-2 p-4">
            <button className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary text-left">
              My URLs
            </button>
            <button 
              onClick={() => {
                setShowAuthModal(true);
                setMobileMenuOpen(false);
              }} 
              className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary text-left"
            >
              Referral
            </button>
            <button className="px-4 py-2 rounded-md hover:bg-surface-hover transition-all font-medium text-text-primary text-left">
              Blog
            </button>
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={() => {
                    navigateTo("login");
                    setMobileMenuOpen(false);
                  }} 
                  className="btn btn-secondary w-full"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    navigateTo("register");
                    setMobileMenuOpen(false);
                  }} 
                  className="btn btn-primary w-full"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
                className="btn btn-secondary w-full"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Desktop Auth Buttons + Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigateTo("login")} className="hidden md:inline-flex btn btn-secondary">
                Login
              </button>
              <button onClick={() => navigateTo("register")} className="hidden md:inline-flex btn btn-primary">
                Sign Up
              </button>
            </>
          ) : (
            <button onClick={handleLogout} className="hidden md:inline-flex btn btn-secondary">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
