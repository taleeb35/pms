import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Country = "PK" | "US" | "OTHER";

interface GeoLocationContextType {
  country: Country;
  isLoading: boolean;
}

const GeoLocationContext = createContext<GeoLocationContextType>({
  country: "PK",
  isLoading: true,
});

export const useGeoLocation = () => useContext(GeoLocationContext);

export const GeoLocationProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountry] = useState<Country>("PK");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
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

  return (
    <GeoLocationContext.Provider value={{ country, isLoading }}>
      {children}
    </GeoLocationContext.Provider>
  );
};
