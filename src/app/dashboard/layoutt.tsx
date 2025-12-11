// // app/dashboard/layout.tsx
// "use client";

// import { ReactNode, useState, useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import DashboardNav from "./dashboardNav";
// import { X } from "lucide-react";

// interface DashboardLayoutProps {
//   children: ReactNode;
// }

// type PanelType = 'aboutme' | 'contact' | 'mission' | 'myurls' | null;

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [activePanel, setActivePanel] = useState<PanelType>(null);
//   const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

//   // Check path on load and changes
//   useEffect(() => {
//     // Extract the panel name from the path
//     const panelMatch = pathname.match(/\/dashboard\/(\w+)/);
//     const panelName = panelMatch ? panelMatch[1] as PanelType : null;
    
//     if (panelName && ['aboutme', 'contact', 'mission', 'myurls'].includes(panelName)) {
//       setActivePanel(panelName);
//       setIsPanelOpen(true);
//     } else {
//       setActivePanel(null);
//       setIsPanelOpen(false);
//     }
//   }, [pathname]);

//   // Close panel and reset URL
//   const closePanel = () => {
//     setIsPanelOpen(false);
//     router.push('/dashboard');
//   };

//   return (
//     <div className="min-h-screen relative bg-gray-50">
//       <DashboardNav />
      
//       {/* Main dashboard content */}
//       <div className="pt-5">
//      {children}
//       </div>

//       {/* Sliding Panel */}
//       <div 
//         className={`absolute  inset-y-0 right-0 w-full md:w-1/2  shadow-xl z-40 transition-transform duration-300 transform ${
//           isPanelOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//             <button
//               onClick={closePanel}
//               className="text-white hover:text-gray-300 focus:outline-none"
//             >
//               <X className="h-6 w-6" />
//             </button>
         
//           {/* Panel Content */}
//           <div className="p-4">
//             {activePanel === 'aboutme' && (
//               <div>
//                 <h3 className="text-2xl font-bold mb-4">About Me</h3>
//                 <p className="mb-4">
//                   This is the about me section of the dashboard. You can include information about 
//                   yourself, your company, or your project here.
//                 </p>
//                 <p>
//                   The panel slides in from the right side and overlays the main dashboard content,
//                   without navigating away from the main page.
//                 </p>
//               </div>
//             )}

//             {activePanel === 'contact' && (
//               <div>
//                 <h3 className="text-2xl font-bold mb-4">Contact</h3>
//                 <p className="mb-4">
//                   This is the contact section where you can put your contact information or a contact form.
//                 </p>
//                 <div className="bg-gray-100 p-4 rounded-md">
//                   <p className="font-semibold">Email: contact@example.com</p>
//                   <p className="font-semibold">Phone: (555) 123-4567</p>
//                 </div>
//               </div>
//             )}

//             {activePanel === 'mission' && (
//               <div>
//                 <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
//                 <p className="mb-4">
//                   This section describes the mission and goals of your organization or project.
//                 </p>
//                 <p>
//                   You can include your mission statement, values, and other important information here.
//                 </p>
//               </div>
//             )}

//             {activePanel === 'myurls' && (
//               <div>
//                 <h3 className="text-2xl font-bold mb-4">My URLs</h3>
//                 <p className="mb-4">
//                   This section displays all of your shortened URLs and their statistics.
//                 </p>
//                 {/* You can include your URL list component here */}
//                 <div className="bg-gray-100 p-4 rounded-md">
//                               <p>URL list would go here...</p>
//                               {children}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
      

//       {/* Overlay for mobile - clicking it closes the panel */}
//       {isPanelOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
//           onClick={closePanel}
//         />
//       )}
//     </div>
//   );
// }