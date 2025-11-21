import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot",
  "Sargodha", "Bahawalpur", "Sukkur", "Larkana", "Hyderabad",
  "Mardan", "Mingora", "Abbottabad", "Dera Ghazi Khan", "Sahiwal",
  "Nawabshah", "Jhang", "Rahim Yar Khan", "Kasur", "Gujrat",
  "Sheikhupura", "Dera Ismail Khan", "Mirpur Khas", "Okara", "Chiniot",
  "Kamoke", "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Jacobabad",
  "Shikarpur", "Khanewal", "Hafizabad", "Kohat", "Muzaffargarh",
  "Khanpur", "Gojra", "Mandi Burewala", "Daska", "Vehari"
].sort();

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const CitySelect = ({ value, onValueChange, label = "City", required = false }: CitySelectProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder="Select a city" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {pakistanCities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
