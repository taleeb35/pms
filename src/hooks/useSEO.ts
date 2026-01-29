import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogUrl,
  ogType = "website",
  ogImage = "https://zonoir.com/og-image.png",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    // Set title immediately
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Set description
    setMeta("description", description);

    // Set keywords if provided
    if (keywords) {
      setMeta("keywords", keywords);
    }

    // Set Open Graph tags
    setMeta("og:title", ogTitle || title, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:type", ogType, true);
    if (ogUrl) setMeta("og:url", ogUrl, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:site_name", "Zonoir", true);
    setMeta("og:locale", "en_PK", true);

    // Set Twitter Card tags
    setMeta("twitter:card", twitterCard);
    setMeta("twitter:site", "@zonoir");
    setMeta("twitter:title", twitterTitle || ogTitle || title);
    setMeta("twitter:description", twitterDescription || ogDescription || description);
    setMeta("twitter:image", twitterImage || ogImage);

    // Set canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalUrl);
    }

    // Set JSON-LD structured data
    if (jsonLd) {
      const existingScript = document.querySelector('script[data-seo-jsonld]');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Reset title to default
      document.title = "Zonoir - Clinic Management Software";
      
      // Remove JSON-LD script
      const jsonLdScript = document.querySelector('script[data-seo-jsonld]');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogUrl, ogType, ogImage, twitterCard, twitterTitle, twitterDescription, twitterImage, jsonLd]);
};
