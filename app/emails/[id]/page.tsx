import { getEmailById } from "@/lib/emails";
import { RawEmailView } from "@/components/RawEmailView";
import { Card } from "@heroui/card";
import { notFound } from "next/navigation";

export default function EmailPage({ params }: { params: { id: string } }) {
  const email = getEmailById(params.id);
  
  if (!email) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <Card className="border border-dark-border bg-dark-card p-6">
        <RawEmailView
          topic={email.topic}
          sender={email.sender}
          date={email.date}
          html={email.html}
        />
      </Card>
    </div>
  );
}
