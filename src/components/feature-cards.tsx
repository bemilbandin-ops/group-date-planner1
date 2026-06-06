import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="surface border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/20">
      <CardHeader className="space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

interface FeatureSectionProps {
  title: string;
  description: string;
  features: FeatureCardProps[];
}

export function FeatureSection({ title, description, features }: FeatureSectionProps) {
  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Planning made simple</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        <p className="text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
