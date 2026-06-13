"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import type { ServiceRequestTracking } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TrackingPageClientProps {
  data: ServiceRequestTracking;
}

const statusConfig = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-950/30",
    borderColor: "border-blue-800",
    description: "Your request has been received and is awaiting review.",
  },
  pending_approval: {
    label: "Pending Approval",
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-950/30",
    borderColor: "border-orange-800",
    description: "Your request is pending admin approval.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-800",
    description: "Your request has been approved and will be assigned soon.",
  },
  assigned: {
    label: "Assigned",
    icon: Clock,
    color: "text-cyan-400",
    bgColor: "bg-cyan-950/30",
    borderColor: "border-cyan-800",
    description: "Your request has been assigned to our team.",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-800",
    description: "Your request has been rejected.",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-950/30",
    borderColor: "border-yellow-800",
    description: "Our team is actively working on your request.",
  },
  review: {
    label: "Under Review",
    icon: AlertCircle,
    color: "text-purple-400",
    bgColor: "bg-purple-950/30",
    borderColor: "border-purple-800",
    description: "Your request is being reviewed by our specialists.",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-950/30",
    borderColor: "border-green-800",
    description: "Your request has been completed successfully.",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-800",
    description: "This request has been cancelled.",
  },
  draft: {
    label: "Draft",
    icon: Clock,
    color: "text-gray-400",
    bgColor: "bg-gray-950/30",
    borderColor: "border-gray-800",
    description: "This request is in draft status.",
  },
};

export function TrackingPageClient({ data }: TrackingPageClientProps) {
  const [copied, setCopied] = useState(false);
  const config = statusConfig[data.status];
  const StatusIcon = config.icon;

  const handleCopySerial = async () => {
    await navigator.clipboard.writeText(data.tracking_serial);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#1A1A1A]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-2xl font-light tracking-[0.25em] text-white hover:text-[#C8B89A] transition-colors"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            S I Z E R
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Tracking Serial Display */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-[0.15em] text-[#C8B89A] uppercase mb-4">
            Tracking Number
          </p>
          <div className="inline-flex items-center gap-4">
            <h1
              className="text-4xl md:text-5xl font-bold tracking-[0.25em] text-[#D4A853]"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {data.tracking_serial}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySerial}
              className="text-[#C8B89A] hover:text-white hover:bg-[#1A1A1A]"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {data.masked_email && (
            <p className="text-sm text-gray-400 mt-2">
              Submitted by: {data.masked_email}
            </p>
          )}
        </div>

        {/* Status Card */}
        <Card className={`border-2 ${config.borderColor} ${config.bgColor} p-8 mb-8`}>
          <div className="flex items-start gap-6">
            <div className={`${config.color} mt-1`}>
              <StatusIcon className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
                {config.label}
              </h2>
              <p className="text-gray-300 mb-4">{config.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Submitted</p>
                  <p className="text-white font-medium">
                    {format(new Date(data.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Last Updated</p>
                  <p className="text-white font-medium">
                    {format(new Date(data.updated_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Details */}
        <Card className="border border-[#333333] bg-[#1A1A1A] p-8 mb-8">
          <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Project Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Title</p>
              <p className="text-white text-lg">{data.title}</p>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="border border-[#333333] bg-[#1A1A1A] p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
            Status Timeline
          </h3>
          <div className="space-y-4">
            {/* Submitted */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4A853] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 pb-4 border-b border-[#333333]">
                <p className="font-medium text-white">Request Submitted</p>
                <p className="text-sm text-gray-400">
                  {format(new Date(data.created_at), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Current Status */}
            {data.status !== "submitted" && (
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{config.label}</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(data.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="border-2 border-[#D4A853] bg-black p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Want Full Access?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Create a Sizer account to unlock advanced features, collaborate with our team in real-time,
            and manage all your projects from a unified dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-black text-white border border-[#C8B89A] hover:bg-[#C8B89A] hover:text-black transition-all"
            >
              <Link href={`/sign-up?tracking=${data.tracking_serial}`}>
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-[#C8B89A] hover:text-white hover:bg-[#1A1A1A]"
            >
              <Link href="/sign-in">
                Already have an account? Sign in
              </Link>
            </Button>
          </div>
        </Card>

        {/* Help Section */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:hey@veta.pro" className="text-[#D4A853] hover:underline">
              hey@veta.pro
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] bg-[#1A1A1A] mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
