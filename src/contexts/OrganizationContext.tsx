import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  loading: true,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganization = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's organization from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (roleError || !roleData) {
        console.error("Error fetching user role:", roleError);
        setLoading(false);
        return;
      }

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations" as any)
        .select("*")
        .eq("id", (roleData as any).organization_id)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
      } else if (orgData) {
        setOrganization(orgData as any as Organization);
      }

      setLoading(false);
    };

    fetchOrganization();
  }, [navigate]);

  return (
    <OrganizationContext.Provider value={{ organization, loading }}>
      {children}
    </OrganizationContext.Provider>
  );
};
