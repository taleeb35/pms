import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { detectCountry, type Country } from "@/lib/detectCountry";

interface GeoLocationContextType {
  country: Country;
  isLoading: boolean;
  setCountryManually: (country: Country) => void;
}

const GeoLocationContext = createContext<GeoLocationContextType>({
  country: "PK",
  isLoading: true,
  setCountryManually: () => {},
});

export const useGeoLocation = () => useContext(GeoLocationContext);

export const GeoLocationProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountry] = useState<Country>("PK");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detect = () => {
      // Check if user has manually set a country preference
      const savedCountry = localStorage.getItem("zonoir_country") as Country | null;
      if (savedCountry && ["PK", "US", "OTHER"].includes(savedCountry)) {
        setCountry(savedCountry);
        setIsLoading(false);
        return;
      }

      // Browser timezone: instant, private, no outside service.
      setCountry(detectCountry());
      setIsLoading(false);
    };

    detect();
  }, []);

  const setCountryManually = (newCountry: Country) => {
    setCountry(newCountry);
    localStorage.setItem("zonoir_country", newCountry);
  };

  return (
    <GeoLocationContext.Provider value={{ country, isLoading, setCountryManually }}>
      {children}
    </GeoLocationContext.Provider>
  );
};
