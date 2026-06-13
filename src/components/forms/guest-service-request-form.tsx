"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { submitGuestServiceRequest } from "@/app/actions/guest-service-request-actions";
import {
  guestServiceRequestSchema,
  type GuestServiceRequestInput,
  PROJECT_TYPE_LABELS,
  BUDGET_RANGE_LABELS,
  PREFERRED_CONTACT_LABELS,
} from "@/lib/validations/service-request";

export function GuestServiceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingSerial, setTrackingSerial] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const form = useForm<GuestServiceRequestInput>({
    resolver: zodResolver(guestServiceRequestSchema),
    defaultValues: {
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      title: "",
      description: "",
      dimensions: "",
      constraints: "",
      preferred_contact: "email" as const,
    },
  });

  async function onSubmit(data: GuestServiceRequestInput) {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const result = await submitGuestServiceRequest(data);
      if (result.success && result.trackingSerial) {
        setTrackingSerial(result.trackingSerial);
        setIsSuccess(true);
        form.reset();
      } else {
        setErrorMessage(result.error || "An unexpected error occurred");
      }
    } catch (error) {
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCopySerial = async () => {
    if (trackingSerial) {
      await navigator.clipboard.writeText(trackingSerial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isSuccess && trackingSerial) {
    const trackingUrl = `${window.location.origin}/track/${trackingSerial}`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="border-2 border-[#D4A853] bg-black p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#D4A853]/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#D4A853]" />
            </div>
          </div>
          
          <h3 className="text-3xl font-semibold mb-4 text-white" style={{ fontFamily: "Syne, sans-serif" }}>
            Request Submitted Successfully
          </h3>
          
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Thank you for your request. We've sent a confirmation email with your tracking number.
          </p>

          {/* Tracking Serial Display */}
          <div className="bg-[#1A1A1A] border-2 border-[#D4A853] p-6 rounded mb-6">
            <p className="text-sm font-medium tracking-[0.15em] text-[#C8B89A] uppercase mb-3">
              Your Tracking Number
            </p>
            <div className="flex items-center justify-center gap-3">
              <p
                className="text-3xl font-bold tracking-[0.25em] text-[#D4A853]"
                style={{ fontFamily: "Courier New, monospace" }}
              >
                {trackingSerial}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySerial}
                className="text-[#C8B89A] hover:text-white hover:bg-[#1A1A1A]"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Save this number to track your request anytime
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              asChild
              className="bg-black text-white border border-[#C8B89A] hover:bg-[#C8B89A] hover:text-black transition-all"
            >
              <Link href={trackingUrl}>
                View Tracking Page
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded text-left">
            <p className="text-sm text-gray-300 mb-2">
              <strong className="text-white">What's next?</strong>
            </p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Check your email for confirmation and tracking link</li>
              <li>Our team will review your request within 24-48 hours</li>
              <li>Track progress anytime using your tracking number</li>
              <li>Create an account for full dashboard access</li>
            </ul>
          </div>

          <Button
            variant="ghost"
            className="mt-6 text-[#C8B89A] hover:text-white hover:bg-[#1A1A1A]"
            onClick={() => {
              setIsSuccess(false);
              setTrackingSerial("");
            }}
          >
            Submit Another Request
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-lg bg-[#1A1A1A] border border-[#333333]"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-wide text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
          Start Your Project
        </h2>
        <p className="text-gray-400">
          Tell us about your vision. We'll create a dedicated space to bring it to life.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-[#333333] pb-2">
              Your Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guest_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="guest_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guest_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-[#333333] pb-2">
              Project Details
            </h3>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Project Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Modern Living Room Renovation"
                      className="bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Project Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your vision, desired style, atmosphere, and any specific requirements..."
                      className="min-h-[120px] bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Minimum 20 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-[#333333] text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-[#333333] text-white">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BUDGET_RANGE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Approximate Dimensions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1200 sq ft"
                        className="bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Preferred Contact Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-[#333333] text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PREFERRED_CONTACT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Special Constraints or Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Load-bearing walls, tight budget, specific timeline..."
                      className="min-h-[80px] bg-black border-[#333333] text-white focus-visible:ring-[#C8B89A] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {errorMessage && (
            <div className="p-4 rounded bg-red-950/30 border border-red-800 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white border border-[#C8B89A] hover:bg-[#C8B89A] hover:text-black transition-all text-sm font-semibold tracking-wider uppercase"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to receive updates about your project via email.
          </p>
        </form>
      </Form>
    </motion.div>
  );
}

// Made with Bob
