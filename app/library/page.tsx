"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Layers,
  Library,
  Link2,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
} from "lucide-react";
import { useLibrarySources, useParagraphs } from "@/lib/hooks";
import { getCurrentProjectId } from "@/lib/project";
import { ProjectPicker } from "@/components/project-picker";
import type { LibrarySource } from "@/lib/api";

const PROJECT_ID = getCurrentProjectId();

export default function ResearchLibraryPage() {
  const { data: sources, isLoading, error } = useLibrarySources(PROJECT_ID);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<LibrarySource | null>(null);

  const filteredSources = (sources || []).filter((src) => {
    const matchesSearch =
      src.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (src.author && src.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (src.doi && src.doi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (src.pmcid && src.pmcid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (src.abstract && src.abstract.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || src.source_type === typeFilter;
    const matchesLicense =
      licenseFilter === "all" ||
      (licenseFilter === "cc-by" && src.license_status.toLowerCase().includes("cc-by")) ||
      (licenseFilter === "demo" && src.license_status.toLowerCase().includes("demo"));

    return matchesSearch && matchesType && matchesLicense;
  });

  const totalSources = sources?.length || 0;
  const ccByCount = sources?.filter((s) => s.license_status.toLowerCase().includes("cc-by")).length || 0;
  const totalParagraphs = sources?.reduce((acc, s) => acc + s.paragraph_count, 0) || 0;
  const totalAnnotations = sources?.reduce((acc, s) => acc + s.annotation_count, 0) || 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Research Library & Citation Hub</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Tamper-Evident Provenance
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Open-access qualitative testimonies, clinical case studies, and cited provenance trails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ProjectPicker />
            <Link
              href="/reader"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ingest New Testimony
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Cataloged Sources</span>
              <BookOpen className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalSources}</div>
            <div className="text-[11px] text-slate-500 mt-1">Peer-reviewed & synthetic testimonies</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Open-Access (CC-BY)</span>
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{ccByCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">100% verified for research reuse</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Segmented Paragraphs</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalParagraphs}</div>
            <div className="text-[11px] text-slate-500 mt-1">Ready for character offset annotation</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Approved Annotations</span>
              <UserCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalAnnotations}</div>
            <div className="text-[11px] text-slate-500 mt-1">Human-in-the-loop decisions</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, DOI (10.1002/...), PMCID (PMC...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="qualitative_testimony">Qualitative Testimony</option>
                <option value="clinical_case">Clinical Case Series</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>License:</span>
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Licenses</option>
                <option value="cc-by">CC-BY Verified</option>
                <option value="demo">Demo Corpus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sources Grid */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Loading research library & citations...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 text-xs">
            Failed to load library sources. Ensure FastAPI backend is running on port 8000.
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Library className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No sources found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSources.map((src) => (
              <div
                key={src.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-teal-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6 group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200/60">
                      <Tag className="w-3 h-3 mr-1 text-teal-600" />
                      {src.source_type === "clinical_case" ? "Clinical Case Series" : "Qualitative Testimony"}
                    </span>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        src.license_status.toLowerCase().includes("cc-by")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {src.license_status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-snug mb-2">
                    {src.title}
                  </h3>

                  {/* Authors & Publication */}
                  <div className="text-xs text-slate-600 mb-3 space-y-1">
                    {src.author && <p className="font-medium text-slate-700">Author(s): {src.author}</p>}
                    {src.publication && (
                      <p className="text-slate-500 italic">
                        {src.publication} {src.publication_year ? `(${src.publication_year})` : ""}
                      </p>
                    )}
                  </div>

                  {/* DOI & PMCID Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {src.doi && (
                      <a
                        href={`https://doi.org/${src.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                      >
                        <Link2 className="w-3 h-3 text-slate-500" />
                        DOI: {src.doi}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-slate-400" />
                      </a>
                    )}
                    {src.pmcid && (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${src.pmcid}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
                      >
                        <Globe className="w-3 h-3 text-indigo-500" />
                        PMC: {src.pmcid}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-indigo-400" />
                      </a>
                    )}
                  </div>

                  {/* Abstract / Notes */}
                  {src.abstract && (
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 line-clamp-3 leading-relaxed">
                      {src.abstract}
                    </p>
                  )}
                </div>

                {/* Card Footer: Metrics & Actions */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-slate-800">{src.paragraph_count}</strong> paragraphs
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-800">{src.annotation_count}</strong> annotations
                      </span>
                    </div>

                    {src.provenance_hash && (
                      <span
                        title={`Chained SHA-256: ${src.provenance_hash}`}
                        className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px]"
                      >
                        #{src.provenance_hash.slice(0, 8)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/?source=${src.id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      Annotate
                    </Link>

                    <Link
                      href={`/reader?source=${src.id}`}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-xs font-medium transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                      Reader
                    </Link>

                    <button
                      onClick={() => setSelectedSource(src)}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Provenance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Provenance Trail Modal */}
      {selectedSource && (
        <ProvenanceModal source={selectedSource} onClose={() => setSelectedSource(null)} />
      )}
    </div>
  );
}

function ProvenanceModal({ source, onClose }: { source: LibrarySource; onClose: () => void }) {
  const { data: paragraphs } = useParagraphs(source.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Provenance & Citation Audit Trail</h2>
              <p className="text-[11px] text-slate-500 font-mono">ID: {source.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Source Citation Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Source Metadata</h3>
            <p className="text-sm font-bold text-slate-900">{source.title}</p>
            <p className="text-xs text-slate-600">
              {source.author} • {source.publication} ({source.publication_year || "N/A"})
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                License: {source.license_status}
              </span>
              {source.pmcid && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-100 text-indigo-800">
                  PMCID: {source.pmcid}
                </span>
              )}
              {source.doi && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200 text-slate-800">
                  DOI: {source.doi}
                </span>
              )}
            </div>
          </div>

          {/* Audit Chain Sequence */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Audit Provenance Flow
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6.5 h-6.5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  1
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 text-xs">
                  <div className="font-semibold text-slate-900 mb-1">Source Ingestion & Paragraph Segmentation</div>
                  <p className="text-slate-600 text-[11px]">
                    Ingested into ANNI with {source.paragraph_count} indexed paragraphs.
                  </p>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">Content Hash: {source.provenance_hash || "n/a"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6.5 h-6.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  2
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 text-xs">
                  <div className="font-semibold text-slate-900 mb-1">Human Annotation & Read Confirmation</div>
                  <p className="text-slate-600 text-[11px]">
                    {source.annotation_count} annotations linked with exact character offsets & mandatory reviewer read confirmations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6.5 h-6.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  3
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 text-xs">
                  <div className="font-semibold text-slate-900 mb-1">Synthetic Patient Prompt Compilation</div>
                  <p className="text-slate-600 text-[11px]">
                    Approved annotations compile into constrained system prompts with embed provenance footers for Ollama roleplay in the Lab.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Paragraph Text */}
          {paragraphs && paragraphs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Raw Ingested Text</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed">
                {paragraphs.map((p) => (
                  <p key={p.id}>
                    <span className="text-teal-400 font-bold mr-2">[{p.order_index}]</span>
                    {p.text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          >
            Close Provenance Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
