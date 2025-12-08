import HousingInfoForm from "@/components/dashboard/HousingInfoForm";

export default function Profil() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Informations logement</h1>
        <p className="text-muted-foreground mt-1">
          Complétez vos informations pour recevoir des offres personnalisées.
        </p>
      </div>
      
      <HousingInfoForm />
    </div>
  );
}
