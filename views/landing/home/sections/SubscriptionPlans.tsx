"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { getSubscriptionPlans, SubscriptionPlan } from "@/services/subscription";

export const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await getSubscriptionPlans();
        setPlans(fetchedPlans);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        // Default plans will be returned by the service
        const defaultPlans = await getSubscriptionPlans();
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-neutral-600">
              Select the perfect plan for your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-8 bg-neutral-100 rounded-xl animate-pulse"
              >
                <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                <div className="h-12 bg-neutral-200 rounded mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Flexible Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Select the perfect plan for your business needs. All plans include
            our AI-powered storefront builder.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id || index}
              className={`relative p-8 rounded-xl border-2 transition-all ${
                plan.popular || plan.name.toLowerCase() === "gold"
                  ? "border-blue-500 bg-blue-600 shadow-xl scale-105"
                  : "border-neutral-200 bg-white hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.popular || plan.name.toLowerCase() === "gold"
                    ? "text-white"
                    : "text-neutral-900"
                }`}>
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className={`text-sm ${
                    plan.popular || plan.name.toLowerCase() === "gold"
                      ? "text-white/90"
                      : "text-neutral-600"
                  }`}>{plan.description}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${
                    plan.popular || plan.name.toLowerCase() === "gold"
                      ? "text-white"
                      : "text-neutral-900"
                  }`}>
                    £{plan.price}
                  </span>
                  <span className={
                    plan.popular || plan.name.toLowerCase() === "gold"
                      ? "text-white/80"
                      : "text-neutral-600"
                  }>
                    /{plan.interval || "month"}
                  </span>
                </div>
              </div>

              <div className="mb-8 space-y-4">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckCircleIcon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular || plan.name.toLowerCase() === "gold"
                            ? "text-white"
                            : "text-blue-600"
                        }`}
                      />
                      <span className={
                        plan.popular || plan.name.toLowerCase() === "gold"
                          ? "text-white/90"
                          : "text-neutral-700"
                      }>{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className={
                    plan.popular || plan.name.toLowerCase() === "gold"
                      ? "text-white/70 text-sm"
                      : "text-neutral-500 text-sm"
                  }>No features listed</p>
                )}
              </div>

              <Button
                onPress={() => {
                  // Handle plan selection
                  console.log("Selected plan:", plan);
                }}
                color="primary"
                variant={plan.popular || plan.name.toLowerCase() === "gold" ? "solid" : "bordered"}
                className={`w-full py-3 font-semibold ${
                  plan.popular || plan.name.toLowerCase() === "gold"
                    ? "text-blue-600 bg-white hover:bg-blue-50"
                    : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-neutral-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};
