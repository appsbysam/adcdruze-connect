import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const APP_VERSION = "0.4.0";
const RELEASE_NOTES = [
  "Completed a broad connectivity pass across Home, Events, Directory, Groups, Businesses, Volunteer, Donations, Notifications and Admin.",
  "Connected Home announcements, group cards and community statistics to their relevant screens.",
  "Improved member and business contact actions, including tappable map/address links and safer website links.",
  "Verified event RSVP, volunteer registration, group membership/posts, notification routing and admin management flows.",
  "Retained the fixed version badge and automatic update/cache-busting system.",
];
const router = getRouter();

function VersionControl() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("adc-last-seen-version") !== APP_VERSION) setOpen(true);
    const checkForUpdate = async () => { try { const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: "no-store" }); if (!response.ok) return; const remote = await response.json(); if (remote.version && remote.version !== APP_VERSION) { const registration = await navigator.serviceWorker?.getRegistration(import.meta.env.BASE_URL); await registration?.update(); const url = new URL(window.location.href); url.searchParams.set("appv", remote.version); window.location.replace(url.toString()); } } catch {} };
    checkForUpdate(); const onVisible=()=>{ if(document.visibilityState==="visible") checkForUpdate(); }; document.addEventListener("visibilitychange",onVisible); return()=>document.removeEventListener("visibilitychange",onVisible);
  }, []);
  const close=()=>{localStorage.setItem("adc-last-seen-version",APP_VERSION);setOpen(false);};
  return <><button type="button" onClick={()=>setOpen(true)} aria-label={`App version ${APP_VERSION}. Open what's new.`} style={{position:"fixed",right:68,top:"calc(env(safe-area-inset-top, 0px) + 18px)",zIndex:9998,fontSize:10,fontWeight:700,letterSpacing:"0.02em",color:"rgba(15,23,42,.78)",background:"rgba(255,255,255,.94)",border:"1px solid rgba(148,163,184,.38)",borderRadius:999,padding:"4px 8px",backdropFilter:"blur(8px)",boxShadow:"0 2px 8px rgba(15,23,42,.08)",cursor:"pointer",transform:"translate3d(0,0,0)",willChange:"transform"}}>v{APP_VERSION}</button>{open&&<div role="dialog" aria-modal="true" aria-labelledby="whats-new-title" onClick={close} style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(2,8,23,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div onClick={e=>e.stopPropagation()} style={{width:"min(92vw,430px)",maxHeight:"80vh",overflowY:"auto",background:"white",borderRadius:24,padding:22,boxShadow:"0 24px 70px rgba(2,8,23,.28)"}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}><div><div style={{fontSize:11,fontWeight:800,color:"#0E8A4A",letterSpacing:".08em",textTransform:"uppercase"}}>Updated to v{APP_VERSION}</div><h2 id="whats-new-title" style={{margin:"5px 0 0",fontSize:24,lineHeight:1.15}}>What's new</h2></div><button type="button" onClick={close} aria-label="Close" style={{border:0,background:"#f1f5f9",width:34,height:34,borderRadius:999,fontSize:20,cursor:"pointer"}}>×</button></div><ul style={{margin:"18px 0 0",paddingLeft:20,color:"#334155",fontSize:14,lineHeight:1.55}}>{RELEASE_NOTES.map(note=><li key={note} style={{marginBottom:9}}>{note}</li>)}</ul><button type="button" onClick={close} style={{width:"100%",marginTop:12,border:0,borderRadius:14,padding:"12px 16px",background:"#0E8A4A",color:"white",fontWeight:700,cursor:"pointer"}}>Got it</button></div></div>}</>;
}
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><RouterProvider router={router}/><VersionControl/></React.StrictMode>);
requestAnimationFrame(()=>{const splash=document.getElementById("app-splash");if(splash){splash.classList.add("hide");window.setTimeout(()=>splash.remove(),300);}});
if("serviceWorker" in navigator){window.addEventListener("load",async()=>{try{const registration=await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js?v=${APP_VERSION}`,{scope:import.meta.env.BASE_URL});await registration.update();}catch(error){console.warn("Service worker registration failed",error);}});}
