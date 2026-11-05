import AppHeader from "@/components/AppHeader";
import ProfileForm from "@/components/ProfileForm";

export default function PerfilPage() {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <ProfileForm />
      </main>
    </>
  );
}
