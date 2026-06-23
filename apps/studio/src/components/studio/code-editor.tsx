"use client";

import { Code } from "lucide-react";

// P0: mock code display — static placeholder
const MOCK_CODE = `"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const TIERS = [
  { name: "Free", price: "$0", features: ["5 projects", "Basic support"] },
  { name: "Pro", price: "$10/mo", features: ["Unlimited projects", "Priority support", "Analytics"], highlight: true },
  { name: "Enterprise", price: "$30/mo", features: ["SSO", "Custom integrations", "SLA", "Dedicated manager"] },
];

export default function PricingPage() {
  return (
    <section className="container mx-auto py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Simple Pricing</h2>
        <p className="text-muted-foreground mt-2">Choose the plan that fits you</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card key={tier.name} className={tier.highlight ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <Badge variant="secondary">{tier.price}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={tier.highlight ? "default" : "outline"}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}`;

export function CodeEditor() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <Code className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Editor</span>
        <span className="ml-auto text-xs text-zinc-600">page.tsx</span>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-950 p-4">
        <pre className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre">
          <code>{MOCK_CODE}</code>
        </pre>
      </div>
    </div>
  );
}
