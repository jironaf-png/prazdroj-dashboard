import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, Download, Filter, Info, Leaf, MapPin, Calendar, AlertTriangle, CheckCircle2, Rocket, XCircle } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

// ----- Theme (Prazdroj greens) -----
const PRZ = {
  bg: "bg-emerald-50",
  bgAlt: "bg-emerald-100",
  card: "bg-white",
  text: "text-emerald-900",
  accent: "text-emerald-700",
  ring: "ring-emerald-600/30",
  primary: "bg-emerald-700",
  primaryHover: "hover:bg-emerald-800",
  chip: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  ok: "bg-emerald-100 text-emerald-800",
};

// ----- Data model (now with "category" replacing legacy "type of impact") -----
const PROJECTS = [
  {
    id: "agv-flt",
    name: "AGV and FLT Electrification",
    description:
      "Automation and electrification of material handling: fully automated warehouse in Radegast (Nošovice) with 16 AGV forklifts; electrification of FLTs across other sites.",
    duration: { start: 2021, end: null, label: "2021 – Present" },
    scope: ["Radegast Brewery, Nošovice", "Other CZ warehouse sites"],
    responsible: ["Tomáš Sedláček"],
    co2: { annual_t: 250, note: "AGV system in Nošovice; FLT electrification to add more" },
    capex: "Not disclosed; AGV warehouse multi-million EUR (assumed)",
    impact: ["Emissions reduction (S1/S2)", "Warehouse efficiency", "Automation", "H&S"],
    status: ["Completed (AGV in Nošovice)", "Ongoing (FLT electrification)"],
    risks: [
      "Demand from electrification may exceed green energy capacity",
      "Limited availability of 7T electric FLTs",
    ],
    benefits: [
      "CO₂ savings from FLT decommissioning",
      "Higher efficiency and safety",
      "Energy savings",
      "Modernised infrastructure",
    ],
    tags: ["AGV", "Electrification", "Warehouse"],
    type: "Warehouse Automation",
    category: "Warehouse Automation & Electrification",
    geography: ["CZ"],
  },
  {
    id: "awh-plzen",
    name: "Automated Warehouse in Plzeň (Phases 1 & 2) + Related Automation",
    description:
      "High-bay automated warehouse integrated with production via conveyors and shuttles; multiple automation sub-projects (RTLS/YMS, drones, shuttles, loading, picking).",
    duration: { start: 2021, end: 2026, label: "Phase1: 2021–2023; Phase2: 2024–2025; Sub-projects: 2023–2026" },
    scope: ["Plzeň brewery – storage, dispatch, internal transport"],
    responsible: ["Tomáš Sedláček"],
    co2: { annual_t: 645, note: "vs. diesel forklifts & idling reductions" },
    capex: "Tens of millions EUR",
    impact: ["Warehouse automation", "Operational efficiency"],
    status: ["Ongoing"],
    risks: [
      "High upfront cost, long ROI",
      "Complex SAP/transport integration",
      "Need for reliable green electricity",
      "Temporary constraints during expansion",
    ],
    benefits: [
      "~645 t CO₂/year reduction",
      "Double pallet capacity",
      "24/7 automated operations",
      "Lower labour intensity",
      "Improved safety",
    ],
    tags: ["Automation", "High-bay", "RTLS", "Drones"],
    type: "Warehouse Automation",
    category: "Warehouse Automation & Electrification",
    geography: ["CZ"],
  },
  {
    id: "blue-jonder",
    name: "Blue Yonder – Transport Planning Optimization",
    description:
      "AI-driven transport planning integrated with SAP to improve load factors and reduce trips; replaces OPDT.",
    duration: { start: 2025, end: null, label: "Pilot: Sep–Oct 2025; Full: TBD" },
    scope: ["CZ & SK outbound logistics"],
    responsible: ["Lukáš Princ"],
    co2: { annual_t: 300, range: [200, 400], note: "1–2% km reduction from better consolidation" },
    capex: "€50k–€120k (expected)",
    impact: ["Digitalization", "Route optimization", "Fuel efficiency"],
    status: ["Pilot preparation (Sep 2025)", "Planned"],
    risks: [
      "May not deliver if baseline already optimized",
      "Integration complexity with SAP/WMS",
      "Training & change management",
    ],
    benefits: [
      "Reduced shipments",
      "Better fill rates",
      "Visibility and flexibility",
      "Scalable to AEI",
    ],
    tags: ["TMS", "Optimization", "AI"],
    type: "Digital Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "circular-packaging",
    name: "Circular Packaging & Return Logistics",
    description:
      "Maximizing reusability/recyclability; high return rates for bottles/KEGs/tanks; SK deposit-return cans (92% in 2023).",
    duration: { start: 2019, end: null, label: "Ongoing" },
    scope: ["All CZ & SK breweries and DCs"],
    responsible: ["Packaging & ESG Team"],
    co2: { annual_t: 8472, note: "SK can DRS 2023; other savings TBC" },
    capex: "Varies; e.g., new sorting line ≈ CZK 50M (~€2M)",
    impact: ["Packaging", "Circular economy", "Logistics"],
    status: ["Ongoing"],
    risks: [
      "Infrastructure & legislation variability",
      "Double-stacking limits (fleet/site)",
      "Consumer behavior dependency",
    ],
    benefits: [
      "Major CO₂ & waste reduction",
      "Reduced raw material demand",
      "Synergy with logistics efficiency",
    ],
    tags: ["Returnable", "DRS", "Recycled Al 75%"],
    type: "Packaging & Logistics",
    category: "Circular Economy & Customer Efficiency",
    geography: ["CZ", "SK"],
  },
  {
    id: "drivers-compilation",
    name: "Eco-Driving Software (Drivers' Motivation)",
    description:
      "Telematics (FreeBoard) to score and incentivize efficient driving; training for new drivers and after new vehicles.",
    duration: { start: 2020, end: null, label: "Ongoing (started < 2023)" },
    scope: ["Company-operated fleet – CZ & SK"],
    responsible: ["Petr Princ"],
    co2: { annual_t: 54, note: "~1% diesel savings on 2M L" },
    capex: "~€4–5/vehicle/mo; potential €1–2 alternative",
    impact: ["Fleet & fuel management"],
    status: ["Active"],
    risks: [
      "Depends on continuous engagement",
      "Savings may plateau",
      "Cheaper SW may reduce data quality",
    ],
    benefits: [
      "Low-cost measurable CO₂ & fuel savings",
      "Promotes sustainable driving culture",
      "Scalable across fleets",
    ],
    tags: ["Telematics", "Training"],
    type: "Fleet Management",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "ev-trucks",
    name: "Electric Vehicles – Volvo Electric Truck & eSprinter tests",
    description:
      "Pilots to test feasibility of electric trucks/vans; Plzeň–Přehýšov shuttle; TCO model with green electricity assumption.",
    duration: { start: 2023, end: 2030, label: "Pilot 2023; scale-up by 2030 (C30)" },
    scope: ["Shuttle Plzeň–Přehýšov; future city logistics"],
    responsible: ["Lukáš Princ", "Jakub Nikl"],
    co2: { annual_t: 56, note: "per truck per year on green electricity" },
    capex: "High; TCO-based evaluation",
    impact: ["Alt fuels", "Fleet decarbonization"],
    status: ["Pilot completed (2023)", "Awaiting next steps"],
    risks: [
      "High upfront cost",
      "-1 pallet payload",
      "Charging infra & residual value uncertainty",
      "Model availability",
    ],
    benefits: [
      "Zero tailpipe emissions",
      "Lower noise & better air quality",
      "Future cost parity expected",
    ],
    tags: ["BEV", "Pilot"],
    type: "Alternative Fuels",
    category: "Fleet Decarbonization",
    geography: ["CZ"],
  },
  {
    id: "euro6",
    name: "Euro 6 Compliance for Entire Fleet",
    description:
      "All company-operated trucks upgraded to Euro 6; enables HVO use and lowers pollutants.",
    duration: { start: 2023, end: 2023, label: "Implemented by ~2023" },
    scope: ["500+ trucks in CZ"],
    responsible: ["Jakub Nikl"],
    co2: { annual_t: 49, note: "~1% efficiency on 5.87M km @ 0.83 kg/km" },
    capex: "Part of fleet renewal",
    impact: ["Transport efficiency"],
    status: ["Completed"],
    risks: ["Does not remove fossil dependency"],
    benefits: ["Eligibility for HVO", "Lower NOx/PM", "EU compliance"],
    tags: ["Euro6", "Fleet"],
    type: "Fleet Optimization",
    category: "Fleet Decarbonization",
    geography: ["CZ"],
  },
  {
    id: "mov-czsk",
    name: "Higher Minimum Order Volume (MOV) – CZ & SK",
    description:
      "Process/policy change increasing MOV to reduce delivery frequency and increase load utilization.",
    duration: { start: 2022, end: null, label: "2022 – ongoing" },
    scope: ["CZ & SK"],
    responsible: ["Jakub Nikl", "Denis Milfait"],
    co2: { annual_t: 880, note: "CZ ~660 t, SK ~220 t" },
    capex: "€0",
    impact: ["Order management", "Transport efficiency"],
    status: ["Implemented – continuous impact"],
    risks: [
      "Customer pushback",
      "ERP/tooling limits",
      "Inventory implications & stock-out risk",
    ],
    benefits: [
      "Significant CO₂ & cost savings",
      "Easier planning",
      "Scalable and replicable",
    ],
    tags: ["Policy", "MOV"],
    type: "Process Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "hvo100",
    name: "HVO100 Biofuel Transition for Company Fleet",
    description:
      "Plan to introduce HVO100 across CZ & SK fleet (2028–2030). Drop-in fuel with up to 90% lifecycle CO₂e reduction.",
    duration: { start: 2028, end: 2030, label: "Planned 2028–2030" },
    scope: ["~600 vehicles, CZ & SK"],
    responsible: ["Lukáš Princ", "Michael Kutscher"],
    co2: { annual_t: 304.6, note: "Conservative: 10% CZ Primary Distribution (CZ PD) only. Full potential CZ+SK PD+SD 100% ≈ 21,438 t/yr" },
    capex: "No significant CAPEX; OPEX premium vs diesel (scenarios provided)",
    impact: ["Scope 3 reduction", "Fuel switch"],
    status: ["Planned"],
    risks: [
      "Limited supply until post-2028",
      "Higher fuel cost",
      "Certification needs",
      "Feedstock volatility",
    ],
    benefits: [
      "Significant CO₂e reduction without vehicle mods",
      "Operational flexibility maintained",
      "Positive ESG alignment",
    ],
    tags: ["HVO100", "Fuel switch"],
    type: "Fuel Switching",
    category: "Fleet Decarbonization",
    geography: ["CZ", "SK"],
  },
  {
    id: "light-trailers",
    name: "Lower Weight Trailers for Trucks at PD",
    description:
      "Deploy lighter trailers to carry more payload or reduce fuel consumption; gradual integration since 2022.",
    duration: { start: 2022, end: null, label: "2022 – present" },
    scope: ["Primary distribution – CZ & SK selected lanes"],
    responsible: ["Lukáš Princ"],
    co2: { annual_t: 113, note: "33% PD on light trailers, 3% fuel saving" },
    capex: "Minimal if within replacement cycle",
    impact: ["Fleet optimization", "Fuel efficiency"],
    status: ["Ongoing rollout"],
    risks: [
      "Higher procurement cost",
      "Durability/repair trade-offs",
      "Benefits depend on mileage/load factor",
    ],
    benefits: [
      "Fuel & CO₂ reduction",
      "Potential increased payload",
      "Incremental improvement fleet-wide",
    ],
    tags: ["Trailers", "Weight"],
    type: "Fleet Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "long-xxl",
    name: "Long Trucks + XXL Trucks",
    description:
      "Long Trucks with extended trailers (CZ) and XXL trucks up to 45 t / 51 pallets (tested cross-border e.g., Nošovice → SK).",
    duration: { start: 2022, end: null, label: "Long Trucks 2022–present; XXL pilot 2022–2023" },
    scope: ["Primary distribution – CZ & SK"],
    responsible: ["Lukáš Princ"],
    co2: { annual_t: 440, note: "400 t (Long Trucks) + 40 t (XXL pilot)" },
    capex: "Minimal internal; < €25k/yr indirect diffs",
    impact: ["Transport efficiency", "Fleet optimization"],
    status: ["Long Trucks operational", "XXL pilot completed – under eval"],
    risks: [
      "Road regulation compliance",
      "Dock compatibility",
      "Carrier availability",
    ],
    benefits: [
      "Fewer shipments & lower CO₂",
      "Operational efficiency",
      "Potential cost savings",
    ],
    tags: ["Long truck", "XXL"],
    type: "Transport Efficiency",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "rtm-slovakia",
    name: "RTM Slovakia – New Distribution Hub (Nové Zámky)",
    description:
      "Relocate warehousing closer to SK markets to shorten routes and improve service levels; operational 2025, full impact 2026.",
    duration: { start: 2024, end: 2026, label: "Rollout 2024–2025; full impact 2026" },
    scope: ["Primary & secondary distribution in Slovakia"],
    responsible: ["Jakub Nikl", "Jaroslav Beneš"],
    co2: { annual_t: 148, note: "~3% SK PD distance reduction" },
    capex: "Warehouse leasing/setup, racking, MHE",
    impact: ["Logistics optimization"],
    status: ["Operational from 2025"],
    risks: [
      "Demand fluctuations",
      "Need efficient backhauls",
      "Payback sensitivity to volume",
    ],
    benefits: [
      "Shorter routes & lower CO₂",
      "Faster deliveries",
      "Market presence & flexibility",
    ],
    tags: ["Hub", "SK"],
    type: "Network Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["SK"],
  },
  {
    id: "pallet-density",
    name: "Pallet Density Optimization",
    description:
      "Increase units per pallet via packaging/pallet config; tested 100+ SKUs, 89 feasible; scaling from 2024.",
    duration: { start: 2022, end: null, label: "Pilot 2022–2023; Rollout 2024–ongoing" },
    scope: ["OFF-trade eligible SKUs, CZ & SK"],
    responsible: ["Martin Hrabík", "Michael Kutscher"],
    co2: { annual_t: 200, range: [155, 248], note: "5–8% trip reduction on ~12% SKUs" },
    capex: "Moderate – shelf & packaging redesign",
    impact: ["Logistics & packaging efficiency"],
    status: ["Tested, piloted & applied"],
    risks: [
      "Retailer constraints (height/mixed pallets)",
      "Stability & safety",
      "Contractual packaging limits",
    ],
    benefits: [
      "Lower CO₂ via fewer shipments",
      "Transport & packaging savings",
      "Better warehouse space use",
    ],
    tags: ["Pallet", "Packaging"],
    type: "Packaging & Logistics",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "production-sourcing",
    name: "Production Sourcing Optimization: Radegast & Gambrinus 12°",
    description:
      "Shift brewing/packaging closer to consumption zones (Radegast & Gambrinus 12°) to shorten primary distribution routes.",
    duration: { start: 2021, end: 2024, label: "2021/2024 staged" },
    scope: ["Plzeň, Velké Popovice"],
    responsible: ["Pavel Svoboda"],
    co2: { annual_t: 550, note: "~350 t (Radegast), ~200 t (Gambrinus 12° est.)" },
    capex: "Integrated in existing infrastructure & combi line",
    impact: ["Production optimization", "Primary distribution reduction"],
    status: ["Ongoing (staged)"],
    risks: [
      "Production slot constraints",
      "Coordination with Planning & Brand",
      "Demand variability",
    ],
    benefits: [
      "Shorter routes, lower primary km",
      "Fuel & transport cost savings",
      "Better capacity usage",
    ],
    tags: ["Sourcing", "Production"],
    type: "Network Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ"],
  },
  {
    id: "plan-tour",
    name: "Plan Tour – New Version (vR23)",
    description:
      "Modernize route planning system with new UI, better algorithms, and integrations; SD logistics for all breweries.",
    duration: { start: 2025, end: 2025, label: "Design Apr 2025; Dev from Jul 2025" },
    scope: ["SD Logistics – all breweries"],
    responsible: ["Jakub Nikl", "Digitech team"],
    co2: { annual_t: null, note: "TBC" },
    capex: "N/A",
    impact: ["Technological modernization"],
    status: ["In planning & design"],
    risks: [
      "Legacy integration delays",
      "User acceptance risk",
      "Algorithm optimization challenges",
    ],
    benefits: [
      "Improved planning efficiency",
      "Lower OPEX",
      "Reduced ecological footprint",
      "Modern UI",
    ],
    tags: ["Routing", "SD", "UI"],
    type: "Digital Optimization",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK"],
  },
  {
    id: "rail-intermodal",
    name: "Intermodal & Rail Transport (Plzeň–Nošovice, Plzeň–Šariš, General)",
    description:
      "Shift road freight to rail/intermodal where feasible; past pilots and ongoing route-dependent intermodal solutions.",
    duration: { start: 2019, end: null, label: "Pilots 2019–; feasibility 2022; ongoing selective" },
    scope: ["Domestic & international long-haul – raw materials & finished goods"],
    responsible: ["Lukáš Princ"],
    co2: { annual_t: 300, note: "70 + 120 + 110 t estimates" },
    capex: "Significant for re-establishing sidings; Plzeň–Nošovice track exists",
    impact: ["Modal shift", "Fuel switching"],
    status: ["Some pilots discontinued; selective intermodal active"],
    risks: [
      "Track maintenance & infra dependency",
      "Operational complexity",
      "Limited savings vs effort on some lanes",
      "Lead-time increase risk",
    ],
    benefits: [
      "Lower CO₂ per shipment (-70–75% per t-km)",
      "Higher payloads & fewer movements",
      "Potential fuel/toll cost benefits",
    ],
    tags: ["Rail", "Intermodal"],
    type: "Modal Shift",
    category: "Logistics & Fleet Optimization",
    geography: ["CZ", "SK", "International"],
  },
  {
    id: "smart-tap",
    name: "Smart Tap",
    description:
      "Digital monitoring/optimization of energy & water in pubs; 2,000+ devices; ~30% reduction in energy & water where optimized.",
    duration: { start: 2022, end: null, label: "Pilot 2022; rollout 2023–ongoing" },
    scope: ["Hospitality – CZ & SK"],
    responsible: ["Tomáš Mráz", "Jakub Zaoral", "CIIRC CTU", "Adastra", "Smart Technology", "Microsoft"],
    co2: { annual_t: 120, note: "Estimated from electricity/hot water savings" },
    capex: "€500–800/location; > €1M total (est.)",
    impact: ["Energy efficiency", "Water savings", "Waste reduction"],
    status: ["Ongoing implementation (phase 1 complete)"],
    risks: [
      "Adoption variability",
      "Setup/calibration complexity",
      "Connectivity & data privacy",
    ],
    benefits: [
      "Lower emissions & utility costs",
      "Less beer waste & better quality",
      "Stronger partnerships with venues",
    ],
    tags: ["IoT", "Energy", "Water"],
    type: "Scope 3 – Use of Sold Products",
    category: "Circular Economy & Customer Efficiency",
    geography: ["CZ", "SK"],
  },
  {
    id: "solar",
    name: "Solar Panels at Plzeň & Velké Popovice Breweries (+Radegast, Šariš)",
    description:
      "Photovoltaics across breweries; Plzeň AWH roof 431 kWp (65% of AWH consumption, 259 t CO₂/yr); expansion +400 kWp planned; total network 5,100 panels, ~2,600 MWh/yr by late 2025.",
    duration: { start: 2023, end: 2025, label: "2023–2025 phased" },
    scope: ["Plzeň, Velké Popovice, Radegast (Nošovice), Šariš"],
    responsible: ["Jakub Zaoral", "Pavel Šemík"],
    co2: { annual_t: 1070, note: "Post-expansion late 2025; ~820 t currently" },
    capex: "ČEZ ESCO financed (undisclosed) – paid via electricity purchase",
    impact: ["Energy transition", "Renewable electricity"],
    status: ["Ongoing – expansion 2025"],
    risks: [
      "Weather/seasonal output",
      "Maintenance needs",
      "Roof space limits",
    ],
    benefits: [
      "Lower grid electricity emissions",
      "Long-term energy cost savings",
      "Greater energy self-sufficiency",
    ],
    tags: ["PV", "Renewables"],
    type: "Energy Transition",
    category: "Renewable Energy",
    geography: ["CZ", "SK"],
  },
];

// ----- Helpers -----
const sumCO2 = (items) => items.reduce((a, p) => a + (p.co2.annual_t || 0), 0);
const COLOUR_SCALE = ["#064e3b", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

const EXCLUDED_BAR_ID = "circular-packaging"; // exclude Circular Packaging from bar chart only

const Chip = ({ children, tone = "ok" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone === "warn" ? PRZ.warn : PRZ.chip}`}>{children}</span>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="rounded-xl bg-white p-3 shadow-xl ring-1 ring-emerald-200">
        <div className="text-sm font-semibold text-emerald-800">{label}</div>
        <div className="text-sm text-emerald-700">CO₂ savings: <span className="font-semibold">{p.co2.toLocaleString()} t/yr</span></div>
        {p.note && <div className="mt-1 text-xs text-emerald-700/80">{p.note}</div>}
      </div>
    );
  }
  return null;
};

const ProjectModal = ({ project, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-emerald-900">
          <Leaf className="h-5 w-5" /> {project?.name}
        </DialogTitle>
      </DialogHeader>
      {project && (
        <div className="space-y-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <InfoRow label="Description" value={project.description} />
            <InfoRow label="Duration" value={project.duration.label} icon={<Calendar className="h-4 w-4" />} />
            <InfoRow label="Scope" value={project.scope.join(", ")} icon={<MapPin className="h-4 w-4" />} />
            <InfoRow label="Responsible" value={project.responsible.join(", ")} />
            <InfoRow label="CO₂ savings" value={`${project.co2.annual_t ? project.co2.annual_t.toLocaleString() + " t/yr" : "TBC"}${project.co2.range ? ` (range ${project.co2.range[0]}–${project.co2.range[1]})` : ""}`} />
            {project.co2.note && <InfoRow label="Note" value={project.co2.note} />}
            <InfoRow label="CAPEX" value={project.capex} />
            <InfoRow label="Category" value={project.category} />
          </div>
          <div className="flex flex-wrap gap-2">
            {project.status.map((s, i) => (
              <Badge key={i} className={`${PRZ.bgAlt} ${PRZ.text} border-0`}>{s}</Badge>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-emerald-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>Risks</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="list-disc pl-5 text-emerald-900/90 space-y-1">
                  {project.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>Benefits</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <ul className="list-disc pl-5 text-emerald-900/90 space-y-1">
                  {project.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t, i) => <Chip key={i}>{t}</Chip>)}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

const InfoRow = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-emerald-100 p-3">
    <div className="text-xs uppercase tracking-wide text-emerald-600 flex items-center gap-2">{icon}{label}</div>
    <div className="mt-1 text-sm text-emerald-900">{value}</div>
  </div>
);

const exportCSV = (rows) => {
  const headers = ["Project Name","CO2_t_per_year","Category","Status","Responsible","Scope","Duration","CAPEX","Benefits","Risks","Tags"];
  const csv = [headers.join(",")].concat(
    rows.map(p => [
      `"${p.name}"`,
      p.co2.annual_t ?? "",
      `"${p.category}"`,
      `"${p.status.join("; ")}"`,
      `"${p.responsible.join("; ")}"`,
      `"${p.scope.join("; ")}"`,
      `"${p.duration.label}"`,
      `"${p.capex}"`,
      `"${p.benefits.join("; ")}"`,
      `"${p.risks.join("; ")}"`,
      `"${p.tags.join("; ")}"`,
    ].join(","))
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prazdroj_logistics_projects.csv";
  a.click();
  URL.revokeObjectURL(url);
};

export default function PrazdrojLogisticsDashboard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [geo, setGeo] = useState("all");
  const [status, setStatus] = useState("all");
  const [minCO2, setMinCO2] = useState(0);
  const [range, setRange] = useState([2019, 2030]);
  const [selectedId, setSelectedId] = useState(null);
  const [onlyActive, setOnlyActive] = useState(false);

  const allCategories = useMemo(() => Array.from(new Set(PROJECTS.map(p => p.category))), []);
  const allGeos = useMemo(() => Array.from(new Set(PROJECTS.flatMap(p => p.geography))), []);
  const allStatuses = ["Completed","Ongoing","Planned","Active","Operational"];

  const filtered = useMemo(() => {
    return PROJECTS.filter(p => {
      const matchesQuery = [p.name, p.description, p.tags.join(" "), p.impact.join(" "), p.benefits.join(" "), p.risks.join(" ")]
        .join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      const matchesGeo = geo === "all" || p.geography.includes(geo);
      const matchesStatus = status === "all" || p.status.some(s => s.toLowerCase().includes(status.toLowerCase()));
      const matchesCO2 = (p.co2.annual_t || 0) >= minCO2;
      const start = p.duration.start ?? 2019; const end = p.duration.end ?? 2030;
      const withinRange = start <= range[1] && end >= range[0];
      const activeNow = (p.duration.start ?? 0) <= 2025 && (p.duration.end === null || p.duration.end >= 2025);
      const matchesActive = !onlyActive || activeNow;
      return matchesQuery && matchesCategory && matchesGeo && matchesStatus && matchesCO2 && withinRange && matchesActive;
    });
  }, [query, category, geo, status, minCO2, range, onlyActive]);

  // Bar chart data (exclude Circular Packaging from chart only)
  const chartData = useMemo(() => filtered
    .filter(p => p.id !== "circular-packaging")
    .map((p, i) => ({ name: abbrProjectName(p), co2: p.co2.annual_t || 0, note: p.co2.note, fill: COLOUR_SCALE[i % COLOUR_SCALE.length] })),
    [filtered]
  );

  // Slider max scales to current filtered set (also excluding Circular Packaging)
  const sliderMaxCO2 = useMemo(() => {
    const arr = filtered.filter(p => p.id !== "circular-packaging").map(p => p.co2.annual_t || 0);
    const maxVal = arr.length ? Math.max(...arr) : 1000;
    return Math.ceil(maxVal / 100) * 100; // round up to nearest 100
  }, [filtered]);

  const timelineData = useMemo(() => PROJECTS.map(p => ({ name: p.name, start: p.duration.start ?? 2019, end: p.duration.end ?? 2030, now: 2025 })), []);
  const selected = useMemo(() => PROJECTS.find(p => p.id === selectedId) || null, [selectedId]);

  // Simple runtime tests (console assertions)
  useEffect(() => {
    // 1) Circular Packaging excluded from bar chart
    console.assert(!chartData.some(d => d.name === "Circ. Pack."), "Bar chart should exclude Circular Packaging");
    // 2) Abbreviation test for AWH project
    const awh = PROJECTS.find(p => p.id === "awh-plzen");
    if (awh) console.assert(abbrProjectName(awh) === "AWH", "abbrProjectName('awh-plzen') should be 'AWH'");
    // 3) Slider max sanity
    console.assert(sliderMaxCO2 >= (chartData.reduce((m, d) => Math.max(m, d.co2), 0)), "Slider max should be >= max bar value");
  }, [chartData, sliderMaxCO2]);

  return (
    <div className={`min-h-screen ${PRZ.bg} ${PRZ.text} antialiased`}>
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-emerald-100">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-700/90 grid place-items-center text-white font-bold">PP</div>
              <div>
                <h1 className="text-xl font-semibold text-emerald-900">Prazdroj Logistics Sustainability Dashboard</h1>
                <p className="text-xs text-emerald-700">Projects reducing logistics CO₂ (CZ & SK)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => exportCSV(filtered)} className={`${PRZ.primary} ${PRZ.primaryHover} text-white`}><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="sm:col-span-2">
                <Label className="text-emerald-800">Search project</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, description, tags…" className="focus-visible:ring-emerald-600" />
                  {query && (<Button variant="ghost" onClick={() => setQuery("")}> <XCircle className="h-4 w-4"/> </Button>)}
                </div>
              </div>
              <div>
                <Label className="text-emerald-800">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2 focus:ring-emerald-600"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-emerald-800">Geography</Label>
                <Select value={geo} onValueChange={setGeo}>
                  <SelectTrigger className="mt-2 focus:ring-emerald-600"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {allGeos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-emerald-800">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2 focus:ring-emerald-600"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-emerald-800">Min. CO₂ savings (t/yr)</Label>
                <div className="mt-4">
                  <Slider value={[minCO2]} min={0} max={sliderMaxCO2} step={50} onValueChange={(v) => setMinCO2(v[0])} />
                </div>
                <div className="mt-1 text-xs text-emerald-700">Current: {minCO2.toLocaleString()} t (max {sliderMaxCO2})</div>
              </div>
              <div>
                <Label className="text-emerald-800">Time range</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input type="number" value={range[0]} onChange={(e)=> setRange([Number(e.target.value), range[1]])} className="focus-visible:ring-emerald-600" />
                  <span className="text-emerald-700">–</span>
                  <Input type="number" value={range[1]} onChange={(e)=> setRange([range[0], Number(e.target.value)])} className="focus-visible:ring-emerald-600" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={onlyActive} onCheckedChange={setOnlyActive} id="active" />
                <Label htmlFor="active" className="text-emerald-800">Show only active in 2025</Label>
              </div>
              <Badge className={`${PRZ.bgAlt} ${PRZ.text} border-0`}><Filter className="mr-1 h-3 w-3"/> {filtered.length} projects</Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPI title="Total annual CO₂ savings (filtered)" value={`${sumCO2(filtered).toLocaleString()} t`} icon={<Leaf className="h-5 w-5"/>} />
          <KPI title="Number of projects" value={filtered.length} icon={<Info className="h-5 w-5"/>} />
          <KPI title="Median CO₂ per project" value={`${Math.round(median(filtered.map(p => p.co2.annual_t || 0))).toLocaleString()} t`} icon={<Rocket className="h-5 w-5"/>} />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-900">CO₂ savings by project</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip/>} />
                    <Legend />
                    <Bar dataKey="co2" name="t CO₂/yr">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-900">Breakdown by category</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieByCategory(filtered)} dataKey="value" nameKey="abbr" innerRadius={55} outerRadius={90}>
                      {pieByCategory(filtered).map((e, i) => (
                        <Cell key={i} fill={COLOUR_SCALE[i % COLOUR_SCALE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project list & timeline */}
        <div className="mt-6">
          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2 bg-emerald-100">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="group border-0 shadow-sm transition hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-emerald-900 text-base">
                          <span className="flex items-center gap-2"><ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition"/> {p.name}</span>
                          <Button size="sm" className={`${PRZ.primary} ${PRZ.primaryHover} text-white`} onClick={() => setSelectedId(p.id)}>Details</Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-emerald-800/90 line-clamp-3">{p.description}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Chip>CO₂: {p.co2.annual_t ? `${p.co2.annual_t.toLocaleString()} t/yr` : "TBC"}</Chip>
                          {p.geography.map((g, i) => <Chip key={i}>{g}</Chip>)}
                          <Chip>{p.category}</Chip>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.status.map((s, i) => <Badge key={i} className={`${PRZ.bgAlt} ${PRZ.text} border-0`}>{s}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base text-emerald-900">Project timeline</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="h-80 overflow-x-auto">
                    <div className="min-w-[900px] px-2">
                      <div className="grid grid-cols-[240px_1fr] gap-4">
                        <div></div>
                        <div className="grid grid-cols-12 text-[11px] text-emerald-700">
                          {Array.from({ length: 12 }, (_, i) => 2019 + i).map(year => (
                            <div key={year} className="border-l border-emerald-200 pl-2">{year}</div>
                          ))}
                        </div>
                        {timelineData.map((t, idx) => (
                          <React.Fragment key={idx}>
                            <div className="text-sm text-emerald-900 pr-2">{t.name}</div>
                            <div className="relative h-8">
                              <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-12">
                                {Array.from({ length: 12 }, (_, i) => (
                                  <div key={i} className="border-l border-emerald-100"></div>
                                ))}
                              </div>
                              <div
                                className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-emerald-600/70"
                                style={{ left: `${Math.max(0, (t.start - 2019) * (100 / 12))}%`, width: `${Math.min(100, ((t.end - t.start) / 12) * 100)}%` }}
                              />
                              <div className="absolute inset-y-0" style={{ left: `${(t.now - 2019) * (100 / 12)}%` }}>
                                <div className="h-full w-0.5 bg-emerald-800/60"></div>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-xs text-emerald-700/80">
        Data: internal inputs (2021–2025). Values marked TBC/estimate may be refined.
      </footer>

      <ProjectModal project={selected} open={!!selected} onOpenChange={(v)=> !v && setSelectedId(null)} />
    </div>
  );
}

function KPI({ title, value, icon }){
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wide text-emerald-700">{title}</div>
          <div className="text-2xl font-semibold text-emerald-900">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function median(values){
  if(!values.length) return 0;
  const s=[...values].sort((a,b)=>a-b);
  const mid=Math.floor(s.length/2);
  return s.length%2? s[mid] : (s[mid-1]+s[mid])/2;
}

function abbrProjectName(p){
  const map = new Map([
    ["agv-flt","AGV/FLT"],
    ["awh-plzen","AWH"],
    ["blue-jonder","BY TMS"],
    ["circular-packaging","Circ. Pack."],
    ["drivers-compilation","Eco-Drive"],
    ["ev-trucks","EVs"],
    ["euro6","Euro6"],
    ["mov-czsk","MOV"],
    ["hvo100","HVO (10% CZ PD)"],
    ["light-trailers","Low. Trailers"],
    ["long-xxl","Long+XXL"],
    ["rtm-slovakia","RTM SK"],
    ["pallet-density","Pallet Dens."],
    ["production-sourcing","Prod. Sourcing"],
    ["plan-tour","PlanTour"],
    ["rail-intermodal","Rail/Intermodal"],
    ["smart-tap","Smart Tap"],
    ["solar","Solar PV"],
  ]);
  return map.get(p.id) || p.name;
}

function categoryAbbrev(c){
  const map = new Map([
    ["Warehouse Automation & Electrification","WH Autom. & Elec."],
    ["Logistics & Fleet Optimization","Log & Fleet Opt."],
    ["Fleet Decarbonization","Fleet Decarb."],
    ["Renewable Energy","Renew. Energy"],
    ["Circular Economy & Customer Efficiency","Circ. Econ. & Cust."],
  ]);
  return map.get(c) || c;
}

function pieByCategory(items){
  const m = new Map();
  items.forEach(p => {
    const ab = categoryAbbrev(p.category);
    m.set(ab, (m.get(ab) || 0) + 1);
  });
  return Array.from(m.entries()).map(([abbr, value]) => ({ abbr, value }));
}
