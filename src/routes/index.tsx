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
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/assets/halo-template.js";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: templateBody }} />;
}
