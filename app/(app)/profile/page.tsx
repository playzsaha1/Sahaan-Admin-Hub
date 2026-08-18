import { PageHeader } from "@/components/app-shell";
import { Card, Field, SubmitButton } from "@/components/ui";
import { saveProfile } from "@/app/actions/profile";
import { requireVerifiedSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const { user } = await requireVerifiedSession("/profile");

  return (
    <>
      <PageHeader title="My Profile" description="Your public V1 profile shows only your full name and job or skill." />
      <Card className="max-w-2xl">
        <form action={saveProfile} className="grid gap-4">
          <Field label="Full name" name="fullName" required defaultValue={user?.fullName ?? ""} />
          <Field label="Job / Skill" name="jobSkill" required defaultValue={user?.jobSkill ?? ""} />
          <SubmitButton>Save profile</SubmitButton>
        </form>
      </Card>
    </>
  );
}
