import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Star, GraduationCap, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import Button from "./Button";
import { Label } from "./Label";
import { Switch } from "./Switch";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";

interface JourneyPlan {
  name: string;
  subtitle: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

interface UserJourneyPricingProps {
  plans: JourneyPlan[];
  title?: string;
  description?: string;
}

export function UserJourneyPricing({
  plans,
  title = "Built for Every Stage of Your Tech Journey",
  description = "Whether you're starting out, advancing your career, or building a team, we have the tools and community to help you succeed.",
}: UserJourneyPricingProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setShowFeatures(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#3b82f6", // blue
          "#8b5cf6", // purple
          "#10b981", // green
          "#f59e0b", // amber
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
            {title}
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto whitespace-pre-line">
            {description}
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-3">
            <span className="text-gray-300 font-medium">Overview</span>
            <Label>
              <Switch
                ref={switchRef}
                checked={showFeatures}
                onCheckedChange={handleToggle}
                className="relative"
              />
            </Label>
            <span className="text-gray-300 font-medium">
              Detailed Features <span className="text-blue-400">(Interactive)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={
                  isDesktop
                    ? {
                        y: plan.isPopular ? -20 : 0,
                        opacity: 1,
                        x: index === 2 ? -10 : index === 0 ? 10 : 0,
                        scale: plan.isPopular ? 1.05 : 1.0,
                      }
                    : { y: 0, opacity: 1 }
                }
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                  damping: 30,
                  delay: index * 0.2,
                }}
                className={cn(
                  "rounded-2xl border-2 p-8 bg-gray-800 text-center relative",
                  plan.isPopular ? plan.borderColor : "border-gray-700",
                  "flex flex-col min-h-[400px]",
                  plan.isPopular && "shadow-2xl"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-6 rounded-full flex items-center shadow-lg">
                    <Star className="text-white h-4 w-4 fill-current mr-2" />
                    <span className="text-white font-semibold text-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  {/* Icon and Title */}
                  <div className="mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                      plan.bgColor
                    )}>
                      <Icon className={cn("h-8 w-8", plan.iconColor)} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: showFeatures ? 1 : 0.7, 
                            x: showFeatures ? 0 : -20 
                          }}
                          transition={{ delay: showFeatures ? idx * 0.1 : 0 }}
                        >
                          <Check className={cn(
                            "h-5 w-5 mt-0.5 flex-shrink-0",
                            plan.iconColor
                          )} />
                          <span className="text-gray-300 text-left text-sm">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Link to={plan.href}>
                      <Button
                        className={cn(
                          "w-full py-3 font-semibold text-lg transition-all duration-300",
                          plan.isPopular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                        )}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                    <p className="mt-4 text-xs text-gray-400">
                      {plan.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Tech Journey?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of students, professionals, and companies who are already building their future in tech. 
              Your journey to success starts with a single step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="lg" className="border-gray-500 text-gray-300 hover:bg-gray-700 px-8">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 