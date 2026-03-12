 "use client";

 import { useEffect, useRef, useState, type RefObject } from "react";
 import { createPortal } from "react-dom";
 import Image from "next/image";
 import { Clock, Info, MessageCircle, Sparkles } from "lucide-react";
 import type { User } from "firebase/auth";
 import { signOut } from "firebase/auth";
 import { auth } from "@/lib/firebase";
 import { authFetch } from "@/lib/authFetch";

 const PANEL_WIDTH = 520;

 interface AnalyticsWindow {
   issuesCaptured: number;
   repliesMade: number;
   sessionsReviewed: number;
   timeSavedHours: number;
 }

 interface InsightsApiResponse {
   lifetime: AnalyticsWindow;
   last30Days: AnalyticsWindow;
 }

 const RIGHT_COLUMN_SECTIONS = [
   {
     title: "Account",
     items: [
       { label: "Billing", href: "#" },
       { label: "Upgrade plan", href: "#" },
     ],
   },
   {
     title: "Tools",
     items: [
       { label: "Install Chrome extension", href: "#" },
       { label: "Keyboard shortcuts", href: "#" },
     ],
   },
   {
     title: "Support",
     items: [{ label: "Help & Support", href: "#" }],
   },
 ];

 export interface ProfileCommandPanelProps {
   open: boolean;
   onClose: () => void;
   user: User | null;
   anchorRef: RefObject<HTMLElement | null>;
 }

 export function ProfileCommandPanel({
   open,
   onClose,
   user,
   anchorRef,
 }: ProfileCommandPanelProps) {
   const panelRef = useRef<HTMLDivElement>(null);
   const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
   const [mounted, setMounted] = useState(false);
   const [analytics, setAnalytics] = useState<InsightsApiResponse | null>(null);
   const [analyticsLoading, setAnalyticsLoading] = useState(false);

   useEffect(() => {
     if (!open || !anchorRef?.current) {
       setPosition(null);
       setMounted(false);
       return;
     }
     const el = anchorRef.current;
     const rect = el.getBoundingClientRect();
     const panelWidth = PANEL_WIDTH;
     const gap = 6;
     setPosition({
       top: rect.bottom + gap,
       left: Math.max(8, rect.right - panelWidth),
     });
     const t = requestAnimationFrame(() => {
       requestAnimationFrame(() => setMounted(true));
     });
     return () => cancelAnimationFrame(t);
   }, [open, anchorRef]);

   useEffect(() => {
     if (!open) return;
     const onKeyDown = (e: KeyboardEvent) => {
       if (e.key === "Escape") onClose();
     };
     document.addEventListener("keydown", onKeyDown);
     return () => document.removeEventListener("keydown", onKeyDown);
   }, [open, onClose]);

   useEffect(() => {
     if (!open) return;

     let cancelled = false;
     setAnalyticsLoading(true);

     authFetch("/api/insights")
       .then((res) => {
         if (!res.ok) throw new Error("Failed to load insights");
         return res.json();
       })
       .then((json: InsightsApiResponse) => {
         if (!cancelled) {
           setAnalytics(json);
         }
       })
       .catch(() => {
         if (!cancelled) {
           setAnalytics(null);
         }
       })
       .finally(() => {
         if (!cancelled) {
           setAnalyticsLoading(false);
         }
       });

     return () => {
       cancelled = true;
     };
   }, [open]);

   const handleBackdropClick = (e: React.MouseEvent) => {
     if (e.target === e.currentTarget) onClose();
   };

   const handleSignOut = () => {
     signOut(auth);
     onClose();
   };

   const displayName =
     user?.displayName?.trim() || user?.email?.split("@")[0] || "User";
   const workspaceName = "Workspace";
   const metaText = `Admin • ${workspaceName}`;
   const photoURL = user?.photoURL || "/avatar-placeholder.png";

   const last30 = analytics?.last30Days;
   const last30Issues = last30?.issuesCaptured ?? 0;
   const last30Replies = last30?.repliesMade ?? 0;
   const last30TimeSavedHours = last30?.timeSavedHours ?? 0;
   const last30TimeSavedDisplay = `${Math.round(last30TimeSavedHours) || 0}h`;

   const IMPACT_STATS = [
     {
       label: "Time saved reviewing feedback",
       value: last30TimeSavedDisplay,
       trend: "+23%",
       trendUp: true,
       context: "last 30 days",
       bg: "#ECFDF5",
       textColor: "#065F46",
       trendColor: "#059669",
       Icon: Clock,
     },
     {
       label: "Issues captured",
       value: String(last30Issues),
       trend: "+12%",
       trendUp: true,
       context: "last 30 days",
       bg: "#EFF6FF",
       textColor: "#1E3A8A",
       trendColor: "#2563EB",
       Icon: Info,
     },
     {
       label: "Replies made",
       value: String(last30Replies),
       trend: "-5%",
       trendUp: false,
       context: "last 30 days",
       bg: "#FFF7ED",
       textColor: "#7C2D12",
       trendColor: "#EA580C",
       Icon: MessageCircle,
     },
   ];

   if (!open) return null;

   const panel = (
     <div
       className="fixed inset-0 z-[1100]"
       aria-hidden
     >
       <div
         className="absolute inset-0"
         onClick={handleBackdropClick}
       />
       {position && (
         <div
           ref={panelRef}
           role="dialog"
           aria-label="Profile"
           className="fixed z-[1101] overflow-auto"
           style={{
             width: PANEL_WIDTH,
             top: position.top,
             left: position.left,
             background: "#FFFFFF",
             borderRadius: 14,
             border: "1px solid #EAEAEA",
             boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
             padding: 16,
             opacity: mounted ? 1 : 0,
             transform: mounted ? "translateY(0)" : "translateY(-4px)",
             transition: "opacity 120ms ease-out, transform 120ms ease-out",
           }}
           onClick={(e) => e.stopPropagation()}
         >
           {/* Two-column grid: insights (left) | profile + account (right) */}
           <div
             style={{
               display: "grid",
               gridTemplateColumns: "1fr 180px",
               gap: 20,
             }}
           >
             {/* Left column — metric cards (no section header) */}
             <div className="min-w-0 flex flex-col" style={{ gap: 14 }}>
               <div className="flex flex-col" style={{ gap: 14 }}>
                 {IMPACT_STATS.map((stat) => {
                   const Icon = stat.Icon;
                   return (
                     <div
                       key={`${stat.label}-${stat.value}`}
                       className="transition-[transform,box-shadow] duration-[120ms] ease-out hover:translate-y-[-1px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.05)]"
                       style={{
                         background: stat.bg,
                         borderRadius: 12,
                         padding: 16,
                         height: 96,
                         display: "flex",
                         flexDirection: "column",
                         justifyContent: "space-between",
                         minWidth: 0,
                       }}
                     >
                       {/* Row 1: icon + label */}
                       <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                         <span style={{ opacity: 0.8, flexShrink: 0 }} aria-hidden>
                           <Icon size={18} style={{ color: stat.textColor }} />
                         </span>
                         <p
                           style={{
                             fontSize: 13,
                             fontWeight: 500,
                             color: stat.textColor,
                             whiteSpace: "nowrap",
                             overflow: "hidden",
                             textOverflow: "ellipsis",
                             margin: 0,
                           }}
                         >
                           {stat.label}
                         </p>
                       </div>
                       {/* Row 2: metric value + trend */}
                       <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                         <span style={{ fontSize: 22, fontWeight: 600, color: stat.textColor }}>
                           {stat.value}
                         </span>
                         <span
                           style={{
                             fontSize: 12,
                             fontWeight: 500,
                             color: stat.trendColor,
                           }}
                         >
                           {stat.trend}
                         </span>
                       </div>
                       {/* Row 3: context line */}
                       <p
                         style={{
                           fontSize: 11,
                           color: "#6B7280",
                           margin: 0,
                         }}
                       >
                         {stat.context}
                       </p>
                     </div>
                   );
                 })}
               </div>

               {/* Feature discovery — upgrade */}
               <div
                 className="transition-[transform,box-shadow] duration-[120ms] ease-out hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                 style={{
                   background: "#EFF6FF",
                   border: "1px solid #DBEAFE",
                   borderRadius: 10,
                   padding: 10,
                 }}
               >
                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                   <Sparkles size={18} style={{ color: "#2563EB", flexShrink: 0 }} aria-hidden />
                   <p style={{ fontSize: 13, fontWeight: 500, color: "#1E3A8A", margin: 0 }}>
                     Unlock advanced feedback tools
                   </p>
                 </div>
                 <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                   Collaborate with your team, remove Echly branding, and access AI insights.
                 </p>
                 <button
                   type="button"
                   style={{
                     background: "#2563EB",
                     color: "white",
                     borderRadius: 8,
                     padding: "8px 14px",
                     fontSize: 12,
                     fontWeight: 500,
                     marginTop: 8,
                   }}
                   className="transition hover:opacity-90"
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = "#1D4ED8";
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = "#2563EB";
                   }}
                 >
                   Upgrade your workspace
                 </button>
               </div>
             </div>

             {/* Right column — profile header + account navigation */}
             <div className="flex flex-col min-w-0">
               {/* Profile header — top of right column */}
               <div className="flex items-start gap-3 mb-4">
                 <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E7E7E7] bg-[#F5F5F5]">
                   <Image
                     src={photoURL}
                     alt=""
                     width={40}
                     height={40}
                     className="h-full w-full object-cover"
                     unoptimized
                   />
                 </div>
                 <div className="min-w-0 flex-1">
                   <p style={{ fontSize: 15, fontWeight: 500, color: "#111111" }}>
                     {displayName}
                   </p>
                   <p style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>
                     {metaText}
                   </p>
                   <button
                     type="button"
                     style={{ fontSize: 12, fontWeight: 500 }}
                     className="mt-2 text-[#155DFC] hover:underline"
                   >
                     Edit profile
                   </button>
                 </div>
               </div>

               {RIGHT_COLUMN_SECTIONS.map((section) => (
                 <div key={section.title} className="mb-3 last:mb-0">
                   <p
                     style={{
                       fontSize: 11,
                       fontWeight: 600,
                       letterSpacing: "0.04em",
                       color: "#6B7280",
                       marginBottom: 6,
                     }}
                   >
                     {section.title}
                   </p>
                   <nav className="flex flex-col rounded-lg overflow-hidden" style={{ gap: 10 }}>
                     {section.items.map(({ label, href }) => (
                       <a
                         key={label}
                         href={href}
                         style={{ fontSize: 14, fontWeight: 500, padding: "4px 10px" }}
                         className="block text-[#111111] transition hover:bg-[#F5F7F6]"
                       >
                         {label}
                       </a>
                     ))}
                   </nav>
                 </div>
               ))}
               <button
                 type="button"
                 onClick={handleSignOut}
                 style={{ fontSize: 14, fontWeight: 500, color: "#E54848", marginTop: "auto", paddingTop: 12, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 }}
                 className="w-full rounded text-left transition hover:opacity-80 hover:bg-[#FEF2F2]"
               >
                 Sign out
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );

   return typeof document !== "undefined"
     ? createPortal(panel, document.body)
     : null;
 }
