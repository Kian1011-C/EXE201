import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { locations } from '../data/locationsData';

export default function LocationsPage({ onOpenQuote }) {
  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-[#0f2942] text-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full">
            Regional Coverage
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Regional Partner Network Hubs
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Strategic partner network coverage hubs across Katy, Houston, and Garland (DFW), connecting Vietnamese-American consumers with licensed independent agents across Texas and expanding partner states.
          </p>
        </div>
      </section>

      {/* Office Cards List */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">
          {locations.map((loc, idx) => (
            <div 
              key={loc.id}
              className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f2942] flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-[#0f2942]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{loc.name}</h3>
                    <span className="text-xs font-semibold text-gray-500">Regional Agent Partner Coverage Hub</span>
                  </div>
                  {loc.isHQ && (
                    <span className="ml-auto bg-amber-500/20 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      Primary Hub
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm text-gray-600 pt-2">
                  <div className="space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Coverage Territory:</span>
                    <p className="font-bold text-gray-900">{loc.address}</p>
                    <p className="font-semibold text-gray-800">{loc.city}</p>
                  </div>

                  <div className="space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hub Contact:</span>
                    <a href={loc.phone.includes('@') ? `mailto:${loc.phone}` : `tel:${loc.phoneRaw}`} className="font-bold text-blue-900 hover:underline block text-base">
                      {loc.phone}
                    </a>
                    <span className="text-emerald-700 font-semibold text-xs">● Match Requests Online 24/7</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 font-bold text-blue-950">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>Partner Consultation Window:</span>
                  </div>
                  <p className="pl-6 text-gray-700">{loc.hours}</p>
                  <p className="pl-6 text-amber-700 font-medium">{loc.specialHours}</p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={loc.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0f2942] hover:bg-[#19426a] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <span>View Regional Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={onOpenQuote}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Request Local Agent Match
                  </button>
                </div>
              </div>

              {/* Simulated Map Visual */}
              <div className="lg:col-span-5">
                <div className="w-full h-64 bg-slate-100 rounded-2xl border border-gray-200 overflow-hidden relative flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-800">{loc.name}</h4>
                    <p className="text-xs text-gray-500">{loc.address}, {loc.city}</p>
                    <a
                      href={loc.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-bold text-blue-700 hover:underline pt-2"
                    >
                      Click to view regional coverage →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Disclaimer */}
      <section className="py-8 bg-white border-t border-gray-100 text-center text-xs text-gray-400 px-4">
        <div className="max-w-4xl mx-auto">
          <p>
            InsurMatch operates as a digital lead-generation and matchmaking platform connecting consumers with independent, properly licensed insurance agents. Regional hubs represent coverage and partner network areas, not brick-and-mortar carrier branches. InsurMatch does not sell insurance policies directly or collect premiums.
          </p>
        </div>
      </section>
    </div>
  );
}
