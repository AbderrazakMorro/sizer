import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TrackingNotFound() {
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
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-2 border-red-800 bg-red-950/30 p-8 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-400" />
          </div>
          <h1 className="text-3xl font-semibold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Tracking Number Not Found
          </h1>
          <p className="text-gray-300 mb-6">
            We couldn't find a service request with this tracking number. Please check the number and try again.
          </p>
          <div className="bg-black border border-[#333333] p-4 rounded mb-6">
            <p className="text-sm text-gray-400 mb-2">Tracking numbers follow this format:</p>
            <p className="text-[#D4A853] font-mono text-lg font-bold tracking-wider">
              SIZER-XXXXXX
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-black text-white border border-[#C8B89A] hover:bg-[#C8B89A] hover:text-black transition-all"
            >
              <Link href="/">Go to Homepage</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-[#C8B89A] hover:text-white hover:bg-[#1A1A1A]"
            >
              <Link href="/contact">Contact Support</Link>
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
    </div>
  );
}

// Made with Bob
