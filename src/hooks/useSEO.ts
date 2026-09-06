import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

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
  jsonLd?: object | object[];
  breadcrumbs?: BreadcrumbItem[];
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://zonoir.com/og-image.png";

export const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogUrl,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd,
  breadcrumbs,
  noIndex,
}: SEOProps) => {
  useEffect(() => {
    document.title = title;

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

    setMeta("description", description);
    setMeta(
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );

    if (keywords) {
      setMeta("keywords", keywords);
    }

    setMeta("og:title", ogTitle || title, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:type", ogType, true);
    if (ogUrl) setMeta("og:url", ogUrl, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:site_name", "Zonoir", true);
    setMeta("og:locale", "en_PK", true);

    setMeta("twitter:card", twitterCard);
    setMeta("twitter:site", "@zonoir");
    setMeta("twitter:title", twitterTitle || ogTitle || title);
    setMeta("twitter:description", twitterDescription || ogDescription || description);
    setMeta("twitter:image", twitterImage || ogImage);

    // Canonical + hreflang
    const setLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        if (hreflang) el.setAttribute("hreflang", hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    if (canonicalUrl) {
      setLink("canonical", canonicalUrl);
      // Remove old hreflang alternates we set previously, then re-add
      document
        .querySelectorAll('link[rel="alternate"][data-seo-hreflang]')
        .forEach((n) => n.remove());
      (["en-pk", "en", "x-default"] as const).forEach((lang) => {
        const el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", lang);
        el.setAttribute("href", canonicalUrl);
        el.setAttribute("data-seo-hreflang", "true");
        document.head.appendChild(el);
      });
    }

    // JSON-LD (supports array)
    document
      .querySelectorAll('script[data-seo-jsonld]')
      .forEach((n) => n.remove());

    const blocks: object[] = [];
    if (jsonLd) {
      if (Array.isArray(jsonLd)) blocks.push(...jsonLd);
      else blocks.push(jsonLd);
    }
    if (breadcrumbs && breadcrumbs.length > 0) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      });
    }
    blocks.forEach((block) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    });

    return () => {
      document.title = "Zonoir - Clinic Management Software";
      document
        .querySelectorAll('script[data-seo-jsonld]')
        .forEach((n) => n.remove());
      document
        .querySelectorAll('link[rel="alternate"][data-seo-hreflang]')
        .forEach((n) => n.remove());
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogUrl,
    ogType,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    jsonLd,
    breadcrumbs,
    noIndex,
  ]);
};
