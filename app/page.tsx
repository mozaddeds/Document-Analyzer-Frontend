import { Roboto_Condensed } from "next/font/google";
import Squares from "../components/Squares";
import FileInput from "../components/Input/FileInput";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <div className="w-full min-h-screen relative">

      {/* Fixed header section */}
      <div className="sticky top-0 z-10 bg-linear-to-b from-gray-900 to-transparent pb-6">
        <div className="container mx-auto px-4 pt-8">
          <h1 className={`text-4xl mb-4 text-white text-center ${robotoCondensed.className}`}>
            Document Analyzer
          </h1>
          <h4 className="max-w-2xl mx-auto text-center text-white/90 text-sm mb-6">
            Upload any PDF document and get an AI-powered summary instantly.
            Perfect for quickly understanding research papers, reports, or resumes.
          </h4>

          {/* File input stays here */}
          <div className="flex justify-center">
            <FileInput />
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="container mx-auto px-4 pb-8">
        {/* Results render here, can scroll independently */}
      </div>
    </div>
  );
}