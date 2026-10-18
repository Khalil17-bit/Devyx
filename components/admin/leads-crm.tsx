"use client";

import * as React from "react";
import { updateLeadStatus } from "@/actions/admin-cms";
import { formatDateSafe, formatDateTimeSafe } from "@/lib/utils/format-date";
import {
  Inbox,
  Search,
  Download,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Shield,
} from "lucide-react";
import type { Database } from "@/types/database.types";

type LeadItem = Database["public"]["Tables"]["leads"]["Row"];

interface LeadsCrmProps {
  initialLeads: LeadItem[];
}

const STATUS_OPTIONS: Array<LeadItem["status"]> = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "spam",
];

export function LeadsCrm({ initialLeads }: LeadsCrmProps) {
  const [leads, setLeads] = React.useState<LeadItem[]>(initialLeads);
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLead, setSelectedLead] = React.useState<LeadItem | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);

  // Sync admin notes when selecting a lead
  React.useEffect(() => {
    if (selectedLead) {
      setAdminNotes(selectedLead.admin_notes || "");
    }
  }, [selectedLead]);

  // Filtering
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus =
        activeFilter === "all" ? true : lead.status === activeFilter;
      const matchesSearch =
        searchQuery === ""
          ? true
          : lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.state_province.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [leads, activeFilter, searchQuery]);

  async function handleStatusChange(
    leadId: string,
    newStatus: LeadItem["status"]
  ) {
    setIsUpdating(true);
    const result = await updateLeadStatus(leadId, newStatus, adminNotes);
    setIsUpdating(false);

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      setNotification(`Lead status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setNotification(null), 3000);
    }
  }

  async function handleSaveNotes() {
    if (!selectedLead) return;
    setIsUpdating(true);
    const result = await updateLeadStatus(selectedLead.id, selectedLead.status, adminNotes);
    setIsUpdating(false);

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id ? { ...l, admin_notes: adminNotes } : l
        )
      );
      setSelectedLead({ ...selectedLead, admin_notes: adminNotes });
      setNotification("Admin notes recorded!");
      setTimeout(() => setNotification(null), 3000);
    }
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Full Name",
      "Phone",
      "State/Province",
      "Service Requested",
      "Status",
      "Locale",
      "Created At",
      "Admin Notes",
      "Message",
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.full_name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.state_province.replace(/"/g, '""')}"`,
      `"${l.service_type}"`,
      l.status,
      l.locale,
      l.created_at,
      `"${(l.admin_notes || "").replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devyx_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Count by status
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    leads.forEach((l) => {
      c[l.status] = (c[l.status] || 0) + 1;
    });
    return c;
  }, [leads]);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-b border-border-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block mb-1">
            // LEAD_INGEST_CRM
          </span>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Consultation Inquiries &amp; Pipeline
          </h1>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="btn-primary clip-chamfer h-11 px-5 bg-accent-primary text-bg-primary font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-status-operational/10 border border-status-operational text-status-operational font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                : "border-border-grid text-text-muted hover:text-text-primary"
            }`}
          >
            <span>ALL</span>
            <span className="text-[10px] opacity-80">({counts.all || 0})</span>
          </button>

          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 border transition-colors uppercase flex items-center gap-1.5 ${
                activeFilter === status
                  ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                  : "border-border-grid text-text-muted hover:text-text-primary"
              }`}
            >
              <span>{status}</span>
              <span className="text-[10px] opacity-80">({counts[status] || 0})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full h-9 ps-9 pe-3 bg-bg-surface border border-border-grid text-text-primary text-xs focus:border-accent-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-bg-surface border border-border-grid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start font-mono text-xs">
            <thead>
              <tr className="border-b border-border-grid bg-bg-elevated text-text-muted text-[10px] uppercase text-start">
                <th className="py-3 px-4 text-start">Name</th>
                <th className="py-3 px-4 text-start">Phone</th>
                <th className="py-3 px-4 text-start">Province / State</th>
                <th className="py-3 px-4 text-start">Service</th>
                <th className="py-3 px-4 text-start">Status</th>
                <th className="py-3 px-4 text-start">Received</th>
                <th className="py-3 px-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grid">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-bg-elevated transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-text-primary">
                    {lead.full_name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {lead.phone}
                  </td>
                  <td className="py-3 px-4 text-text-muted">
                    {lead.state_province}
                  </td>
                  <td className="py-3 px-4 text-text-muted uppercase text-[11px]">
                    {lead.service_type}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                        lead.status === "new"
                          ? "bg-status-warning/10 text-status-warning border border-status-warning/30"
                          : lead.status === "qualified"
                          ? "bg-status-operational/10 text-status-operational border border-status-operational/30"
                          : "bg-border-grid text-text-muted"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-[10px]" suppressHydrationWarning>
                    {formatDateSafe(lead.created_at)}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      className="text-accent-primary hover:underline font-bold text-[11px]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail & Follow-up Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-bg-surface border border-border-grid clip-chamfer shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-bg-elevated border-b border-border-grid flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-accent-signal uppercase tracking-technical block">
                  // LEAD_DETAIL_INSPECT
                </span>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  {selectedLead.full_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs select-text">
              {/* Telemetry info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-bg-elevated border border-border-grid">
                <div>
                  <span className="text-text-muted text-[10px] block">SERVICE:</span>
                  <span className="font-bold text-text-primary uppercase">{selectedLead.service_type}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] block">PROVINCE:</span>
                  <span className="font-bold text-text-primary">{selectedLead.state_province}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] block">LOCALE:</span>
                  <span className="font-bold text-text-primary uppercase">{selectedLead.locale}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] block">PHONE:</span>
                  <span className="font-bold text-accent-primary">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] block">TIMESTAMP:</span>
                  <span className="text-text-primary" suppressHydrationWarning>{formatDateTimeSafe(selectedLead.created_at)}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] block">IP HASH:</span>
                  <span className="text-text-muted text-[9px] truncate block">{selectedLead.ip_hash}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-text-muted uppercase text-[10px] block font-bold">
                  Pipeline Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedLead.id, st)}
                      className={`px-3 py-1.5 border uppercase text-xs transition-colors ${
                        selectedLead.status === st
                          ? "bg-accent-primary text-bg-primary font-bold border-accent-primary"
                          : "border-border-grid text-text-muted hover:text-text-primary bg-bg-elevated"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Payload */}
              <div className="space-y-1.5">
                <label className="text-text-muted uppercase text-[10px] block font-bold">
                  Project Requirements &amp; Scope
                </label>
                <div className="p-4 bg-bg-elevated border border-border-grid text-text-primary whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {selectedLead.message}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-text-muted uppercase text-[10px] block font-bold">
                    Internal Engineering Notes
                  </label>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleSaveNotes}
                    className="text-[10px] text-accent-primary hover:underline font-bold"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record internal assessment, budget qualification, or next steps..."
                  className="w-full p-3 bg-bg-elevated border border-border-grid text-text-primary font-mono text-xs resize-none"
                />
              </div>

              {/* Instant Priority Follow-Up Actions */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${selectedLead.full_name}, thank you for inquiring about "${selectedLead.service_type}" with Devyx. We have reviewed your project requirements and would like to schedule a technical discovery call.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 h-11 bg-status-operational text-white font-mono text-xs font-semibold uppercase tracking-wider clip-chamfer hover:bg-status-operational/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>1-Click WhatsApp Follow-up</span>
                </a>

                <a
                  href={`tel:${selectedLead.phone}`}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 bg-bg-elevated border border-border-grid text-text-primary font-mono text-xs font-semibold uppercase tracking-wider hover:border-accent-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent-primary" />
                  <span>Direct Telephone Call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
