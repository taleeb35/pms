import type { ReactElement } from "react";
import { cloneElement } from "react";
import { useParams } from "react-router-dom";

// Remounts the page when the :id in the address changes (e.g. jumping from one visit to another),
// so nothing typed on one record is carried over to the next.
export default function KeyedByParam({ children, param = "id" }: { children: ReactElement; param?: string }) {
  const params = useParams();
  return cloneElement(children, { key: params[param] || "none" });
}
