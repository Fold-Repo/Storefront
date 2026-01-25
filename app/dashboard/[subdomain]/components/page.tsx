"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { getAllDummyTemplates, DummyTemplate } from "@/lib/dummyDataTemplates";
import { Button } from "@/components/ui";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function DynamicComponentsConfigPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const subdomain = params?.subdomain as string;
  
  const [templates, setTemplates] = useState<DummyTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("Your Store");

  useEffect(() => {
    if (subdomain) {
      // Load company name from storefront data
      // For now, use subdomain as fallback
      setCompanyName(subdomain.charAt(0).toUpperCase() + subdomain.slice(1));
    }
    
    // Load all templates
    const allTemplates = getAllDummyTemplates(companyName);
    setTemplates(allTemplates);
  }, [subdomain, companyName]);

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DummyTemplate[]>);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleApplyTemplate = async () => {
    if (!selectedType || !selectedTemplate) {
      showError("Please select a component type and template");
      return;
    }

    setLoading(true);
    try {
      // TODO: Save template selection to Firebase/backend
      // This would update the storefront's dynamic component configuration
      
      showSuccess(`Template applied successfully! The ${selectedType} component will be updated.`);
      
      // Redirect back to editor after a short delay
      setTimeout(() => {
        router.push(`/dashboard/${subdomain}/editor`);
      }, 1500);
    } catch (error: any) {
      console.error("Error applying template:", error);
      showError("Failed to apply template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeTemplates = selectedType 
    ? templates.filter(t => t.id === selectedType || t.category === selectedType)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/${subdomain}/editor`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dynamic Components Config</h1>
                <p className="text-sm text-gray-500">Customize menu, footer, and other dynamic components</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Component Types */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Types</h2>
              <div className="space-y-2">
                {Object.keys(templatesByCategory).map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {category}
                    </h3>
                    {templatesByCategory[category].map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedType(template.id);
                          setSelectedTemplate(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedType === template.id
                            ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent"
                        }`}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Template Selection */}
          <div className="lg:col-span-2">
            {!selectedType ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Component Type
                </h3>
                <p className="text-gray-500">
                  Choose a component type from the sidebar to view available design templates
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {templates.find(t => t.id === selectedType)?.name || "Component"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {templates.find(t => t.id === selectedType)?.description}
                  </p>
                </div>

                {/* Template Options */}
                <div className="space-y-4">
                  {/* Default Template */}
                  <div
                    onClick={() => handleSelectTemplate("default")}
                    className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all border-2 ${
                      selectedTemplate === "default"
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Default Design</h3>
                          {selectedTemplate === "default" && (
                            <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          The current default design for this component
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div
                        className="preview-container"
                        dangerouslySetInnerHTML={{
                          __html: templates.find(t => t.id === selectedType)?.html || "",
                        }}
                      />
                    </div>
                  </div>

                  {/* Additional template designs can be added here */}
                  <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">More Designs Coming Soon</h3>
                    <p className="text-sm text-gray-500">
                      Additional design templates will be available here
                    </p>
                  </div>
                </div>

                {/* Apply Button */}
                {selectedTemplate && (
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky bottom-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Selected Template</p>
                        <p className="font-semibold text-gray-900">
                          {selectedTemplate === "default" ? "Default Design" : "Custom Design"}
                        </p>
                      </div>
                      <Button
                        onClick={handleApplyTemplate}
                        isDisabled={loading}
                        className="px-6"
                      >
                        {loading ? "Applying..." : "Apply Template"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .preview-container {
          pointer-events: none;
        }
        .preview-container * {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
