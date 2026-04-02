import { useState } from "react";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const [lang, setLang] = useState<"ES" | "EN">("ES");

  return (
    <button
      onClick={() => setLang(lang === "ES" ? "EN" : "ES")}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      <Globe className="w-3 h-3" />
      {lang}
    </button>
  );
}
