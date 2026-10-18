"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Cpu, Database, Webhook, Zap } from "lucide-react";

interface PipelineNode {
  id: string;
  code: string;
  title: string;
  type: string;
  latency: string;
  status: "idle" | "running" | "success";
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Devyx Signature Component: Automation Pipeline Visualizer
 * Strictly adheres to Design.md Section 5C:
 * - Rectangular node blocks with 1px border and elevated background
 * - Dual-ribbon connector paths (two parallel 2px SVG strokes separated by 4px)
 * - Animated stroke-dashoffset pulse traveling in var(--accent-signal) (#00E0FF)
 */
export function AutomationPipelineVisualizer() {
  const [activeNodeIndex, setActiveNodeIndex] = React.useState<number>(0);

  const nodes: PipelineNode[] = [
    {
      id: "webhook",
      code: "TRG_01",
      title: "Webhook Ingest",
      type: "Event Trigger",
      latency: "12ms",
      status: "success",
      icon: Webhook,
    },
    {
      id: "transform",
      code: "EXE_02",
      title: "Data Normalize & Hash",
      type: "Edge Worker",
      latency: "18ms",
      status: "success",
      icon: Cpu,
    },
    {
      id: "postgres",
      code: "STO_03",
      title: "Supabase RLS & Rate Limit",
      type: "Atomic DB RPC",
      latency: "24ms",
      status: "running",
      icon: Database,
    },
    {
      id: "dispatch",
      code: "ACT_04",
      title: "n8n AI Dispatcher",
      type: "Agentic Output",
      latency: "32ms",
      status: "idle",
      icon: Zap,
    },
  ];

  // Auto-cycle active node to demonstrate live workflow execution
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % nodes.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [nodes.length]);

  return (
    <div className="w-full bg-bg-surface border border-border-grid p-4 sm:p-6 select-none">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-border-grid pb-3 mb-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-accent-signal">
          <span className="w-2 h-2 rounded-none bg-accent-signal inline-block animate-pulse-signal" />
          <span className="font-bold tracking-wider uppercase">
            LIVE_PIPELINE // RUNTIME_MONITOR
          </span>
        </div>
        <div className="text-text-muted text-[11px] hidden sm:block">
          FLOW_ID: #DVX-9042 // STATUS: DETERMINISTIC
        </div>
      </div>

      {/* Pipeline Node Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isActive = index === activeNodeIndex;
          const isPassed = index < activeNodeIndex;

          return (
            <div key={node.id} className="relative flex flex-col">
              {/* Connector between nodes (desktop dual-ribbon) */}
              {index < nodes.length - 1 && (
                <div
                  className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-4 z-10 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full"
                  >
                    {/* Top parallel 2px stroke */}
                    <line
                      x1="0"
                      y1="3"
                      x2="16"
                      y2="3"
                      stroke={isActive ? "var(--accent-signal)" : "var(--border-grid)"}
                      strokeWidth="2"
                      strokeDasharray={isActive ? "4 2" : "none"}
                      className={isActive ? "animate-pulse" : ""}
                    />
                    {/* Bottom parallel 2px stroke separated by 4px gap */}
                    <line
                      x1="0"
                      y1="9"
                      x2="16"
                      y2="9"
                      stroke={isActive ? "var(--accent-primary)" : "var(--border-grid)"}
                      strokeWidth="2"
                      strokeDasharray={isActive ? "4 2" : "none"}
                      className={isActive ? "animate-pulse" : ""}
                    />
                  </svg>
                </div>
              )}

              {/* Node Card */}
              <div
                onClick={() => setActiveNodeIndex(index)}
                className={`p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${
                  isActive
                    ? "bg-bg-elevated border-accent-signal shadow-[0_0_15px_rgba(0,224,255,0.08)]"
                    : "bg-bg-elevated/40 border-border-grid hover:border-text-muted"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-text-muted mb-2">
                  <span className="font-bold text-text-secondary uppercase">
                    {node.code}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 border text-[9px] uppercase font-semibold ${
                      isActive
                        ? "border-accent-signal text-accent-signal bg-bg-surface"
                        : "border-border-grid text-text-muted"
                    }`}
                  >
                    {node.latency}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 my-2">
                  <div
                    className={`w-7 h-7 flex items-center justify-center border flex-shrink-0 ${
                      isActive
                        ? "border-accent-signal bg-accent-signal/10 text-accent-signal"
                        : "border-border-grid bg-bg-surface text-text-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-start min-w-0">
                    <h4 className="font-mono text-xs font-bold text-text-primary truncate">
                      {node.title}
                    </h4>
                    <p className="font-mono text-[10px] text-text-muted uppercase truncate">
                      {node.type}
                    </p>
                  </div>
                </div>

                {/* Node Status Footer */}
                <div className="pt-2 mt-2 border-t border-border-grid/60 flex items-center justify-between font-mono text-[9px]">
                  <span className="text-text-muted">STATE:</span>
                  <span
                    className={`font-bold uppercase ${
                      isActive
                        ? "text-accent-signal animate-pulse"
                        : isPassed
                        ? "text-status-operational"
                        : "text-text-muted"
                    }`}
                  >
                    {isActive ? "ACTIVE_PULSE" : isPassed ? "RESOLVED" : "QUEUED"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Telemetry Snapshot */}
      <div className="mt-4 pt-3 border-t border-border-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[10px] text-text-muted">
        <div className="flex items-center gap-3">
          <span>PARALLEL_RIBBON: DUAL_STROKE (4px GAP)</span>
          <span>//</span>
          <span>THROUGHPUT: 1,420 MSG/SEC</span>
        </div>
        <div className="text-accent-primary font-semibold">
          [ DETERMINISTIC_EXECUTION: VERIFIED ]
        </div>
      </div>
    </div>
  );
}
