import CTABand from "@/components/medical/shared/CTABand";
import { Clock, Video, UserCheck } from "lucide-react";

export default function GuidanceSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-24 bg-paper-bright border-t border-hairline">
      <div className="max-w-ledger mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="text-h2 text-text-main mb-6">Expert 1-to-1 Guidance</h2>
            <p className="text-body-large text-text-muted mb-8">
              Data is powerful, but strategy is what secures the seat. Our experts help you interpret the numbers, define your preference order, and avoid costly mistakes in the choice-filling rounds.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shrink-0 border border-hairline">
                  <Video className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-h4 text-text-main mb-1">Face-to-Face Video Sessions</h4>
                  <p className="text-small text-text-muted">Clear your doubts directly with experienced counsellors.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shrink-0 border border-hairline">
                  <UserCheck className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-h4 text-text-main mb-1">Personalised Strategy</h4>
                  <p className="text-small text-text-muted">Tailored preference lists based on your specific rank and category.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shrink-0 border border-hairline">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-h4 text-text-main mb-1">Round-by-Round Support</h4>
                  <p className="text-small text-text-muted">Guidance through R1, R2, and Mop-Up rounds until you secure a seat.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-paper border border-hairline rounded-[var(--radius-lg)] p-8 shadow-card text-center">
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" alt="Counselling Session" className="w-full h-48 object-cover rounded-[var(--radius-sm)] mb-6 grayscale hover:grayscale-0 transition-all duration-500" />
            <h3 className="text-h3 text-text-main mb-2">Book a Session</h3>
            <p className="text-body text-text-muted mb-6">Talk to our experts and map out your admission strategy today.</p>
          </div>
        </div>
        
        <CTABand source="guidance" compact />
      </div>
    </section>
  );
}
