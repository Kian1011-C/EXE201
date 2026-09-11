import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, Award, Users, ArrowRight, Scale, SlidersHorizontal, Clock, Building2 } from 'lucide-react';
import { leadership, coreValues } from '../data/teamData';

export default function AboutPage({ onOpenQuote }) {
  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="bg-[#0f2942] text-white py-16 px-4 md:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-400/10 px-3.5 py-1.5 rounded-full">
            Our Mission & Legacy
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            About The Best Rate Insurance
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            We are your local independent insurance agency, dedicated to helping individuals, families, and businesses find peace of mind without breaking the bank.
          </p>
        </div>
      </section>

      {/* Story & Independent Philosophy */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#0f2942] font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                The Independent Agent Advantage
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f2942] tracking-tight">
                Why Having Choices Matters in Insurance
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                When you decide to buy a car, you wouldn’t purchase the first one you see. What if one day the automobile industry decided to make only one type of car, one make and one model? You wouldn’t have a choice!
              </p>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                The same situation holds true for insurance. You need insurance to protect your health, your home, your family’s financial future, and your business. But if there was only one insurance company offering one policy, you wouldn’t have a choice.
              </p>

              <div className="p-5 bg-blue-50/70 border-l-4 border-[#0f2942] rounded-r-2xl space-y-2">
                <h4 className="font-bold text-[#0f2942] text-sm">With an independent insurance agent, you have choices.</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Independent agents are not tied to any single insurance carrier. One of the greatest advantages is that our agents work exclusively to satisfy your needs, acting as your trusted advocate in evaluating claims and market options.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer text-sm"
                >
                  <span>Request A Policy Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" 
                  alt="Our Team collaborating" 
                  className="w-full h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2942]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fast Turnaround Promise</div>
                  <p className="text-sm font-semibold text-gray-200 mt-1">
                    "We pride ourselves on using modern technology and resources to provide our clients with a faster turnaround time than competitors."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-[#0f2942]">Our Core Pillars</h2>
            <p className="text-sm text-gray-600 mt-2">
              Every consultation, quote, and claim review is guided by our four founding values.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#0f2942] border border-slate-200 flex items-center justify-center font-bold mb-4">
                  {idx === 0 && <Scale className="w-5 h-5 text-amber-600" />}
                  {idx === 1 && <SlidersHorizontal className="w-5 h-5 text-blue-800" />}
                  {idx === 2 && <Users className="w-5 h-5 text-emerald-700" />}
                  {idx === 3 && <Clock className="w-5 h-5 text-slate-700" />}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{val.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Founders Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
              Leadership Team
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0f2942] mt-2">
              Meet The Executives & Founders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Experienced leaders passionate about education, community mentorship, and financial protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-[#0f2942] transition-all flex flex-col group"
              >
                <div className="h-60 overflow-hidden relative">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      Executive Leadership
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-[#0f2942] mt-0.5">{member.role}</p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{member.bio}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200/60 text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">Specialty: </span>
                    {member.specialty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nationwide Footprint */}
      <section className="py-16 bg-[#0f2942] text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-black">Licensed Across Multiple States</h2>
          <p className="text-sm text-gray-300 max-w-2xl mx-auto">
            In addition to our physical Texas locations in Katy, Houston, and Garland, our agents are active and licensed across:
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              'Texas (HQ)', 'California', 'Florida', 'Georgia', 'Indiana', 
              'Illinois', 'Massachusetts', 'Mississippi', 'Missouri', 
              'New Jersey', 'North Carolina', 'Oklahoma', 'Pennsylvania', 
              'South Carolina', 'Utah', 'Virginia', 'Wisconsin'
            ].map((st, i) => (
              <span key={i} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 border border-white/10">
                {st}
              </span>
            ))}
          </div>

          <div className="pt-6">
            <Link
              to="/contact"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-colors inline-block text-sm"
            >
              Contact Our Local Branch
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
