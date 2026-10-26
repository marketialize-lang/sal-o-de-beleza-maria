import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import templateBody from "../halo-template-body.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mary Gomes | Beleza e cuidado" },
      {
        name: "description",
        content:
          "Conheça os serviços de beleza de Mary Gomes, profissional com 30 anos de experiência. Veja os valores e fale pelo WhatsApp.",
      },
      { property: "og:title", content: "Mary Gomes | Beleza e cuidado" },
      {
        property: "og:description",
        content: "Serviços e valores do salão de Mary Gomes. 30 anos de experiência.",
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
