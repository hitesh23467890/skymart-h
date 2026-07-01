import React, { useState } from "react";
import {
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeftRight,
  Navigation,
} from "lucide-react";
import { PurchaseOrder } from "../types";

interface BeautifulTrackingDeviceProps {
  order: PurchaseOrder;
  onClose: () => void;
}

export default function BeautifulTrackingDevice({
  order,
  onClose,
}: BeautifulTrackingDeviceProps) {
  const [activeStep, setActiveStep] = useState(1);

  // Natural Earth Colors styling profiles
  const statusColors = {
    Processing: "bg-amber-100 text-amber-800 border-amber-200",
    "In Transit": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Out for Delivery": "bg-stone-100 text-stone-800 border-stone-200",
    Delivered: "bg-teal-100 text-teal-800 border-teal-200",
  };

  return (
    <div className="w-full bg-[#f4f2ec] border border-[#e2dfd5] shadow-2xl overflow-hidden rounded-3xl transition-all duration-500 animate-fade-in">
      {/* Premium Tracking Header */}
      <div className="bg-[#1c2e24] text-[#faf9f5] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2d4639]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-mono font-bold bg-[#334d3e] text-[#a9dfbf] rounded-full">
              Live Transit Lock
            </span>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${statusColors[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <h3 className="font-serif text-2xl tracking-wide mt-2 text-stone-100 uppercase">
            Order Reference:{" "}
            <span className="font-mono font-bold">{order.id}</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1 font-mono">
            Acquisition Ledger Date: {order.date}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xs uppercase font-bold tracking-widest bg-[#faf9f5] text-[#1c2e24] hover:bg-[#eae7dd] px-5 py-3 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Return to Ledger
        </button>
      </div>

      {/* Main Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT COLUMN: Premium Natural Address Fields and Tracking Milestones */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-[#faf9f5] border-r border-[#e2dfd5] flex flex-col justify-between space-y-8">
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone-400 mb-4 font-bold">
              01 / Logistics Properties
            </h4>

            {/* Origin & Destination Route Cards */}
            <div className="space-y-4 relative">
              {/* Connector line for addresses */}
              <div className="absolute left-6 top-9 bottom-9 w-[1.5px] bg-dashed border-l border-stone-300/80"></div>

              {/* Origin Field */}
              <div className="flex gap-4 p-4 rounded-2xl bg-[#f5f4ef] border border-[#e6e4dc] transition-all hover:bg-[#eae8df]">
                <div className="w-10 h-10 rounded-xl bg-[#e3eae4] text-[#2d4639] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#567a65]">
                    Origin Dispatch Node
                  </span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    {order.productBrand} Fulfillment Hub
                  </p>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed font-medium">
                    {order.originCoordinates.label}
                  </p>
                </div>
              </div>

              {/* Destination Field */}
              <div className="flex gap-4 p-4 rounded-2xl bg-[#edf4f0] border border-[#d6e5dc] transition-all hover:bg-[#e1ece5]">
                <div className="w-10 h-10 rounded-xl bg-[#2d4639] text-[#faf9f5] flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="w-5 h-5 text-[#a9dfbf]" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-mono uppercase font-bold text-[#2d4639]">
                    Consignee Destination
                  </span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    {order.productName}
                  </p>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
                    {order.destinationCoordinates.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Sequence Milestones Stack */}
          <div className="flex-1 pt-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.25em] text-stone-400 mb-5 font-bold">
              02 / Real-time Ledger Milestones
            </h4>

            <div className="space-y-5">
              {order.trackingSteps.map((step, index) => (
                <div
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-start gap-4 cursor-pointer group transition-all duration-300 ${index === activeStep ? "scale-[1.01]" : "opacity-70 hover:opacity-100"}`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        step.completed
                          ? "bg-[#2d4639] border-[#2d4639] text-[#faf9f5]"
                          : "bg-white border-stone-300 text-stone-400 group-hover:border-stone-400"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex-1 text-left p-3 rounded-xl transition-colors ${index === activeStep ? "bg-[#f4f3ec] border border-[#e2dfd5]" : ""}`}
                  >
                    <div className="flex justify-between items-baseline">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${step.completed ? "text-stone-900" : "text-stone-500"}`}
                      >
                        {step.title}
                      </p>
                      <span className="text-[10px] font-mono text-stone-400 font-semibold">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Natural Theme Geographic Map Canvas Display Layout */}
        <div className="lg:col-span-7 bg-[#edebe1] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group select-none">
          {/* Subtle Map Topographic lines simulation vectors overlay */}
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none bg-[radial-gradient(#1c2e24_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="z-10 flex justify-between items-center bg-white/80 backdrop-blur-md p-4 border border-[#e2dfd5] rounded-2xl shadow-sm">
            <div className="text-left">
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block">
                Geographic Canvas Interface
              </span>
              <p className="text-xs font-bold text-stone-800 mt-0.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#2d4639] animate-pulse" />
                <span>Live Route Vectors Active</span>
              </p>
            </div>
            <div className="text-right font-mono text-xs font-bold text-[#2d4639]">
              {order.trackingSteps.filter((s) => s.completed).length * 25}%
              Dispatched
            </div>
          </div>

          {/* Interactive Geographic Map View Rendering Area */}
          <div className="flex-1 my-5 rounded-2xl bg-[#e6e4da] border border-[#d3d0c2] shadow-inner relative flex items-center justify-center overflow-hidden min-h-[300px]">
            {/* Visual Topography Map Lines Graphic */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-[80%] h-[80%] border border-[#c1bfae] rounded-full border-dashed animate-spin-slow"></div>
              <div className="absolute w-[50%] h-[50%] border border-[#c1bfae] rounded-full"></div>
              <div className="absolute w-[120%] h-[120%] border border-[#c1bfae]/40 rounded-full border-dashed"></div>
            </div>

            {/* Simulated Path Trace Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none p-12">
              <line
                x1="20%"
                y1="75%"
                x2="80%"
                y2="25%"
                stroke="#1c2e24"
                strokeWidth="2.5"
                strokeDasharray="8,6"
                className="animate-[dash_12s_linear_infinite]"
              />
              <line
                x1="20%"
                y1="75%"
                x2="45%"
                y2="52%"
                stroke="#567a65"
                strokeWidth="3"
              />
            </svg>

            {/* Warehouse Pin Element Node (Origin) */}
            <div className="absolute bottom-[20%] left-[15%] text-center animate-bounce-slow">
              <div className="w-10 h-10 rounded-full bg-[#1c2e24] border-2 border-white shadow-lg flex items-center justify-center text-white mx-auto hover:scale-110 transition-transform cursor-pointer">
                <Package className="w-4 h-4 text-[#a9dfbf]" />
              </div>
              <span className="inline-block mt-2 px-2.5 py-1 bg-stone-900/90 backdrop-blur-sm text-white text-[9px] font-mono rounded-md font-bold uppercase tracking-wider">
                Hub Node
              </span>
            </div>

            {/* Delivery Carrier Truck Pointer Moving Along Vector */}
            <div className="absolute top-[48%] left-[42%] text-center animate-pulse">
              <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white">
                <Truck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Consignee Pin Element Node (Destination) */}
            <div className="absolute top-[18%] right-[15%] text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-600 shadow-xl flex items-center justify-center text-emerald-700 mx-auto animate-pulse">
                <MapPin className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
              <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-900/90 backdrop-blur-sm text-[#faf9f5] text-[9px] font-mono rounded-md font-bold uppercase tracking-wider">
                Your Vault Location
              </span>
            </div>

            {/* Live Visual Distance Card Widget */}
            <div className="absolute bottom-4 right-4 bg-[#faf9f5]/95 backdrop-blur-sm px-4 py-2.5 border border-[#e2dfd5] rounded-xl shadow-md text-left max-w-[150px]">
              <span className="text-[8px] font-mono uppercase font-bold text-stone-400 block">
                ETA Interval
              </span>
              <p className="text-xs font-bold text-stone-900 mt-0.5">
                Approx. 42 Mins
              </p>
              <div className="w-full bg-stone-200 h-[3px] rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full w-[65%]"></div>
              </div>
            </div>
          </div>

          {/* Map Footer Informational Details */}
          <div className="bg-[#f4f2ec] border border-[#e2dfd5] p-4 rounded-xl text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-stone-200 rounded-lg">
                <Truck className="w-4 h-4 text-stone-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  Atelier Courier Assigned
                </p>
                <p className="text-[10px] text-stone-500 font-medium">
                  Eco-friendly Hybrid Route Carrier
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#2d4639] text-[#faf9f5] px-2.5 py-1 rounded-md uppercase">
              Route Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
