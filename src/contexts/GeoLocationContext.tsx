import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Country = "PK" | "US" | "OTHER";

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
    const detectCountry = async () => {
      // Check if user has manually set a country preference
      const savedCountry = localStorage.getItem("zonoir_country") as Country | null;
      if (savedCountry && ["PK", "US", "OTHER"].includes(savedCountry)) {
        setCountry(savedCountry);
        setIsLoading(false);
        return;
      }

      try {
        // Using ipapi.co for geo-location (free tier available)
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        if (data.country_code === "US") {
          setCountry("US");
        } else if (data.country_code === "PK") {
          setCountry("PK");
        } else {
          setCountry("OTHER");
        }
      } catch (error) {
        console.error("Failed to detect location:", error);
        // Default to PK on error
        setCountry("PK");
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
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
