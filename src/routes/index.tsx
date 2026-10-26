import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import templateBody from "../halo-template-body.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mary Gomes | Salão de Beleza" },
      {
        name: "description",
        content:
          "Conheça os serviços e valores do salão de Mary Gomes. Escolha seu serviço e fale diretamente com Mary pelo WhatsApp.",
      },
      { property: "og:title", content: "Mary Gomes | Salão de Beleza" },
      {
        property: "og:description",
        content: "Serviços e valores do salão de Mary Gomes. Agende diretamente pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useEffect(() => {
    // Start the original HALO template runtime only after its original markup is in the DOM.
    document.documentElement.classList.add("js", "estilos-ok");
    const portfolioEffects = document.createElement("script");
    portfolioEffects.type = "module";
    portfolioEffects.src = "/assets/mary-portfolio-effects.js?v=20261026-2";
    document.body.appendChild(portfolioEffects);
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/assets/halo-template.js?v=mary-reference-20261026-2";
    document.body.appendChild(script);

    const handleGalleryFilter = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("[data-filter]");
      if (!button) return;

      const selected = button.dataset.filter;
      document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((filter) => {
        const isSelected = filter === button;
        filter.classList.toggle("is-active", isSelected);
        filter.setAttribute("aria-pressed", String(isSelected));
      });
      document.querySelectorAll<HTMLElement>(".mary-work[data-tipo]").forEach((work) => {
        work.hidden = selected !== "todos" && work.dataset.tipo !== selected;
      });
    };

    document.addEventListener("click", handleGalleryFilter);
    return () => {
      document.removeEventListener("click", handleGalleryFilter);
      script.remove();
      portfolioEffects.remove();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: templateBody }} />;
}
