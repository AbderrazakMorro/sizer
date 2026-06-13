import { notFound } from "next/navigation";
import { getServiceRequestBySerial } from "@/app/actions/guest-service-request-actions";
import { TrackingPageClient } from "@/app/track/[serial]/tracking-page-client";

interface PageProps {
  params: Promise<{
    serial: string;
  }>;
}

/**
 * Public tracking page for service requests
 * Accessible without authentication using tracking serial
 */
export default async function TrackingPage({ params }: PageProps) {
  const { serial } = await params;

  // Validate and fetch service request
  const result = await getServiceRequestBySerial({
    tracking_serial: serial.toUpperCase(),
  });

  if (!result.success || !result.data) {
    notFound();
  }

  return <TrackingPageClient data={result.data} />;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { serial } = await params;

  return {
    title: `Track Request ${serial.toUpperCase()} - Sizer`,
    description: "Track the status of your service request",
    robots: "noindex, nofollow", // Don't index tracking pages
  };
}

// Made with Bob
